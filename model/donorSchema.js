const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: {
     type: String, 
     required: true
     },
  email: { 
    type: String,
     required: true, 
     unique: true 
    },
    contact: {
        type: String, 
        required: true
        },
  age: { 
    type: Number,
     required: true,
      min: 18 
    }, // Minimum age of 18
  weight: { 
    type: Number, 
    required: true, 
    min: 45
}, // Minimum weight of 45
bloodGroup: {
  type: String,
  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // All possible blood groups
  required: true
},
  city: { 
    type: String, 
    required: true
 },
 status: {
  type: String,
  enum: ["Available", "NA"], // Restricts status to these two values
  default: "Available", // Sets default value to "NA"
  required: true
}
});

const Donor= mongoose.model('Donor', donorSchema);
module.exports=Donor;