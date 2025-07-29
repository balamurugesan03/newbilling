// const User = require("../models/User.js");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // User registration
// const createUser = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existing = await User.findOne({ username });
//     if (existing) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ username, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: "User created successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error creating user", error: err.message });
//   }
// };

// // User login
// const login = async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(401).json({ message: "Invalid username" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//   const token = jwt.sign({ userId: user._id }, "SECRET_KEY", {
//     expiresIn: "1d",
//   });

//   res.json({ token }); // no need to send role
// };


// module.exports = {
//   login,
//   createUser,
// };

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, "SECRET_KEY", { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

