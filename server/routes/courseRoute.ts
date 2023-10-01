import { uploadCourse } from "../controllers/courseController";
import { authorizeRoles, isAuthenticated } from "../middleware/authen";

const express = require('express');
const courseRouter = express.Router();


courseRouter.post('/create-course', isAuthenticated, authorizeRoles("admin"), uploadCourse);

export default courseRouter;