import express from 'express';
import { dbConnection } from './database/dbConnection.js';
import { bootstrap } from './src/modules/index.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { startSensorMonitoring, startSystemHealthCheck } from './src/utils/cronJobs.js';

// استيراد Firebase المهيأ مسبقاً
import './src/config/firebase.config.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const __dirname = path.resolve();

// Middlewares
app.use(cors())
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('dev'));

// Routes
bootstrap(app);

// اتصال قاعدة البيانات وبدء المهام
const startServer = async () => { 
  try {
    await dbConnection();
    startSensorMonitoring();
    startSystemHealthCheck();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

import nodemailer from 'nodemailer';

// إعداد إرسال البريد
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// دالة إرسال البريد
async function sendAlertEmail(subject, message) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: subject,
            text: message
        });
        console.log('Alert email sent successfully');
    } catch (error) {
        console.error('Error sending alert email:', error);
    }
}

// تعديل endpoint الصحة
app.get('/api/v1/sensor/health', async (req, res) => {
    const [firebaseStatus, dbStatus] = await Promise.all([
        checkFirebaseConnection(),
        checkMongoDBConnection()
    ]);
    
    if (firebaseStatus.status === 'error' || dbStatus.status === 'error') {
        await sendAlertEmail(
            'System Health Alert',
            `Critical system issue detected:\n\nFirebase: ${firebaseStatus.status}\nMongoDB: ${dbStatus.status}`
        );
    }
    
    res.json({ firebaseStatus, dbStatus });
});
app.use(cors());


startServer();