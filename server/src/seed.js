import db, { initDatabase } from './db.js';

export async function seedData() {
  await initDatabase();

  console.log('[Seed] Seeding realistic hostel demo data...');

  // 1. Clear existing demo data
  db.exec(`
    DELETE FROM users;
    DELETE FROM students;
    DELETE FROM attendance;
    DELETE FROM meals;
    DELETE FROM predictions;
    DELETE FROM waste_logs;
    DELETE FROM inventory;
    DELETE FROM alerts;
    DELETE FROM settings;
  `);

  // 2. Settings
  const insertSetting_sql = 'INSERT INTO settings (key, value) VALUES (?, ?)';
  db.prepare(insertSetting_sql).run('safety_buffer_percent', '3.5');
  db.prepare(insertSetting_sql).run('hostel_name', 'Aryabhata Central Dining Hall');
  db.prepare(insertSetting_sql).run('total_capacity', '1400');
  db.prepare(insertSetting_sql).run('current_registered_students', '1215');
  db.prepare(insertSetting_sql).run('mess_manager', 'Prof. R. Venkatesh / Dr. K. Sharma');
  db.prepare(insertSetting_sql).run('active_academic_term', 'Autumn Semester 2026');

  // 3. User
  const insertUser_sql = `
    INSERT INTO users (id, email, password, name, role, hostel_assigned)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.prepare(insertUser_sql).run('usr_admin_1', 'admin@smartmess.edu', 'admin123', 'Chief Warden / Mess Manager', 'Admin', 'Aryabhata Central Dining Hall');

  // 4. Students
  const insertStudent_sql = `
    INSERT INTO students (id, student_id, name, hostel, room, dietary_pref, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const studentNames = [
    ['STU-2024-001', 'Aarav Sharma', 'Aryabhata North', 'A-204', 'Veg'],
    ['STU-2024-002', 'Aditi Verma', 'Kalpana Chawla', 'B-108', 'Standard'],
    ['STU-2024-003', 'Rohan Iyer', 'Ramanujan South', 'C-312', 'Veg'],
    ['STU-2024-004', 'Sneha Patel', 'Kalpana Chawla', 'A-402', 'Veg'],
    ['STU-2024-005', 'Vikramaditya Rao', 'Sarabhai West', 'D-115', 'Standard'],
    ['STU-2024-006', 'Pooja Reddy', 'Kalpana Chawla', 'C-209', 'Standard'],
    ['STU-2024-007', 'Karan Mehra', 'Aryabhata North', 'A-310', 'Standard'],
    ['STU-2024-008', 'Meera Nambiar', 'Kalpana Chawla', 'B-305', 'Veg'],
    ['STU-2024-009', 'Nikhil Saxena', 'Ramanujan South', 'B-119', 'Standard'],
    ['STU-2024-010', 'Ananya Gupta', 'Kalpana Chawla', 'A-102', 'Veg'],
    ['STU-2024-011', 'Devansh Joshi', 'Sarabhai West', 'C-414', 'Standard'],
    ['STU-2024-012', 'Tanvi Kulkarni', 'Kalpana Chawla', 'B-211', 'Veg'],
    ['STU-2024-013', 'Siddharth Nair', 'Aryabhata North', 'A-105', 'Standard'],
    ['STU-2024-014', 'Isha Deshmukh', 'Kalpana Chawla', 'D-203', 'Veg'],
    ['STU-2024-015', 'Arjun Banerjee', 'Ramanujan South', 'A-218', 'Standard'],
    ['STU-2024-016', 'Riya Chhabra', 'Kalpana Chawla', 'C-101', 'Standard'],
    ['STU-2024-017', 'Gautam Menon', 'Sarabhai West', 'B-408', 'Standard'],
    ['STU-2024-018', 'Divya Krishnan', 'Kalpana Chawla', 'A-309', 'Veg'],
    ['STU-2024-019', 'Harsh Vardhan', 'Aryabhata North', 'B-112', 'Standard'],
    ['STU-2024-020', 'Kavya Soni', 'Kalpana Chawla', 'C-314', 'Veg'],
    ['STU-2024-021', 'Manish Pandey', 'Ramanujan South', 'D-102', 'Standard'],
    ['STU-2024-022', 'Priyanka Das', 'Kalpana Chawla', 'B-402', 'Standard'],
    ['STU-2024-023', 'Rahul Chauhan', 'Sarabhai West', 'A-315', 'Standard'],
    ['STU-2024-024', 'Neha Bhat', 'Kalpana Chawla', 'D-111', 'Veg'],
    ['STU-2024-025', 'Varun Kapoor', 'Aryabhata North', 'C-202', 'Standard'],
    ['STU-2024-026', 'Shruti Mishra', 'Kalpana Chawla', 'A-215', 'Standard'],
    ['STU-2024-027', 'Ayush Tiwari', 'Ramanujan South', 'B-307', 'Veg'],
    ['STU-2024-028', 'Aniket Sen', 'Sarabhai West', 'C-118', 'Standard'],
    ['STU-2024-029', 'Swati Agarwal', 'Kalpana Chawla', 'D-304', 'Veg'],
    ['STU-2024-030', 'Pranav Mukherjee', 'Aryabhata North', 'A-407', 'Standard']
  ];

  studentsToSeed.forEach(async (s, idx) => {
    db.prepare(insertStudent_sql).run(`stu_${idx + 1}`, s[0], s[1], s[2], s[3], s[4], 'Active');
  });

  // 5. Historical Meals and Waste for the last 14 days
  const insertMeal_sql = `
    INSERT INTO meals (id, date, meal, menu, planned_qty, predicted_qty, recommended_qty, prepared_qty, consumed_qty, leftover_qty, status, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertWaste_sql = `
    INSERT INTO waste_logs (id, date, meal, prepared_qty, consumed_qty, leftover_qty, waste_percentage, highest_waste_item, cause, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertPrediction_sql = `
    INSERT INTO predictions (id, date, meal, expected_attendance, menu_item, day_type, holiday_event, predicted_demand, recommended_prep, safety_buffer, confidence, feature_signals, model_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const menus = {
    Breakfast: [
      'Idli, Medu Vada, Sambar & Coconut Chutney',
      'Poha with Roasted Peanuts & Sprouts',
      'Masala Dosa, Potato Masala & Chutney',
      'Aloo Paratha, Curd & Mint Pickle',
      'Upma with Vegetables & Filter Coffee',
      'Poori Bhaji & Sweet Kesari',
      'Bread Omelette / Veg Cutlet & Fruits'
    ],
    Lunch: [
      'Paneer Butter Masala, Dal Makhani, Jeera Rice & Roti',
      'Rajma Masala, Steamed Basmati Rice, Boondi Raita & Salad',
      'Chole Bhature, Pulao, Mixed Veg & Gulab Jamun',
      'Veg Biryani / Chicken Biryani, Mirchi Ka Salan & Raita',
      'South Indian Meals: Sambar, Rasam, Poriyal, Curd & Appalam',
      'Kadai Veg, Yellow Dal Tadka, Phulkas & Kheer',
      'Aloo Gobi Adraki, Dal Fry, Steamed Rice & Papad'
    ],
    Dinner: [
      'Shahi Paneer, Tawa Naan, Moong Dal Khichdi & Salad',
      'Egg Curry / Malai Kofta, Jeera Pulao & Roti',
      'Dum Aloo Kashmiri, Dal Tadka, Peas Pulao & Custard',
      'Pav Bhaji with Butter Pav & Masala Pulao',
      'Veg Fried Rice, Manchurian Gravy & Spring Rolls',
      'Mix Veg Curry, Phulkas, Steamed Rice & Rasam',
      'Palak Paneer, Dal Palak, Plain Rice & Chapati'
    ]
  };

  // Generate 14 days back up to today
  const today = new Date('2026-09-04T00:00:00Z');

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const dayType = isWeekend ? 'Weekend' : 'Regular';

    // 3 meals per day
    const mealConfigs = [
      { meal: 'Breakfast', baseExpected: 1215, turnoutRate: isWeekend ? 0.76 : 0.82, menuIdx: (i * 3) % 7 },
      { meal: 'Lunch', baseExpected: 1215, turnoutRate: isWeekend ? 0.81 : 0.88, menuIdx: (i * 3 + 1) % 7 },
      { meal: 'Dinner', baseExpected: 1215, turnoutRate: isWeekend ? 0.84 : 0.91, menuIdx: (i * 3 + 2) % 7 }
    ];

    for (const m of mealConfigs) {
      const menu = menus[m.meal][m.menuIdx];
      const expectedAttendance = m.baseExpected;
      // Calculate prediction with deterministic noise
      const varianceNoise = Math.sin(i * 1.5 + (m.meal === 'Lunch' ? 1 : 2)) * 12;
      const predictedDemand = Math.round(expectedAttendance * m.turnoutRate + varianceNoise);
      const safetyBuffer = Math.round(predictedDemand * 0.035);
      const recommendedPrep = predictedDemand + safetyBuffer;

      // Actual prepared is close to recommended prep
      const preparedQty = i === 0 ? recommendedPrep : Math.round(recommendedPrep + (i % 2 === 0 ? 3 : -2));
      // Actual consumed
      const actualConsumed = i === 0 ? Math.round(predictedDemand * 0.98) : Math.round(predictedDemand + (i % 3 === 0 ? 5 : -4));
      const leftoverQty = Math.max(0, preparedQty - actualConsumed);
      const wastePct = Number(((leftoverQty / preparedQty) * 100).toFixed(1));

      let status = 'Optimal';
      if (wastePct > 4.5) status = 'Overprepared';
      if (leftoverQty < 5 && i > 0) status = 'Underprepared';

      const mealId = `meal_${dateStr}_${m.meal.toLowerCase()}`;
      insertMeal.run(
        mealId,
        dateStr,
        m.meal,
        menu,
        recommendedPrep,
        predictedDemand,
        recommendedPrep,
        preparedQty,
        actualConsumed,
        leftoverQty,
        status,
        `Regular service for ${dayOfWeek}`,
        new Date().toISOString()
      );

      // Waste log
      const wasteId = `wst_${dateStr}_${m.meal.toLowerCase()}`;
      const highestItem = m.meal === 'Lunch' ? 'Rice & Dal' : m.meal === 'Breakfast' ? 'Sambar' : 'Roti';
      insertWaste.run(
        wasteId,
        dateStr,
        m.meal,
        preparedQty,
        actualConsumed,
        leftoverQty,
        wastePct,
        highestItem,
        wastePct > 4 ? 'Turnout drop on Friday afternoon' : 'Standard portion variance',
        `Logged at mess counter ${m.meal}`
      );

      // Prediction record
      const predId = `prd_${dateStr}_${m.meal.toLowerCase()}`;
      const featureSignals = JSON.stringify([
        { feature: 'Historical Attendance Pattern', weight: 0.44 },
        { feature: 'Meal Baseline', weight: 0.22 },
        { feature: 'Day of Week Modifier', weight: 0.15 },
        { feature: 'Menu Popularity Factor', weight: 0.11 },
        { feature: 'Academic Calendar', weight: 0.08 }
      ]);

      insertPrediction.run(
        predId,
        dateStr,
        m.meal,
        expectedAttendance,
        menu,
        dayType,
        0,
        predictedDemand,
        recommendedPrep,
        safetyBuffer,
        isWeekend ? 'Medium' : 'High',
        featureSignals,
        'RandomForestRegressor Ensemble'
      );
    }
  }

  // 6. Realistic Attendance records for today
  const insertAttendance_sql = `
    INSERT INTO attendance (id, date, meal, student_id, student_name, hostel, status, marked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const todayStr = '2026-09-04';
  for (const [idx, s] of studentNames.slice(0, 25).entries()) {
    insertAttendance.run(
      `att_${idx}_bk`,
      todayStr,
      'Breakfast',
      s[0],
      s[1],
      s[2],
      idx % 6 === 0 ? 'Absent' : 'Present',
      '2026-09-04 08:15:22'
    );
    insertAttendance.run(
      `att_${idx}_ln`,
      todayStr,
      'Lunch',
      s[0],
      s[1],
      s[2],
      idx % 9 === 0 ? 'Absent' : 'Present',
      '2026-09-04 12:45:10'
    );
  }

  // 7. Inventory Items linked to meal requirements
  const insertInventory_sql = `
    INSERT INTO inventory (id, item_name, category, current_stock, unit, daily_avg_consumption, reorder_level, status, recommended_purchase, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const inventoryItems = [
    ['inv_1', 'Basmati Rice (Long Grain)', 'Grains', 380, 'kg', 85, 150, 'Healthy', 0],
    ['inv_2', 'Sona Masoori Rice', 'Grains', 450, 'kg', 110, 180, 'Healthy', 0],
    ['inv_3', 'Toor Dal (Arhar)', 'Pulses', 65, 'kg', 35, 70, 'Low Stock', 120],
    ['inv_4', 'Moong Dal (Yellow)', 'Pulses', 110, 'kg', 25, 40, 'Healthy', 0],
    ['inv_5', 'Fresh Paneer', 'Dairy', 18, 'kg', 45, 30, 'Critical', 80],
    ['inv_6', 'Potatoes (Aloo)', 'Vegetables', 210, 'kg', 60, 80, 'Healthy', 0],
    ['inv_7', 'Onions (Pyaaz)', 'Vegetables', 95, 'kg', 50, 75, 'Healthy', 0],
    ['inv_8', 'Fresh Tomatoes', 'Vegetables', 40, 'kg', 40, 50, 'Low Stock', 90],
    ['inv_9', 'Sunflower Cooking Oil', 'Oils', 140, 'Liters', 30, 60, 'Healthy', 0],
    ['inv_10', 'Refined Wheat Flour (Atta)', 'Grains', 520, 'kg', 90, 150, 'Healthy', 0],
    ['inv_11', 'Fresh Milk (Double Toned)', 'Dairy', 55, 'Liters', 80, 60, 'Low Stock', 150],
    ['inv_12', 'Whole Spices & Garam Masala', 'Spices', 28, 'kg', 4, 10, 'Healthy', 0],
    ['inv_13', 'Farm Fresh Eggs', 'Poultry', 320, 'Units', 250, 200, 'Healthy', 0],
    ['inv_14', 'Green Chili & Ginger Mix', 'Vegetables', 12, 'kg', 8, 15, 'Low Stock', 25]
  ];

  for (const item of inventoryItems) {
    insertInventory.run(
      item[0],
      item[1],
      item[2],
      item[3],
      item[4],
      item[5],
      item[6],
      item[7],
      item[8],
      new Date().toISOString()
    );
  }

  // 8. Alerts
  const insertAlert_sql = `
    INSERT INTO alerts (id, title, message, severity, date, is_read, type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  insertAlert.run(
    'alt_1',
    'Paneer Inventory Critical',
    'Current stock (18 kg) is below reorder threshold for planned Paneer Butter Masala dinner.',
    'Critical',
    todayStr,
    0,
    'inventory'
  );

  insertAlert.run(
    'alt_2',
    'Friday Lunch Turnout Shift',
    'AI Model anticipates 6.8% lower lunch turnout compared to Thursday due to weekend eve departures.',
    'Attention',
    todayStr,
    0,
    'prediction'
  );

  insertAlert.run(
    'alt_3',
    'Optimal Breakfast Waste Recorded',
    'Breakfast food leftover was kept under 2.1% (8 kg vs 380 meals served), meeting zero-waste target.',
    'Normal',
    todayStr,
    1,
    'waste'
  );

  insertAlert.run(
    'alt_4',
    'Upcoming Holiday Schedule',
    'Ganesh Chaturthi festival next week: attendance expected to dip by ~35%. Auto-adjusting models.',
    'Attention',
    todayStr,
    0,
    'schedule'
  );

  console.log('[Seed] Demo database populated successfully!');
}

// Run directly if called from command line
if (process.argv[1].endsWith('seed.js')) {
  seedData();
}
