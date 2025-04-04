//Staff

const express = require("express");
const cors = require("cors");
const staffRoutes = require("./backend/routes/staff");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/staff", staffRoutes);

app.get("/", (req, res) => {
  res.send("FarmLink Backend is Running! 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});

// API Route to retrieve farmer details (new endpoint)
app.get("/api/farmer/details", (req, res) => {
  const query = "SELECT * FROM farmer"; // Query to get all farmer details

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching farmer details:", err);
      return res.status(500).json({ error: "Error fetching data" });
    }

    res.status(200).json(results); // Send farmer data as JSON response
  });
});

//Profiles


const bodyParser = require("body-parser");
const mysql = require("mysql"); 
const cors = require('cors');
app.use(cors()); 


const userRoutes = require("./routes/userRoutes.js");

require("dotenv").config();


require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api', userRoutes);

//  Test Database Connection with API Route
app.get('/api/farmers', (req, res) => {
    db.query('SELECT * FROM farmers', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
