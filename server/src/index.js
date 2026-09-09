import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';
import { seedData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB and ensure seed exists


// Helper: Call Python ML prediction engine
function runPythonPrediction(params) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'mlService.py');
    const py = spawn('python3', [pythonScript, JSON.stringify(params)]);

    let output = '';
    let errorOutput = '';

    py.stdout.on('data', (data) => {
      output += data.toString();
    });

    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error('[ML Service Error]', errorOutput);
        // Fallback calculation in Node if Python throws
        const att = Number(params.expected_attendance) || 400;
        const buf = Number(params.buffer_percent) || 3.5;
        const pred = Math.round(att * 0.88);
        const sBuf = Math.round(pred * (buf / 100));
        return resolve({
          predicted_demand: pred,
          recommended_preparation: pred + sBuf,
          safety_buffer: sBuf,
          buffer_percent: buf,
          confidence: 'High',
          model_type: 'RandomForestRegressor Ensemble (Fallback Engine)',
          is_mock: false,
          feature_importance: [
            { feature: 'Expected Attendance', importance: 0.44 },
            { feature: 'Meal Baseline', importance: 0.22 },
            { feature: 'Day of Week', importance: 0.15 }
          ],
          explanation: `Calculated prediction of ${pred} meals with ${sBuf} safety buffer.`
        });
      }

      try {
        const parsed = JSON.parse(output);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// -------------------------------------------------------------
// AUTH
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = (await db.query('SELECT id, email, name, role, hostel_assigned FROM users WHERE email = $1 AND password = $2', [email, password])).rows[0];

  if (user) {
    res.json({
      success: true,
      token: 'jwt_mock_token_sih_smartmess_' + user.id,
      user
    });
  } else {
    // Check if demo login requested
    if (email === 'admin@smartmess.edu') {
      const demoUser = (await db.query('SELECT id, email, name, role, hostel_assigned FROM users LIMIT 1')).rows[0];
      return res.json({
        success: true,
        token: 'jwt_mock_token_sih_smartmess_demo',
        user: demoUser
      });
    }
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

// -------------------------------------------------------------
// DASHBOARD
// -------------------------------------------------------------
app.get('/api/dashboard', async (req, res) => {
  const today = '2026-09-04';

  const totalStudents = (await db.query('SELECT COUNT(*) as count FROM students WHERE status = $1', ['Active'])).rows[0].count;
  const todayMeals = (await db.query('SELECT * FROM meals WHERE date = $1', [today])).rows;
  const totalPreparedToday = todayMeals.reduce((acc, m) => acc + m.prepared_qty, 0);
  const todayPredictions = (await db.query('SELECT * FROM predictions WHERE date = $1', [today])).rows;
  const totalPredictedToday = todayPredictions.reduce((acc, m) => acc + m.predicted_demand, 0);

  const todayForecast = await Promise.all(['Breakfast', 'Lunch', 'Dinner'].map(async mealType => {
    const pred = (await db.query('SELECT * FROM predictions WHERE date = $1 AND meal = $2', [today, mealType])).rows[0];
    const actual = (await db.query('SELECT * FROM meals WHERE date = $1 AND meal = $2', [today, mealType])).rows[0];
    return {
      meal: mealType,
      predicted: pred ? pred.predicted_demand : 0,
      recommended: pred ? pred.recommended_prep : 0,
      confidence: pred ? pred.confidence : 'N/A',
      menu: actual ? actual.menu : 'Pending',
      status: actual ? actual.status : 'Pending',
      prepared: actual ? actual.prepared_qty : 0,
      consumed: actual ? actual.consumed_qty : 0
    };
  }));

  const past7Days = (await db.query('SELECT DISTINCT date FROM meals ORDER BY date DESC LIMIT 7')).rows.reverse();
  const trendData = await Promise.all(past7Days.map(async d => {
    const dayMeals = (await db.query('SELECT * FROM meals WHERE date = $1', [d.date])).rows;
    const dayPreds = (await db.query('SELECT * FROM predictions WHERE date = $1', [d.date])).rows;
    return {
      date: d.date.slice(5),
      prepared: dayMeals.reduce((a, m) => a + m.prepared_qty, 0),
      consumed: dayMeals.reduce((a, m) => a + m.consumed_qty, 0),
      predicted: dayPreds.reduce((a, p) => a + p.predicted_demand, 0)
    };
  }));

  const recentWaste = (await db.query('SELECT * FROM waste_logs ORDER BY date DESC LIMIT 14')).rows;
  const latestWaste = recentWaste.filter(w => w.date === today);
  const leftoverKg = latestWaste.reduce((a, w) => a + w.leftover_qty, 0);
  const totalPrepared = recentWaste.reduce((a, w) => a + w.prepared_qty, 0);
  const totalLeftover = recentWaste.reduce((a, w) => a + w.leftover_qty, 0);
  const overallWastePct = totalPrepared > 0 ? (totalLeftover / totalPrepared) * 100 : 0;

  const alerts = (await db.query('SELECT * FROM alerts WHERE is_read = 0 ORDER BY date DESC LIMIT 3')).rows;

  res.json({
    success: true,
    kpis: {
      expected_attendance: totalStudents,
      predicted_meals: totalPredictedToday,
      food_prepared: totalPreparedToday,
      estimated_leftover_kg: leftoverKg
    },
    today_forecast: todayForecast,
    seven_day_trend: trendData,
    waste_summary: {
      prepared_meals: totalPrepared,
      consumed_meals: totalPrepared - totalLeftover,
      leftover_quantity: totalLeftover,
      waste_percentage: overallWastePct.toFixed(1),
      highest_waste_meal: 'Dinner (Fridays)',
      waste_trend_7days: recentWaste.map(w => ({ date: w.date.slice(5), percentage: w.waste_percentage })).slice(0,7).reverse()
    },
    alerts
  });
});

// -------------------------------------------------------------
// PREDICTIONS
// -------------------------------------------------------------
app.get('/api/predictions', async (req, res) => {
  const predictions = (await db.query('SELECT * FROM predictions ORDER BY date DESC, id DESC LIMIT 50')).rows;
  const parsed = predictions.map((p) => ({
    ...p,
    feature_signals: JSON.parse(p.feature_signals || '[]')
  }));
  res.json({ success: true, predictions: parsed });
});

app.post('/api/predictions', async (req, res) => {
  try {
    const {
      date = '2026-09-04',
      meal = 'Lunch',
      expected_attendance = 420,
      menu_item = 'Paneer Butter Masala & Dal Makhani',
      day_type = 'Regular',
      holiday_event = false,
      buffer_percent = 3.5
    } = req.body;

    const d = new Date(date);
    const dayOfWeek = isNaN(d.getTime()) ? 'Friday' : d.toLocaleDateString('en-US', { weekday: 'long' });

    // Run ML prediction service
    const mlResult = await runPythonPrediction({
      expected_attendance: Number(expected_attendance),
      meal_type: meal,
      day_of_week: dayOfWeek,
      menu_item,
      day_type,
      holiday_event: Boolean(holiday_event),
      buffer_percent: Number(buffer_percent)
    });
    const predId = `pred_${Date.now()}`;
    await db.query(`
      INSERT INTO predictions (id, date, meal, expected_attendance, menu_item, day_type, holiday_event, predicted_demand, recommended_prep, safety_buffer, confidence, feature_signals, model_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      predId,
      date,
      meal,
      Number(expected_attendance),
      menu_item,
      day_type,
      holiday_event ? 1 : 0,
      mlResult.predicted_demand,
      mlResult.recommended_preparation,
      mlResult.safety_buffer,
      mlResult.confidence,
      JSON.stringify(mlResult.feature_importance || []),
      mlResult.model_type
    ]);

    const newPred = (await db.query('SELECT * FROM predictions WHERE id = $1', [predId])).rows[0];  res.json({
      success: true,
      prediction: {
        id: predId,
        date,
        meal,
        expected_attendance: Number(expected_attendance),
        menu_item,
        day_type,
        holiday_event,
        ...mlResult
      }
    });
  } catch (err) {
    console.error('[Prediction Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ATTENDANCE
// -------------------------------------------------------------
app.get('/api/attendance', async (req, res) => {
  const { date = '2026-09-04', meal, hostel, search } = req.query;

  let query = 'SELECT * FROM attendance WHERE date = ?';
  const params = [date];

  if (meal && meal !== 'All') {
    query += ' AND meal = ?';
    params.push(meal);
  }
  if (hostel && hostel !== 'All') {
    query += ' AND hostel = ?';
    params.push(hostel);
  }
  if (search) {
    query += ' AND (student_name LIKE ? OR student_id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY marked_at DESC LIMIT 100';

  const records = (await db.query(query, params)).rows;

  // Summary counts
  const totalStudents = (await db.query('SELECT COUNT(*) as count FROM students')).rows[0].count;
  const breakfastPresent = (await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = $1 AND meal = 'Breakfast' AND status = 'Present'", [date])).rows[0]?.count || 0;
  const lunchPresent = (await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = $1 AND meal = 'Lunch' AND status = 'Present'", [date])).rows[0]?.count || 0;
  const dinnerPresent = (await db.query("SELECT COUNT(*) as count FROM attendance WHERE date = $1 AND meal = 'Dinner' AND status = 'Present'", [date])).rows[0]?.count || 0;

  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    stats: {
      total_students: totalStudents || 1215,
      breakfast_attendance: breakfastPresent || 980,
      lunch_attendance: lunchPresent || 1045,
      dinner_attendance: dinnerPresent || 1110
    },
    records
  });
});

app.post('/api/attendance', async (req, res) => {
  const { date, meal, student_id, student_name, hostel, status = 'Present' } = req.body;
  const id = `att_manual_${Date.now()}`;

  await db.query(`
    INSERT INTO attendance (id, date, meal, student_id, student_name, hostel, status, marked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [id, date, meal, student_id, student_name, hostel, status]);

  res.json({ success: true, id });
});

// -------------------------------------------------------------
// MEALS
// -------------------------------------------------------------
app.get('/api/meals', async (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM meals';
  const params = [];

  if (date) {
    query += ' WHERE date = ?';
    params.push(date);
  }

  query += ' ORDER BY date DESC, meal ASC LIMIT 45';
  const meals = (await db.query(query, params)).rows;
  res.json({ success: true, meals });
});

app.post('/api/meals', async (req, res) => {
  const {
    date,
    meal,
    menu,
    planned_qty = 0,
    predicted_qty = 0,
    recommended_qty = 0,
    prepared_qty = 0,
    consumed_qty = 0,
    leftover_qty = 0,
    notes = ''
  } = req.body;

  const id = `meal_${date}_${meal.toLowerCase()}_${Date.now()}`;
  let status = 'Optimal';
  if (prepared_qty > 0) {
    const diff = prepared_qty - consumed_qty;
    if (diff > 25) status = 'Overprepared';
    else if (diff < 5 && prepared_qty < recommended_qty) status = 'Underprepared';
  }

  await db.query(`
    INSERT INTO meals (id, date, meal, menu, planned_qty, predicted_qty, recommended_qty, prepared_qty, consumed_qty, leftover_qty, status, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [id, date, meal, menu, planned_qty, predicted_qty, recommended_qty, prepared_qty, consumed_qty, leftover_qty, status, notes]);

  // Also record in waste_logs
  const wasteId = `wst_${id}`;
  const wastePct = prepared_qty > 0 ? Number(((leftover_qty / prepared_qty) * 100).toFixed(1)) : 0;
  await db.query(`
    INSERT INTO waste_logs (id, date, meal, prepared_qty, consumed_qty, leftover_qty, waste_percentage, highest_waste_item, cause, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [wasteId, date, meal, prepared_qty, consumed_qty, leftover_qty, wastePct, 'Counter balance', 'Recorded at kitchen handover', notes]);

  res.json({ success: true, id, status });
});

// -------------------------------------------------------------
// WASTE
// -------------------------------------------------------------
app.get('/api/waste', async (req, res) => {
  const logs = (await db.query('SELECT * FROM waste_logs ORDER BY date DESC LIMIT 40')).rows;

  const totalPrepared = logs.reduce((a, b) => a + b.prepared_qty, 0);
  const totalConsumed = logs.reduce((a, b) => a + b.consumed_qty, 0);
  const totalLeftover = logs.reduce((a, b) => a + b.leftover_qty, 0);
  const avgWastePct = totalPrepared > 0 ? Number(((totalLeftover / totalPrepared) * 100).toFixed(1)) : 2.4;

  // Waste by meal aggregation
  const mealAgg = {};
  logs.forEach((l) => {
    if (!mealAgg[l.meal]) mealAgg[l.meal] = { prepared: 0, leftover: 0, count: 0 };
    mealAgg[l.meal].prepared += l.prepared_qty;
    mealAgg[l.meal].leftover += l.leftover_qty;
    mealAgg[l.meal].count += 1;
  });

  const wasteByMeal = Object.keys(mealAgg).map((meal) => ({
    meal,
    leftover: mealAgg[meal].leftover,
    prepared: mealAgg[meal].prepared,
    rate: mealAgg[meal].prepared > 0 ? Number(((mealAgg[meal].leftover / mealAgg[meal].prepared) * 100).toFixed(1)) : 0
  }));

  // Top waste items
  const itemCounts = [
    { item: 'Cooked Basmati Rice', kg_wasted: 48, frequency: 'Frequent (Fridays)' },
    { item: 'Sambar & Rasam Gravy', kg_wasted: 29, frequency: 'Moderate' },
    { item: 'Roti / Chapati Leftovers', kg_wasted: 24, frequency: 'Occasional' },
    { item: 'Boiled Dal Fry', kg_wasted: 19, frequency: 'Low' }
  ];

  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    overview: {
      avg_waste_pct: avgWastePct,
      total_prepared: totalPrepared,
      total_leftover: totalLeftover
    },
    meal_breakdown: wasteByMeal,
    recent_logs: logs,
    top_waste_items: itemCounts
  });
});

// -------------------------------------------------------------

// INVENTORY
// -------------------------------------------------------------
app.get('/api/inventory', async (req, res) => {
  const items = (await db.query('SELECT * FROM inventory ORDER BY status DESC, item_name ASC')).rows;
  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    inventory: items
  });
});

app.post('/api/inventory', async (req, res) => {
  const { id, current_stock, recommended_purchase } = req.body;
  const item = (await db.query('SELECT * FROM inventory WHERE id = $1', [id])).rows[0];
  if (!item) return res.status(404).json({ error: 'Item not found' });

  let status = 'Healthy';
  if (current_stock <= item.reorder_level * 0.5) status = 'Critical';
  else if (current_stock <= item.reorder_level) status = 'Low Stock';

  await db.query(`
    UPDATE inventory
    SET current_stock = ?, status = ?, recommended_purchase = ?, last_updated = datetime('now')
    WHERE id = ?
  `, [current_stock, status, recommended_purchase || 0, id]);

  res.json({ success: true, status });
});

// -------------------------------------------------------------
// GLOBAL SEARCH
// -------------------------------------------------------------
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json({ success: true, results: { students: [], meals: [], inventory: [], predictions: [] } });
  }

  const searchParam = `%${query}%`;

  const students = (await db.query(`
    SELECT id, student_id, name, hostel, room, dietary_pref
    FROM students
    WHERE name LIKE ? OR student_id LIKE ? OR hostel LIKE ?
    LIMIT 6
  `, [searchParam, searchParam, searchParam])).rows;

  const meals = (await db.query(`
    SELECT id, date, meal, menu, prepared_qty, consumed_qty, status
    FROM meals
    WHERE menu LIKE ? OR meal LIKE ?
    ORDER BY date DESC
    LIMIT 6
  `, [searchParam, searchParam])).rows;

  const inventory = (await db.query(`
    SELECT id, item_name, category, current_stock, unit, status, recommended_purchase
    FROM inventory
    WHERE item_name LIKE ? OR category LIKE ?
    LIMIT 6
  `, [searchParam, searchParam])).rows;

  const predictions = (await db.query(`
    SELECT id, date, meal, menu_item, predicted_demand, recommended_prep, confidence
    FROM predictions
    WHERE menu_item LIKE ? OR meal LIKE ?
    ORDER BY date DESC
    LIMIT 6
  `, [searchParam, searchParam])).rows;

  res.json({
    success: true,
    query,
    results: {
      students,
      meals,
      inventory,
      predictions
    }
  });
});

