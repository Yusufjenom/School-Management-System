import mongoose from 'mongoose';
require('dotenv').config();

const dbUrl: string = process.env.MONGODB_URL || "";

const connectDB = async () => {
    try{
      await mongoose.connect(dbUrl)
      .then((data: any) => console.log(`connected to database successfully with ${data.connection.host}`))
    }
    catch(err: any){
      console.log(err.message)
    }
}

connectDB()