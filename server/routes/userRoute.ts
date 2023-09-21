const express = require('express');
import { signupUser, activateUser, loginUser, logout } from '../controllers/user';
import { authorizeRoles, isAuthenticated } from '../middleware/authen';
const userRouter = express.Router();


userRouter.post('/signup', signupUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login-user', loginUser);

userRouter.get('/logout-user', logout);

export default userRouter;