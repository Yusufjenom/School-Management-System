import mongoose,{Document, Model, Schema} from "mongoose";
import bcrypt from 'bcrypt';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document{
    name: string;
    email:string;
    password: string;
    avatar:{
        public_id:string;
        url:string;
    },
    role:string;
    isVerified: boolean;
    courses:Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
};

const userSchema : Schema<IUser> = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Kindly enter your name"]
    },
    email:{
       type: String,
       required: [true, "Kindly enter your email"],
       validate: {
            validator: function (value: string){
                return emailRegexPattern.test(value);
            },
            message: "Kindly enter a valid email address"
       },
       unique: true
    },
    password:{
        type: String,
        required: [true, "Kindly enter your password"],
        minlength: [8, "Password must be atleast eight characters"]
    },
    avatar:{
        public_id: String,
        url: String
    },
    role:{
        type:String,
        default:"user"
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    courses:[{
       courseId: String,
    }],

}, {timestamps: true});

//HASHING PASSWORD USING MONGOOSE HOOK BEFORE SAVING TO THE DATABASE

userSchema.pre<IUser>('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//COMPARING OUR PASSWORD
userSchema.methods.comparePassword = async function(userPassword: string): Promise<boolean>{
    return await bcrypt.compare(userPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model('user', userSchema);

export default userModel;