import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { catchAsyncError } from '../../middleware/catchError.js'
import { userModel } from '../../../database/models/user.model.js'
import { AppError } from '../../utils/AppError.js'
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const signup = async (req, res) => {
	let user = new userModel(req.body)
	await user.save()
	let token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_KEY)
	res.json({ message: 'Signed up successfully' })
}

export const signin = catchAsyncError(async (req, res, next) => {
	const user = await userModel.findOne({ email: req.body.email });
	// Check if user exists and password matches
	if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
	  return next(new AppError('Invalid credentials', 401)); // 401 = Unauthorized
	}
	// Generate token and send response (only runs if credentials are valid)
	const token = jwt.sign(
	{ userId: user._id, role: user.role },
	process.env.JWT_KEY
	);
	res.json({ message: 'Signed in successfully', token });
});

export const protectedRoutes = catchAsyncError(async (req, res, next) => {
	let { token } = req.headers

	//1- token exist or not
	if (!token) return next(new AppError('token not exist', 401))

	//2- verify token
	let decoded = jwt.verify(token, process.env.JWT_KEY)
	console.log(decoded)

	//3-userId -> exist or not
	let user = await userModel.findById(decoded.userId)
	if (!user) return next(new AppError('user not found', 401))

	if (user.passwordChanghedAt) {
		let time = parseInt(user?.passwordChanghedAt.getTime() / 1000)
		console.log(time + '|' + decoded.iat)
		if (time > decoded.iat) return next(new AppError('invaild token...login again', 404))
	}

	req.user = user

	next()
})

export const changePassword = catchAsyncError(async (req, res, next) => {
	let user = await userModel.findById(req.user._id)
	if (user && bcrypt.compareSync(req.body.password, user.password)) {
		let token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_KEY)
		await userModel.findByIdAndUpdate(req.params.id, { password: req.body.newPassword, passwordChanghedAt: Date.now() })
		res.json({ message: 'Signed in successfully', token })
	}
	next(new AppError('Invalid credentials', 408))
})



// إرسال رابط الاستعادة إلى الإيميل
export const forgotPassword = catchAsyncError(async (req, res, next) => {
	const user = await userModel.findOne({ email: req.body.email });
	if (!user) return next(new AppError('No user with that email', 404));
  
	// إنشاء توكن مؤقت
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });
  
	// إرسال الإيميل
	const resetURL = `http://localhost:5500/forget.html?token=${resetToken}`;
	
	const message = `Forgot your password? Submit a request with your new password to: ${resetURL}`;
	
	try {
	  await sendEmail({
		email: user.email,
		subject: 'Your password reset token (valid for 10 min)',
		message
	  });
  
	  res.json({ message: 'Token sent to email!' });
	} catch (err) {
	  user.passwordResetToken = undefined;
	  user.passwordResetExpires = undefined;
	  await user.save();
  
	  return next(new AppError('Error sending email. Try again later!', 500));
	}
  });
  
  // تحديث كلمة المرور
  export const resetPassword = catchAsyncError(async (req, res, next) => {
	// 1. تشفير التوكن
	const hashedToken = crypto
	  .createHash('sha256')
	  .update(req.params.token)
	  .digest('hex');
  
	// 2. التحقق من التوكن
	const user = await userModel.findOne({
	  passwordResetToken: hashedToken,
	  passwordResetExpires: { $gt: Date.now() }
	});
  
	if (!user) return next(new AppError('Token is invalid or has expired', 400));
  
	// 3. تحديث كلمة المرور
	user.password = req.body.password;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
  
	// 4. تسجيل الدخول التلقائي
	const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
	  expiresIn: process.env.JWT_EXPIRES_IN
	});
  
	res.json({ token, message: 'Password updated successfully!' });
  });
export const allowedTo = (...roles) => {
	return catchAsyncError(async (req, res, next) => {
		if (!roles.includes(req.user.role))
			return next(new AppError('you are not authorized', 401))
		next()
	})
}