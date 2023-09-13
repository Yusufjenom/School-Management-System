import mongoose,{Document, Model, Schema} from "mongoose";
import bcrypt from 'bcrypt';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;