const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const userSchema = new mongoose.Schema({
  name: { 
    type: String,
     required: true
     },
     contact: {
      type: String,
      required: true
    },
  email: {
     type: String, 
     required: true, 
     unique: true
     },
  password: { 
    type: String, 
    required: true
 },
 tokens: [
   {
       token: {
          type: String,
          required:true 
       }
   }
]
});
userSchema.pre('save', async function(next) {
   const user = this;//this refers to the current instance of the user document being processed
   if (!user.isModified('password')) return next();
   try {
       const salt = await bcrypt.genSalt(10);
       user.password = await bcrypt.hash(user.password, salt);//here password is hashed with salt
       next();
   } catch (err) {
       next(err);
   }
});
userSchema.methods.generateAuthToken = async function () {
   try {
       // Create a token using the user's `_id` and the secret key from your environment variables
       let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);

       // Add the token to the user's `tokens` array
       this.tokens = this.tokens.concat({ token: token });

       // Save the updated user document with the new token
       await this.save();

       // Return the generated token
       return token;
   } catch (err) {
       console.log(err);
   }
}
const User = mongoose.model('User', userSchema);
module.exports=User;
