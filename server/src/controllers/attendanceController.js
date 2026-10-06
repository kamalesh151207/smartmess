import { attendanceService } from '../services/attendanceService.js';

export const attendanceController = {
  async list(req, res) {
    try {
      const data = await attendanceService.getAttendanceList(req.query);
      res.json({
        success: true,
        data_mode: 'ACTUAL DB DATA',
        ...data
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'ATTENDANCE_FETCH_ERROR', message: err.message } });
    }
  },

  async record(req, res) {
    try {
      const result = await attendanceService.recordAttendance(req.body);
      res.json({
        success: true,
        message: 'Attendance recorded successfully',
        record: result
      });
    } catch (err) {
      const statusCode = err.status || 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: statusCode === 409 ? 'DUPLICATE_ATTENDANCE' : 'RECORD_FAILED',
          message: err.message || 'Failed to record attendance'
        }
      });
    }
  },

  async bulkIngest(req, res) {
    try {
      const { csv_data, items, source = 'import', filename = 'attendance_upload.csv' } = req.body;
      const payload = csv_data || items;
      if (!payload) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_PAYLOAD', message: 'csv_data string or items array is required' }
        });
      }

      const result = await attendanceService.ingestBulkAttendance(payload, source, filename);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({
        success: false,
        error: { code: 'INGESTION_ERROR', message: err.message }
      });
    }
  },

  async getSummary(req, res) {
    try {
      const { date = '2026-09-04' } = req.query;
      const data = await attendanceService.getAttendanceList({ date, limit: 1 });
      res.json({
        success: true,
        date,
        stats: data.stats
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: 'SUMMARY_ERROR', message: err.message } });
    }
  }
};
