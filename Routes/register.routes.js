const express = require("express");
const registerRouter = express.Router();

const registerController=require("../Controllers/register.controller");
const { authenticateToken } = require("../Middlewares/authticaation");
const loggerMiddleware = require("../Middlewares/loggerMiddleware");


registerRouter.post("/SingUp",loggerMiddleware,registerController.UserForm);

 registerRouter.post('/login',registerController.loginForm)
 registerRouter.post('/pWDChange',authenticateToken,registerController.changePwd)
registerRouter.post('/forgetPwd',registerController.forgetPassword)
 registerRouter.post('/ForgetPwdOtpVerify',authenticateToken,registerController.ForgetPwdOtpVerify)
registerRouter.post('/ReSendOtp',authenticateToken,registerController.ReSendOtp)

module.exports = registerRouter;