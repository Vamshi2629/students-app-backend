const db = require("../config/db");

// GET all students with search and pagination
exports.getAllStudents = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const searchValue = `%${search}%`;

  const countQuery = `
    SELECT COUNT(*) AS total FROM students
    WHERE name ILIKE $1 OR email ILIKE $1
  `;

  const searchQuery = `
    SELECT * FROM students
    WHERE name ILIKE $1 OR email ILIKE $1
    LIMIT $2 OFFSET $3
    
  `;

  try {
    const countResult = await db.query(countQuery, [searchValue]);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const results = await db.query(searchQuery, [searchValue, limit, offset]);

    res.json({
      totalItems: total,
      totalPages,
      currentPage: parseInt(page),
      data: results.rows,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).send(err);
  }
};



// CREATE new student
exports.createStudent = async (req, res) => {
  const { name, email, age, class: studentClass } = req.body;

  try {
    await db.query(
      "INSERT INTO students (name, email, age, class) VALUES ($1, $2, $3, $4)",
      [name, email, age, studentClass]
    );
    res.send("Student added successfully");
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).send(err);
  }
};


// UPDATE a student
exports.updateStudent = async (req, res) => {
  const { name, email, age, class: studentClass } = req.body;
  const id = req.params.id;

  try {
    await db.query(
      "UPDATE students SET name = $1, email = $2, age = $3, class = $4 WHERE id = $5",
      [name, email, age, studentClass, id]
    );
    res.send("Student updated successfully");
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).send(err);
  }
};


// GET a student by ID
exports.getStudentById = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query("SELECT * FROM students WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).send("Student not found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching student by ID:", err);
    res.status(500).send(err);
  }
};

// DELETE a student
exports.deleteStudent = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query("DELETE FROM students WHERE id = $1", [id]);
    res.send("Student deleted successfully");
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).send(err);
  }
};