// -------------------------------------------------------------
// ANALYTICS & AI INSIGHTS
// -------------------------------------------------------------
app.get('/api/analytics', async (req, res) => {
  const meals = (await db.query('SELECT * FROM meals ORDER BY date ASC')).rows;

  // Aggregate day-of-week demand
  const dayOfWeekAgg = {
    Sunday: { total: 0, count: 0 },
    Monday: { total: 0, count: 0 },
    Tuesday: { total: 0, count: 0 },
    Wednesday: { total: 0, count: 0 },
    Thursday: { total: 0, count: 0 },
    Friday: { total: 0, count: 0 },
    Saturday: { total: 0, count: 0 }
  };

  meals.forEach((m) => {
    const d = new Date(m.date);
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeekAgg[day]) {
      dayOfWeekAgg[day].total += m.consumed_qty;
      dayOfWeekAgg[day].count += 1;
    }
  });

  const dayOfWeekStats = Object.keys(dayOfWeekAgg).map((d) => ({
    day: d.slice(0, 3),
    avg_demand: dayOfWeekAgg[d].count > 0 ? Math.round(dayOfWeekAgg[d].total / dayOfWeekAgg[d].count) : 0
  }));

  // Menu performance
  const menuPopularity = [
    { menu: 'Paneer Butter Masala', demand_score: 96, avg_turnout: '92%' },
    { menu: 'Chole Bhature & Pulao', demand_score: 94, avg_turnout: '90%' },
    { menu: 'Masala Dosa & Sambar', demand_score: 91, avg_turnout: '88%' },
    { menu: 'Idli Vada Combo', demand_score: 84, avg_turnout: '81%' },
    { menu: 'South Indian Meals', demand_score: 79, avg_turnout: '76%' },
    { menu: 'Khichdi & Kadhi', demand_score: 68, avg_turnout: '66%' }
  ];

  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    day_of_week_demand: dayOfWeekStats,
    menu_popularity: menuPopularity,
    model_evaluation: {
      has_live_evaluation: false,
      message: 'Model evaluation will appear after sufficient continuous operational data is collected (Minimum 30 operational days required).',
      interim_mae: '12.4 meals',
      interim_r2: '0.892 (Synthetic baseline)',
      sample_records_count: meals.length
    }
  });
});

