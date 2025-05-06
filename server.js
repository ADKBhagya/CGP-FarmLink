const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./backend/db");

// Route Imports (Avoid redeclaration!)
const staffRoutes = require("./backend/routes/staff");
const rentItemsRoutes = require("./backend/routes/rentItems");
const fertilizersRoutes = require("./backend/routes/fertilizers");
const buyersRoutes = require("./backend/routes/buyers");
const dashboardRoutes = require("./backend/routes/dashboard");

const app = express();
app.use(cors());
app.use(express.json());
    
// Root Route
app.get("/", (req, res) => {
  res.send("FarmLink Backend is Running! 🚀");
});

// API Routes
app.use("/api/staff", staffRoutes);
app.use("/api/rent-items", rentItemsRoutes);
app.use("/api/fertilizers", fertilizersRoutes);
app.use("/api/buyers", buyersRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Farmer Details API
app.get("/api/farmer/details", (req, res) => {
  const query = "SELECT * FROM farmer";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching farmer details:", err);
      return res.status(500).json({ error: "Error fetching data" });
    }
    res.status(200).json(results);
  });
});

// Harvest Details API
app.get("/api/harvest/getHarvest", (req, res) => {
  const query = "SELECT * FROM Harvest";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching harvest details:", err);
      return res.status(500).json({ error: "Error fetching data" });
    }
    res.status(200).json(results);
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});


