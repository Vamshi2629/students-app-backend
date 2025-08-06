const express = require("express");
const router = express.Router();
const upload = require("../Cloudinary/cloudinaryStorage");
const subjectController = require("../controllers/subjectController");

// Create subject with Cloudinary document upload
router.post("/create", upload.single("pdfFile"), subjectController.createSubject);

// Get all subjects
router.get("/", subjectController.getAllSubjects);

// Get subject by ID
router.get("/:id", subjectController.getSubjectById);

// Get subject document from Cloudinary
router.get("/:id/document", subjectController.getSubjectDocument);

// Delete subject document from Cloudinary
router.delete("/:id/document", subjectController.deleteSubjectDocument);
router.delete("/:id", subjectController.deleteSubjectById);

module.exports = router;