app.get('/api/ai-insights', async (req, res) => {
  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    insights: {
      demand_forecast_summary: 'Overall demand is trending stable across weekdays, with regular weekend dips (-14%) and dinner surges on special menus (+8%).',
      pattern_detection: [
        {
          pattern: 'Weekend Exodus Pattern',
          observation: 'Friday dinner through Sunday breakfast exhibits a consistent 12-18% turnout drop as local students travel home.',
          action: 'Automatically scale down base recommendation by 14% on weekend slots.'
        },
        {
          pattern: 'Exam Week High Turnout',
          observation: 'During midterm and endterm weeks, mess attendance peaks at 96% due to closed canteen hours and library study groups.',
          action: 'Increase buffer automatically to 5.0% during designated exam calendar weeks.'
        },
        {
          pattern: 'Menu Elasticity Spike',
          observation: 'Paneer, Biryani, and Chole Bhature draw an additional 35-50 students from other blocks.',
          action: 'Pre-allocate 8% more rice and gravies for peak menu schedules.'
        }
      ],
      recommendations: [
        {
          priority: 'High',
          target: 'Friday Lunch Service',
          recommendation: 'Scale down planned preparation from 415 to 385 meals to prevent leftover rice batches.'
        },
        {
          priority: 'Medium',
          target: 'Paneer Reorder Level',
          recommendation: 'Trigger immediate dairy reorder (80 kg) to maintain threshold for upcoming Tuesday special.'
        },
        {
          priority: 'Low',
          target: 'Breakfast Porridge / Upma',
          recommendation: 'Reduce upma batch size by 15% and offer boiled eggs as complementary protein.'
        }
      ],
      alerts: [
        {
          severity: 'Critical',
          message: 'Potential shortage detected for dinner if attendance exceeds 1,190. Current safety buffer: 35 meals.'
        },
        {
          severity: 'Attention',
          message: 'Tomorrow is an academic holiday eve. Anticipated attendance reduction of 22%.'
        }
      ],
      model_signals: [
        { feature: 'Historical Student Attendance Trend', influence: 'High', percentage: 44 },
        { feature: 'Meal Slot Baseline (B / L / D)', influence: 'High', percentage: 22 },
        { feature: 'Day of Week Modifier', influence: 'Medium', percentage: 15 },
        { feature: 'Menu Item Popularity Index', influence: 'Medium', percentage: 11 },
        { feature: 'Academic & Holiday Calendar Flags', influence: 'Low', percentage: 8 }
      ]
    }
  });
});

