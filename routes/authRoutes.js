const express = require("express");
const router = express.Router();
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

router.post("/send-signup-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "INSERT INTO pending_otps (email, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3",
      [email, otp, expiresAt]
    );

   await sendEmail({
  to: email,
  subject: "Your Signup OTP - Valid for 5 Minutes",
  text: `
Hello,

Thank you for registering with us.

Your One-Time Password (OTP) for signup is: ${otp}

⚠️ This OTP is valid for only 5 minutes. Please complete your registration before it expires.

If you did not request this OTP, you can safely ignore this email.

Best regards,  
Team Support
  `.trim(),
});


    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP send error:", err.stack || err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, otp, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM pending_otps WHERE email = $1", [email]);
    const otpData = result.rows[0];

    if (!otpData || otpData.otp !== otp || new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hashedPassword]);
    await db.query("DELETE FROM pending_otps WHERE email = $1", [email]);

    await sendEmail({
      to: email,
      subject: "Welcome to Our App",
      text: `Hi ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}`,
    });

    res.status(201).json({ message: "Signup successful, credentials sent via email." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Include role and name in JWT if needed
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = uuidv4();

    await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE refresh_token = $1", [refreshToken]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    await db.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = $1", [refreshToken]);
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
});

module.exports = router;
