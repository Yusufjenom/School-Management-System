import mongoose, { Document, Model, Schema } from "mongoose";
require('dotenv').config();
// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
};

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Kindly enter your name"]
    },
    email: {
        type: String,
        required: [true, "Kindly enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Kindly enter a valid email address"
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, "Kindly enter your password"],
        minlength: [8, "Password must be atleast eight characters"]
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [{
        courseId: String,
    }],

}, { timestamps: true });

//HASHING PASSWORD USING MONGOOSE HOOK BEFORE SAVING TO THE DATABASE

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//SIGN IN WITH ACCESS TOKEN
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '');
};

//REFRESH TOKEN
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '');
};

//COMPARING OUR PASSWORD
userSchema.methods.comparePassword = async function (userPassword: string): Promise<boolean> {
    return await bcrypt.compare(userPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model('user', userSchema);

export default userModel;