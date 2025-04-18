import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { URL } from 'url';

let adminApp;

const initializeFirebase = async () => {
  try {
    const serviceAccount = JSON.parse(
      await readFile(new URL('../../serviceAccountKey.json', import.meta.url))
    );

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://waterlevelcontroller-74cf6-default-rtdb.firebaseio.com"
    });
    
    console.log(`🔥 Firebase connected to project: ${process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id}`);
    return adminApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
};

// التهيئة الفورية عند الاستيراد
const firebaseApp = await initializeFirebase();

export { firebaseApp, admin };