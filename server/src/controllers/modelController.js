import { forecastService } from '../services/forecastService.js';

export const modelController = {
  async getEvaluation(req, res) {
    try {
      const evaluation = await forecastService.getModelEvaluation();
      res.json({
        success: true,
        ...evaluation
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          code: 'EVALUATION_ERROR',
          message: err.message
        }
      });
    }
  },

  async getStatus(req, res) {
    try {
      const health = await forecastService.checkMlHealth();
      const evaluation = await forecastService.getModelEvaluation();

      res.json({
        success: true,
        status: {
          model_name: 'Random Forest Regressor',
          version: '1.0',
          training_dataset: evaluation.data_mode || 'Demo Synthetic Attendance Baseline',
          dataset_notice: evaluation.dataset_notice,
          evaluation_method: evaluation.split?.strategy || 'Chronological Time-Aware Split (70% Train / 15% Val / 15% Test)',
          status: health.online ? 'Ready (Python FastAPI Service Active)' : 'Ready (Node.js Fallback Engine Active)',
          is_synthetic: evaluation.is_synthetic,
          last_trained: evaluation.last_trained || new Date().toISOString(),
          benchmarks: evaluation.benchmarks
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: { code: 'STATUS_ERROR', message: err.message }
      });
    }
  }
};
