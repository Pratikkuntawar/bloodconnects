const mongoose=require("mongoose");
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
//const mongoURL=process.env.DATABASE;
 const mongoURL=process.env.DATABASE_URL;
console.log(mongoURL);
// const mongoURL=MONGODB_URL_LOCAL;
mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const db=mongoose.connection;
db.on('connected',()=>{
    console.log("connected to mongodb successfully");
})
db.on('error',()=>{
    console.log("error on connected to mongodb");
})
db.on('disconnected',()=>{
    console.log("disconnected to mongodb successfully");
})
module.exports=db;
//export the database conection so that other files can use this