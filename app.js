const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const User = require('./model/userSchema'); // Ensure this path is correct
const Donor=require('./model/donorSchema')//ensure this path is correct
const db = require('./db');
const cookieParser = require('cookie-parser'); // Import cookie-parser
dotenv.config({ path: './config.env' });
const cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
// app.use(cors());
const corsOptions = {
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Enable cookies to be sent
  };
  app.use(cors(corsOptions));
app.get('/', (req, res) => {
    res.send("Welcome to Blood Donation Project");
});
app.use(require('./router/auth'));
const PORT=process.env.PORT||8000;
app.listen(PORT, () => {
    console.log("Server started at port 3000");
});