const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes"); // Optional
const subjectRoutes = require("./routes/subjectRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 Set headers to allow cross-origin requests (important for PDFs)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// 📂 Serve uploaded files statically (e.g., PDF files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes); // Optional
app.use("/api/subjects", subjectRoutes);

// 🔁 Test route
app.get("/", (req, res) => {
  res.send("✅ Student Management API is running");
});

// 🛑 Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log("✅ Server running on port:", PORT);
});
