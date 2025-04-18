import express from 'express';
import {
  getRealTimeData,
  controlDevice,
  getHistoricalData,
  getSystemHealth
} from './sensor.controller.js';

const sensorRouter = express.Router();

// Routes
sensorRouter.get('/realtime', getRealTimeData);
sensorRouter.post('/control', controlDevice);
sensorRouter.get('/history', getHistoricalData);
sensorRouter.get('/health', getSystemHealth);

export default sensorRouter;