const upload = require("../middleware/cloudinaryStorage"); // new upload
router.post("/create", upload.single("pdfFile"), subjectController.createSubject);
