import express from 'express'
import { validation } from '../../middleware/validation.js'
import { changePasswordVal, signinVal, signupVal } from './auth.validation.js'
import { changePassword, forgotPassword, protectedRoutes, resetPassword, signin, signup } from './auth.controller.js'
import { checkEmail } from '../../middleware/emailExist.js'

const authRouter = express.Router()

authRouter.post('/forgot-password', forgotPassword);
authRouter.patch('/reset-password/:token', resetPassword);
authRouter.post('/signup', validation(signupVal), checkEmail, signup, (req, res) => {
    res.redirect('/home.html')
})
authRouter.post('/signin', validation(signinVal), signin, (req, res) => {
    res.redirect('/home.html')
})
authRouter.patch('/changePassword/', protectedRoutes, validation(changePasswordVal), changePassword)
export default authRouter
