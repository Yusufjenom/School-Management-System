const express = require('express');
import {    signupUser,
            activateUser,
            loginUser,
            logout, 
            updateAccessToken,
            getUserInfo,
            socialAuth,
            updateUserInfo,
            updatePassword,
            updateProfilePic,
         } from '../controllers/user';
import { authorizeRoles, isAuthenticated } from '../middleware/authen';
const userRouter = express.Router();


userRouter.post('/signup', signupUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login-user', loginUser);

userRouter.get('/logout-user', isAuthenticated, logout);

userRouter.get('/refresh', updateAccessToken);

userRouter.get('/me', isAuthenticated, getUserInfo);

userRouter.post('/social-auth', socialAuth);

userRouter.put('/update-user-info', isAuthenticated, updateUserInfo);

userRouter.put('/update-password', isAuthenticated, updatePassword);

userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePic);


export default userRouter;