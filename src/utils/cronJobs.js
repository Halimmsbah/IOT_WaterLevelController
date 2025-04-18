import cron from 'node-cron';
import mongoose from 'mongoose';

// استيراد كائن Firebase المهيأ مسبقاً من ملف التهيئة
import { admin } from '../config/firebase.config.js';
import { SensorData } from '../../database/models/sensor.model.js';

const db = admin.database();

// مهمة مراقبة المستشعرات وحفظ البيانات
export const startSensorMonitoring = () => {
  cron.schedule('* * * * *', async () => { // كل دقيقة
    try {
      const snapshot = await db.ref('sensorData').once('value');
      const data = snapshot.val();
      
      if (data) {
        const status = calculateStatus(data);
        await SensorData.create({ 
          waterLevel: data.waterLevel,
          turbidity: data.turbidity,
          temperature: data.temperature,
          humidity: data.humidity,
          pumpState: data.pumpState || 'OFF',
          pump2State: data.pump2State || 'OFF',
          solenoidValveState: data.solenoidValveState || 'OFF',
          status,
          recordedAt: new Date()
        });
        console.log('✅ Sensor data saved successfully at', new Date().toISOString());
      }
    } catch (error) {
      console.error('❌ Error in sensor monitoring task:', error.message);
    }
  });
};

// مهمة فحص صحة النظام
export const startSystemHealthCheck = () => {
  cron.schedule('*/5 * * * *', async () => { // كل 5 دقائق
    try {
      const [firebaseStatus, dbStatus] = await Promise.all([
        checkFirebaseConnection(),
        checkMongoDBConnection()
      ]);
      
      console.log('🛠️ System Health Check:', { 
        timestamp: new Date().toISOString(),
        firebaseStatus, 
        dbStatus 
      });
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  });
};

// دالة التحقق من اتصال Firebase
async function checkFirebaseConnection() {
  try {
    await db.ref('.info/connected').once('value');
    return { connected: true, status: 'healthy' };
  } catch (error) {
    return { connected: false, status: 'error', message: error.message };
  }
}

// دالة التحقق من اتصال MongoDB
async function checkMongoDBConnection() {
  try {
    await mongoose.connection.db.admin().ping();
    return { connected: true, status: 'healthy' };
  } catch (error) {
    return { connected: false, status: 'error', message: error.message };
  }
}

// دالة حساب حالة النظام
function calculateStatus(data) {
  if (data.waterLevel < 10 || data.turbidity > 50) return 'danger';
  if (data.waterLevel < 20 || data.turbidity > 30) return 'warning';
  return 'normal';
}