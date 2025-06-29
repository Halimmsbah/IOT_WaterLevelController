import express from 'express';
import {
  getRealTimeData,
  controlDevice,
  getHistoricalData,
  getSystemHealth,
  checkWaterSource
} from './sensor.controller.js';

const sensorRouter = express.Router();

// Routes
sensorRouter.get('/realtime', getRealTimeData);
sensorRouter.post('/control', controlDevice);
sensorRouter.get('/history', getHistoricalData);
sensorRouter.get('/health', getSystemHealth);
sensorRouter.get('/water-source', checkWaterSource);
export default sensorRouter;