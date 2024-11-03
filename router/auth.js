const express = require('express');
const router = express.Router();
const User = require('../model/userSchema'); // User Schema for regular users
const Donor = require('../model/donorSchema'); // Donor Schema for blood donors
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv = require('dotenv');
router.post('/register-donor', async (req, res) => {
  try {
    const { name, email, contact, age, weight, bloodGroup, city ,status} = req.body;

    // Step 1: Check if all required fields are provided
    if (!name || !email || !contact || !age || !weight || !bloodGroup || !city || !status) {
      return res.status(422).json({ error: "Insufficient data to register" });
    }
    console.log("Step 1: Validation passed");

    // Step 2: Check if the donor with the given email already exists
    const donorExist = await Donor.findOne({ email: email });
    if (donorExist) {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.log("Step 2: No existing donor found with this email");

    // Step 3: Create a new Donor instance
    const newDonor = new Donor({name,email,contact,age,weight,bloodGroup,city,status});
    console.log("Step 3: New donor created");

    // Step 4: Save the donor to the database
    const response = await newDonor.save();
    console.log("Step 4: Donor registered successfully");

    // Step 5: Send success response
    res.status(201).json({ message: "Donor registered successfully", donor: response });
    console.log("Step 5: Response sent");

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//update user profile
router.put('/update-donor', async (req, res) => {
  try {
    const { email, city, contact, status } = req.body;

    // Step 1: Check if the email is provided to identify the user
    if (!email) {
      return res.status(422).json({ error: "Email is required to update profile" });
    }
    console.log("Step 1: Email provided for update");

    // Step 2: Check if the user with the given email is registered
    const existingDonor = await Donor.findOne({ email: email });
    if (!existingDonor) {
      return res.status(404).json({ error: "Donor not found" });
    }
    console.log("Step 2: Donor found for update");

    // Step 3: Update the fields that are provided in the request body
    if (city) existingDonor.city = city;
    if (contact) existingDonor.contact = contact;
    if (status) existingDonor.status = status;

    console.log("Step 3: Donor data updated");

    // Step 4: Save the updated donor information to the database
    const updatedDonor = await existingDonor.save();
    console.log("Step 4: Donor profile updated successfully");

    // Step 5: Send success response
    res.status(200).json({ message: "Profile updated successfully", donor: updatedDonor });
    console.log("Step 5: Response sent");

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register as a User
router.post('/register-user', async (req, res) => {
    try {
      const { name, contact, email, password } = req.body;
  
      // Step 1: Check if all required fields are provided
      if (!name || !contact || !email || !password) {
        return res.status(422).json({ error: "All fields are required" });
      }
      console.log("Step 1: Validation passed");
  
      // Step 2: Check if the user with the given email already exists
      const userExist = await User.findOne({ email: email });
      if (userExist) {
        return res.status(409).json({ error: "Email already exists" });
      }
      console.log("Step 2: No existing user found with this email");
   // Step 4: Create a new User instance
      const newUser = new User({name,contact,email,password});
      console.log("Step 4: New user created");
  
      // Step 5: Save the user to the database
      const response = await newUser.save();
      console.log("Step 5: User registered successfully");
  
      // Step 6: Send success response
      res.status(201).json({ message: "User registered successfully", user: response });
      console.log("Step 6: Response sent");
  
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Login for both Users and Donors
// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Check if both email and password are provided
        if (!email || !password) {
            console.log("Missing email or password");
            return res.status(422).json({ error: "Please provide both email and password" });
        }

        // Step 2: Find the user with the provided email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found with email:", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        console.log("User found:", user);

        // Step 3: Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match");
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Step 4: Generate a JWT token
        const token = await user.generateAuthToken();
        console.log("Generated Token:", token);

        // Step 5: Set the JWT token in a cookie
        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // Cookie expires in 2 hours
            httpOnly: true, // Cookie cannot be accessed via JavaScript in the client
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
        });

        console.log("Login successful");

        // Step 6: Send success response
        res.status(200).json({ message: "User signed in successfully" });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Search for Donors (only accessible to logged-in users)
const authenticate = require('./authMiddleware');
// router.get('/search', authenticate, async (req, res) => {
//     try {
//         const { bloodGroup, city } = req.query;

//         // Search donors by blood group and city
//         const donors = await Donor.find({ bloodGroup, city });
//         res.status(200).json(donors);
//     } catch (err) {
//         console.error("Search error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
// router.get('/search', authenticate, async (req, res) => {
//     try {
//         const { bloodGroup, city } = req.query;

//         // Define a filter object based on query parameters
//         const filter = {};
//         if (bloodGroup) filter.bloodGroup = bloodGroup;
//         if (city) filter.city = city;

//         // Fetch donors based on filter; if empty, returns all documents
//         const donors = await Donor.find(filter);
//         res.status(200).json(donors);
//     } catch (err) {
//         console.error("Search error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
// router.get('/search', authenticate, async (req, res) => {
//     try {
//         const { bloodGroup, city } = req.query;

//         // Define a filter object based on query parameters
//         const filter = {};
//         if (bloodGroup) filter.bloodGroup = bloodGroup;
//         if (city) filter.city = city;

//         // Fetch donors based on filter; if empty, returns all documents
//         const donors = await Donor.find(filter);

//         // Check if any donors were found
//         if (donors.length === 0) {
//             return res.status(404).json({ message: "No matches found" });
//         }

//         res.status(200).json(donors);
//     } catch (err) {
//         console.error("Search error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
// router.get('/search', authenticate, async (req, res) => {
//     try {
//         const { bloodGroup, city } = req.query;

//         // Ensure both bloodGroup and city are provided
//         if (!bloodGroup || !city) {
//             return res.status(400).json({ message: "Please provide both blood group and city" });
//         }

//         // Search donors by exact match of bloodGroup and city
//         const donors = await Donor.find({ bloodGroup, city });

//         // Check if any donors were found
//         if (donors.length === 0) {
//             return res.status(404).json({ message: "No donors found" });
//         }

//         // Return matched donors
//         res.status(200).json(donors);
//     } catch (err) {
//         console.error("Search error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
// router.get('/search', authenticate, async (req, res) => {
//     try {
//         const { bloodGroup, city } = req.query;

//         // Log query parameters to verify they're being received
//         console.log("Received query params:", req.query);

//         // Ensure both bloodGroup and city are provided
//         if (!bloodGroup || !city) {
//             return res.status(400).json({ message: "Please provide both blood group and city" });
//         }

//         // Search donors by exact match of bloodGroup and city
//         const donors = await Donor.find({ bloodGroup, city });

//         // Check if any donors were found
//         if (donors.length === 0) {
//             return res.status(404).json({ message: "No donors found" });
//         }

//         // Return matched donors
//         res.status(200).json(donors);
//     } catch (err) {
//         console.error("Search error:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
router.get('/search', authenticate, async (req, res) => {
  try {
      const { bloodGroup, city } = req.query;

      // Log query parameters to verify they're being received
      console.log("Received query params:", req.query);

      // Ensure both bloodGroup and city are provided
      if (!bloodGroup || !city) {
          return res.status(400).json({ message: "Please provide both blood group and city" });
      }

      // Define the query criteria
      let query = {
          city,
          $or: [
              { bloodGroup }, // Match the exact blood group
              { bloodGroup: { $in: ['O+', 'O-'] } } // Include O+ and O- donors
          ]
      };

      // Search donors based on the query criteria
      const donors = await Donor.find(query);

      // Check if any donors were found
      if (donors.length === 0) {
          return res.status(404).json({ message: "No donors found" });
      }

      // Return matched donors
      res.status(200).json(donors);
  } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
