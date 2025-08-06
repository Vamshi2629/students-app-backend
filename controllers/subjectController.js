const db = require("../config/db");

exports.createSubject = async (req, res) => {
  const { subject_name, class_name, pdf_url, cloudinary_public_id } = req.body;

  if (!pdf_url || !cloudinary_public_id) {
    return res.status(400).json({ error: "PDF URL and Cloudinary public ID are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO subjects (subject_name, class_name, pdf_url, cloudinary_public_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [subject_name, class_name, pdf_url, cloudinary_public_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};


exports.getAllSubjects = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM subjects ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
};

exports.getSubjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM subjects WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching subject by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// New function to get subject document from Cloudinary
exports.getSubjectDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT pdf_url, cloudinary_public_id FROM subjects WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    const { pdf_url, cloudinary_public_id } = result.rows[0];
    
    if (!pdf_url) {
      return res.status(404).json({ message: "No document found for this subject" });
    }

    res.json({
      document_url: pdf_url,
      public_id: cloudinary_public_id,
      message: "Document retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching subject document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// New function to delete subject document from Cloudinary
exports.deleteSubjectDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT cloudinary_public_id FROM subjects WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const { cloudinary_public_id } = result.rows[0];
    
    if (!cloudinary_public_id) {
      return res.status(404).json({ message: "No document found for this subject" });
    }

    // Update database to remove document references
    await db.query(
      "UPDATE subjects SET pdf_url = NULL, cloudinary_public_id = NULL WHERE id = $1",
      [id]
    );

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Delete subject by ID (row-level deletion)
exports.deleteSubjectById = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the subject exists
    const check = await db.query("SELECT * FROM subjects WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Optionally clear associated Cloudinary fields
    await db.query("DELETE FROM subjects WHERE id = $1", [id]);

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
