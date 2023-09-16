const express = require('express');
import {signupUser, activateUser} from '../controllers/user';
const userRouter = express.Router();


userRouter.post('/signup', signupUser);

userRouter.post('/activate-user', activateUser);

export default userRouter;