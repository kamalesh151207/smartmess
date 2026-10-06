import { forecastService } from '../services/forecastService.js';
import db from '../db.js';

export const forecastController = {
  async predict(req, res) {
    const {
      date = '2026-09-04',
      meal = 'Lunch',
      meal_type,
      expected_attendance = 1045,
      menu_item = 'Paneer Butter Masala & Dal Makhani',
      day_type = 'Regular',
      holiday_event = false,
      event_flag = false,
      buffer_percent = 3.5
    } = req.body;

    const selectedMeal = meal_type || meal;
    const d = new Date(date);
    const dayOfWeek = isNaN(d.getTime()) ? 'Friday' : d.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if real attendance data exists for this slot
    const attResult = await db.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = $1 AND meal = $2 AND status = 'Present'",
      [date, selectedMeal]
    );
    const markedAttendance = parseInt(attResult.rows[0]?.count || 0, 10);
    const attendancePool = markedAttendance > 0 ? markedAttendance : Number(expected_attendance);

    // Call ML forecast service
    const mlResult = await forecastService.predictDemand({
      date,
      meal_type: selectedMeal,
      meal: selectedMeal,
      expected_attendance: attendancePool,
      menu_item,
      day_of_week: dayOfWeek,
      day_type,
      holiday_event: Boolean(holiday_event),
      event_flag: Boolean(event_flag),
      buffer_percent: Number(buffer_percent)
    });

    const predId = `pred_${Date.now()}`;
    await db.query(`
      INSERT INTO predictions (
        id, date, meal, expected_attendance, menu_item, day_type, holiday_event, event_flag,
        predicted_demand, recommended_prep, safety_buffer, event_adjustment, confidence, feature_signals, model_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      predId,
      date,
      selectedMeal,
      attendancePool,
      menu_item,
      day_type,
      holiday_event ? 1 : 0,
      event_flag ? 1 : 0,
      mlResult.predicted_demand,
      mlResult.recommended_preparation,
      mlResult.safety_buffer,
      mlResult.event_adjustment || 0,
      mlResult.confidence,
      JSON.stringify(mlResult.feature_importance || []),
      mlResult.model_type
    ]);

    res.json({
      success: true,
      prediction: {
        id: predId,
        date,
        meal: selectedMeal,
        expected_attendance: attendancePool,
        menu_item,
        day_type,
        holiday_event,
        ...mlResult
      }
    });
  },

  async batch(req, res) {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'items array is required' } });
    }

    const batchResults = await forecastService.batchPredict(items);
    res.json(batchResults);
  },

  async getByDate(req, res) {
    const { date } = req.params;
    const predictions = (await db.query('SELECT * FROM predictions WHERE date = $1 ORDER BY id DESC', [date])).rows;
    res.json({
      success: true,
      date,
      predictions: predictions.map(p => ({
        ...p,
        feature_signals: JSON.parse(p.feature_signals || '[]')
      }))
    });
  },

  async listRecent(req, res) {
    const predictions = (await db.query('SELECT * FROM predictions ORDER BY date DESC, id DESC LIMIT 50')).rows;
    res.json({
      success: true,
      predictions: predictions.map(p => ({
        ...p,
        feature_signals: JSON.parse(p.feature_signals || '[]')
      }))
    });
  }
};
