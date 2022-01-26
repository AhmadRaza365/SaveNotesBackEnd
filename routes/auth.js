const express = require("express");
const { model } = require("mongoose");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require('.././middleware/fetchuser');

const JWT_SECRET = "AhmadRaza";

const router = express.Router();

// Route 1:  Create a user using: Post "/api/auth/". Doesn't require Auth

router.post(
  "/createuser",
  [
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password !< 3 char").isLength({ min: 3 }),
  ],
  async (req, res) => {
    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ success, error: "Email already exits!" });
      }

      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt);

      // Create a User
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;
      // res.json(user);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      res.status(500).send("Some Server error!!!!!!");
    }
  }
);

//Route 2: Authenticate User using: Post "/api/auth/login". No login Requires

router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password Cannot be empty").exists(),
  ],
  async (req, res) => {

    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Try again with Correct Login Credientials" });
      }

      const passwordcompare = await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        
       
        
        return res
          .status(400)
          .json({ success, error: "Try again with Correct Login Credientials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      success = true;
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ success, authToken });

    } 
    catch (error) {
      res.status(500).send("Some Server error!!!!!!");
    }
  }
);

//Route 3: Get Loggedin User Data using: Post "/api/auth/getuser". login Requires

router.post(
  "/getuser", fetchuser, async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      res.status(500).send("Some Server error!!!!!!");
    }
  }
);

module.exports = router;
