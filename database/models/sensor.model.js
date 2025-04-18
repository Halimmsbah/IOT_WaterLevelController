import mongoose from 'mongoose';

const sensorSchema = new mongoose.Schema({
  waterLevel: { type: Number, required: true },
  turbidity: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  pumpState: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  pump2State: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  solenoidValveState: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
  status: { type: String, enum: ['normal', 'warning', 'danger'], default: 'normal' },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// إضافة فهارس لتحسين الأداء
sensorSchema.index({ recordedAt: -1 });
sensorSchema.index({ status: 1 });

// Middleware قبل الحفظ
sensorSchema.pre('save', function(next) {
  this.status = calculateStatus(this);
  next();
});

function calculateStatus(data) {
  if (data.waterLevel < 10 || data.turbidity > 50) return 'danger';
  if (data.waterLevel < 20 || data.turbidity > 30) return 'warning';
  return 'normal';
}

export const SensorData = mongoose.model('SensorData', sensorSchema);