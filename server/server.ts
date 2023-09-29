import {app} from './app';
require('dotenv').config();
//const cloudinary = require('cloudinary');
import {v2 as cloudinary} from 'cloudinary';


const port = 5000

//CLOUDINARY CONFIGURATION
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY

})

//SERVER
app.listen(process.env.PORT, () => console.log(`server is running on localhost port: ${process.env.PORT}`));