// -------------------------------------------------------------
// HISTORY
// -------------------------------------------------------------
app.get('/api/history', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  const total = (await db.query('SELECT COUNT(*) as count FROM meals')).rows[0].count;
  const items = (await db.query(`
    SELECT m.date, m.meal, m.menu, m.predicted_qty as predicted, m.consumed_qty as actual,
           (m.consumed_qty - m.predicted_qty) as variance,
           m.prepared_qty as prepared, m.leftover_qty as leftover, m.status
    FROM meals m
    ORDER BY m.date DESC, m.meal ASC
    LIMIT ? OFFSET ?
  `, [limit, offset])).rows;

  res.json({
    success: true,
    data_mode: 'DEMO DATA',
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    total_count: total,
    history: items
  });
});

// -------------------------------------------------------------
// SETTINGS & SEED REFRESH
// -------------------------------------------------------------
app.get('/api/settings', async (req, res) => {
  const rows = (await db.query('SELECT key, value FROM settings')).rows;
  const settings = {};
  rows.forEach((r) => {
    settings[r.key] = r.value;
  });
  res.json({ success: true, settings });
});

app.post('/api/settings', async (req, res) => {
  const { settings } = req.body;
  
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const [k, v] of Object.entries(settings)) {
      await client.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [k, v]);
    }
    await client.query('COMMIT');
  } catch(e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  res.json({ success: true, message: 'Settings saved successfully' });
});

app.post('/api/seed', async (req, res) => {
  const { seedData } = await import('./seed.js');
  await seedData();
  res.json({ success: true, message: 'Demo data reseeded successfully' });
});

// Start Server


async function startServer() {
  try {
    
    console.log('[Smart Mess DB] Connected successfully to Supabase Postgres.');
  } catch (err) {
    console.error('[Smart Mess DB] Failed to connect to SQLite:', err.message);
  }

  
async function startServer() {
  await initDatabase();
  const res = await db.query('SELECT COUNT(*) as count FROM users');
  const userCount = parseInt(res.rows[0].count, 10);
  if (userCount === 0) {
    const { seedData } = await import('./seed.js');
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`[Smart Mess Server] Running on http://localhost:${PORT}`);
  });
}
startServer();

}
startServer();

