import { admin } from '../../config/firebase.config.js';
import { SensorData } from '../../../database/models/sensor.model.js';
import mongoose from 'mongoose'; // أضف هذا الاستيراد في الأعلى

const db = admin.database();


export const getHistoricalData = async (req, res) => {
    try {
        // Get query parameters with default values
        const { 
            limit = 50, 
            days, 
            status, 
            sort = '-recordedAt' 
        } = req.query;

        // Build the query
        let query = {};

        // Filter by status if provided
        if (status) {
            query.status = status.toLowerCase();
        }

        // Filter by days if provided
        if (days) {
            const dateFilter = new Date();
            dateFilter.setDate(dateFilter.getDate() - parseInt(days));
            query.recordedAt = { $gte: dateFilter };
        }

        // Execute the query
        const data = await SensorData.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .select('-__v -_id -createdAt -updatedAt');

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch historical data',
            error: error.message
        });
    }
};

export const getRealTimeData = async (req, res) => {
  try {
    const snapshot = await db.ref('sensorData').once('value');
    const data = snapshot.val();

    res.json({
      success: true,
      data: {
        ...data,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ... بقية الدوال كما هي
export const controlDevice = async (req, res) => {
  try {
    const { device, state } = req.body;
    const validDevices = ['pump', 'pump2', 'solenoidValve'];

    if (!validDevices.includes(device)) {
      return res.status(400).json({ message: 'Invalid device' });
    }

    await db.ref(`/controls/${device}`).set(state ? 'ON' : 'OFF');

    res.json({
      success: true,
      message: `${device} ${state ? 'activated' : 'deactivated'}`
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSystemHealth = async (req, res) => {
    try {
      const [firebaseStatus, dbStatus] = await Promise.all([
        checkFirebaseConnection(),
        checkMongoDBConnection()
      ]);
      
      res.json({ 
        success: true,
        firebaseStatus,
        dbStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  // في sensor.controller.js
async function checkFirebaseConnection() {
    try {
      await admin.database().ref('.info/connected').once('value');
      return { connected: true, status: 'healthy' };
    } catch (error) {
      return { connected: false, status: 'error', message: error.message };
    }
  }
  
  async function checkMongoDBConnection() {
    try {
      await mongoose.connection.db.admin().ping();
      return { connected: true, status: 'healthy' };
    } catch (error) {
      return { connected: false, status: 'error', message: error.message };
    }
  }