const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Demo user
const user = {
  id: 1,
  username: "student",
  password: "12345",
  name: "Student"
};

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== user.username || password !== user.password) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  res.json({
    message: "Login successful",
    token
  });
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    req.user = decoded;
    next();
  });
}

// Protected API
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected data accessed successfully",
    user: req.user
  });
});
app.get("/", (req, res) => {
  res.send("JWT Backend is running!");
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});