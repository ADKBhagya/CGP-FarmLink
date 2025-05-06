const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/register", (req, res) => {
  const { FirstName, LastName, Email, Contact, Address, NIC, Gender, AccNumber, Location, Acres, Compost, Harvest } = req.body;

  if (!FirstName || !LastName || !Email || !Contact || !Address || !NIC || !Gender || !AccNumber || !Location || Acres === undefined || Compost === undefined || Harvest === undefined) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = `INSERT INTO Farmer (FirstName, LastName, Email, Contact, Address, NIC, Gender, AccNumber, Location, Acres, Compost, Harvest) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [FirstName, LastName, Email, Contact, Address, NIC, Gender, AccNumber, Location, Acres, Compost, Harvest], (err, result) => {
    if (err) {
      console.error("Error inserting Farmer:", err);
      return res.status(500).json({ error: "Database error!" });
    }
    res.status(201).json({ message: "Farmer registered successfully!", FarmerID: result.insertId });
  });
});

// Fetch all farmers
router.get("/getFarmers", (req, res) => {
  const sql = "SELECT * FROM Farmer";  // Ensure 'farmer' is the correct table name

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching farmers:", err);
      return res.status(500).json({ error: "Database error!" });
    }
    res.status(200).json(results);
  });
});

router.delete("/delete/:id", (req, res) => {
  const farmerId = req.params.id;
  console.log("Deleting farmer with ID:", farmerId); // Debug log

  const query = "DELETE FROM Farmer WHERE FarmerID = ?"; // ✅ FIXED CASE!

  db.query(query, [farmerId], (err, result) => {
    if (err) {
      console.error("Error deleting farmer:", err);
      return res.status(500).json({ error: "Server error while deleting farmer" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.status(200).json({ message: "Farmer deleted successfully" });
  });
});







module.exports = router;