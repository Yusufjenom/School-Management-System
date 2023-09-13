import {app} from './app';
require('dotenv').config()

const port = 5000

//SERVER
app.listen(process.env.PORT, () => console.log(`server is running on localhost port: ${process.env.PORT}`));
