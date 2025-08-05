const cloudinary = require("../middleware/cloudinary");

exports.createSubject = async (req, res) => {
  const { subject_name, class_name, user_id } = req.body;
  const pdfFile = req.file;

  if (!pdfFile) {
    return res.status(400).json({ error: "PDF file is required" });
  }

  try {
    // Upload PDF to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(pdfFile.path, {
      resource_type: "raw", // This is key for PDFs
      folder: "subject_books",
    });

    // Save the Cloudinary URL and public_id
    const pdfUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    const result = await db.query(
      `INSERT INTO subjects (subject_name, class_name, pdf_path, cloudinary_public_id, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [subject_name, class_name, pdfUrl, publicId, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Upload or DB error:", err);
    res.status(500).json({ error: "Database or upload error" });
  }
};
