const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
} = require("../controllers/studentController");

const authenticateToken = require("../middleware/authMiddleware"); // ✅

router.use(authenticateToken); // ✅ Protect all routes below

// Student Routes
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
