const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('frontend'));
app.set('view engine', 'ejs');



// MySQL connection setup
const db = mysql.createConnection({
  host: 'mysql-farmlinkdb.alwaysdata.net',
  user: '406199_farmlink',
  password: 'cD4LCNjt4pOl4ZU',
  database: 'farmlinkdb_host' // Your database name
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('public/uploads'));


// Set up Multer storage for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });



// Serve the dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/admin.html'));
});

// Route for View Staff page
app.get('/view-staff', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewstaff.html'));
});

// Route for View Staff page
app.get('/viewstaff.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewstaff.html'));
});

// Route for View Farmer page
app.get('/view-farmer', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewfarmer.html'));
});

app.get('/viewfarmer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewfarmer.html'));
});

// Route for View Harvest page
app.get('/view-harvest', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewharvest.html'));
});

app.get('/viewharvest.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewharvest.html'));
});

// Route for View Shop page
app.get('/view-shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewshop.html'));
});

app.get('/viewshop.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewshop.html'));
});

// Route for View Buyers page
app.get('/view-buyers', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewbuyer.html'));
});

// Route for View Buyers page
app.get('/viewbuyer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewbuyer.html'));
});

// Route to handle form submission
app.post('/create-staff', (req, res) => {
  console.log(req.body);  // Log the incoming data to ensure it's being passed correctly
  const { first_name, last_name, contact_number, position, gender, date_of_joining, nic, email, username, password } = req.body;

  const query = `INSERT INTO staff (first_name, last_name, contact_number, position, gender, joined_date, nic, email, username, password)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [first_name, last_name, contact_number, position, gender, date_of_joining, nic, email, username, password], (err, result) => {
    if (err) {
      console.error("Error occurred:", err);
      return res.status(500).send("Server error");
    }
    res.redirect('/viewstaff');
  });
});


// Route to view all staff
app.get('/viewstaff', (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    // Instead of rendering a view, send JSON data or redirect
    res.sendFile(path.join(__dirname, 'frontend/html/admin/viewstaff.html'));
    // Your frontend JavaScript can then fetch the staff data separately
  });
});

// Add a separate API endpoint to get staff data
app.get('/api/staff', (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});


// Route to delete staff
app.post('/delete-staff', (req, res) => {
  const { staff_id } = req.body;  // Get the staff_id from the form submission

  // Query to delete the staff by staff_id
  db.query('DELETE FROM staff WHERE staff_id = ?', [staff_id], (err, result) => {
    if (err) {
      console.error("Error deleting staff:", err);
      return res.status(500).send("Server error");
    }
    res.redirect('/viewstaff');  // Redirect to the staff view page after deletion
  });
});

app.get('/get-staff', (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(results);  // Send staff data as JSON
  });
});

// Route to update staff information
app.post('/update-staff', (req, res) => {
  console.log("Update staff request received:", req.body); // Debug log
  const {
    staff_id,
    first_name,
    last_name,
    contact_number,
    position,
    gender,
    joined_date,
    nic,
    email,
    username,
    password
  } = req.body;

  // Format the date to MySQL format (YYYY-MM-DD)
  let formattedDate = joined_date;
  if (joined_date && joined_date.includes('-')) {
    formattedDate = joined_date; // Already in YYYY-MM-DD format
  } else if (joined_date) {
    // Try to parse as date object
    const dateObj = new Date(joined_date);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toISOString().split('T')[0];
    }
  }

  // Ensure empty strings are converted to valid values
  const cleanPosition = position === "undefined" || !position ? "" : position;
  const cleanNic = nic === "undefined" || !nic ? "" : nic;
  const cleanPassword = password === "undefined" || !password ? "" : password;

  const query = `UPDATE staff 
                 SET first_name = ?, last_name = ?, contact_number = ?, 
                     position = ?, gender = ?, joined_date = ?, 
                     nic = ?, email = ?, username = ?, password = ? 
                 WHERE staff_id = ?`;

  db.query(
    query,
    [
      first_name,
      last_name,
      contact_number,
      cleanPosition,
      gender,
      formattedDate,
      cleanNic,
      email,
      username,
      cleanPassword,
      staff_id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating staff:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Staff not found" });
      }

      console.log("Staff updated successfully, affected rows:", result.affectedRows);
      res.json({ success: true, message: "Staff updated successfully" });
    }
  );
});

// Route to get staff count for the dashboard
app.get('/staff-count', (req, res) => {
  db.query('SELECT COUNT(*) as count FROM staff', (err, result) => {
    if (err) {
      console.error("Error getting staff count:", err);
      return res.status(500).json({ error: "Server error" });
    }

    // Return the count as JSON
    res.json({ count: result[0].count });
  });
});


// Handle form submission for adding Rent Card
// Add Fertilizer
app.post('/addFertilizer', upload.single('image'), (req, res) => {
  // Check if the image file is uploaded successfully
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Log form data and file information to check for any missing or incorrect fields
  console.log('Received Form Data:', req.body);  // Log the form fields
  console.log('Received Uploaded File:', req.file);  // Log the file data

  // Extract data from the form
  const { fertilizer_name, price, stock, category, description, rating, item_details } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;  // Path to the uploaded image

  // Prepare the SQL query to insert fertilizer data
  const query = `INSERT INTO fertilizer (fertilizer_name, price, stock, category, description, rating, item_details, image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  // Insert the data into the database
  db.query(query, [fertilizer_name, price, stock, category, description, rating, item_details, image], (err, result) => {
    if (err) {
      console.error('Database Error:', err.stack);  // Log the error stack for more details
      return res.status(500).json({ error: 'Error while adding fertilizer' });
    }
    res.status(200).json({ success: 'Fertilizer added successfully' });
  });
});


app.get('/getFertilizers', (req, res) => {
  const query = 'SELECT * FROM fertilizer ORDER BY fertilizer_id DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching fertilizers:', err);
      return res.status(500).json({ error: 'Error fetching fertilizers' });
    }
    res.json(result);  // Send the results back as JSON
  });
});

app.get('/getFertilizerDetails', (req, res) => {
  const fertilizer_id = req.query.fertilizer_id;
  const query = 'SELECT * FROM fertilizer WHERE fertilizer_id = ?';
  db.query(query, [fertilizer_id], (err, result) => {
    if (err) {
      console.error('Error fetching fertilizer details:', err);
      return res.status(500).json({ error: 'Error fetching fertilizer details' });
    }
    res.json(result[0]);  // Send the fertilizer details
  });
});

app.get('/getOtherFertilizers', (req, res) => {
  const fertilizer_id = req.query.fertilizer_id;
  const query = 'SELECT * FROM fertilizer WHERE fertilizer_id != ? ORDER BY fertilizer_id DESC LIMIT 4';
  db.query(query, [fertilizer_id], (err, result) => {
    if (err) {
      console.error('Error fetching other fertilizers:', err);
      return res.status(500).json({ error: 'Error fetching other fertilizers' });
    }
    res.json(result);  // Send a list of other fertilizers
  });
});


// Add Rent Card
app.post('/addRentCard', upload.single('image'), (req, res) => {
  // Check if the image file is uploaded successfully
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Log form data and file information to check for any missing or incorrect fields
  console.log('Received Form Data:', req.body);  // Log the form fields
  console.log('Received Uploaded File:', req.file);  // Log the file data

  // Extract data from the form
  const { name, price, phone_no, location, description, rating, item_details, category } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  // Prepare the SQL query to insert rent card data
  const query = `INSERT INTO rent_cards (name, price, phone_no, location, description, rating, item_details, category, image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Insert the data into the database
  db.query(query, [name, price, phone_no, location, description, rating, item_details, category, image], (err, result) => {
    if (err) {
      console.error('Database Error:', err.stack);  // Log the error stack for more details
      return res.status(500).json({ error: 'Error while adding rent card' });
    }
    res.status(200).json({ success: 'Rent card added successfully' });
  });
});

app.get('/getRentCards', (req, res) => {
  const query = 'SELECT * FROM rent_cards ORDER BY card_id DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching rent cards:', err);
      return res.status(500).json({ error: 'Error fetching rent cards' });
    }

    // Process the results to handle BLOB images
    const processedResults = result.map(card => {
      // Create a copy of the card object
      const processedCard = { ...card };

      // If image is a Buffer (BLOB data), convert it to base64
      if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
        processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
      }

      return processedCard;
    });

    res.json(processedResults);  // Send the processed results back as JSON
  });
});

// Get details of a single Rent Card
app.get('/getCardDetails', (req, res) => {
  const card_id = req.query.card_id;
  const query = 'SELECT * FROM rent_cards WHERE card_id = ?';

  db.query(query, [card_id], (err, result) => {
    if (err) {
      console.error('Error fetching card details:', err);
      return res.status(500).json({ error: 'Error fetching card details' });
    }
    res.json(result[0]);  // Send the first matching result as JSON
  });
});


// Get other Rent Cards (excluding the selected one)
app.get('/getOtherCards', (req, res) => {
  const card_id = req.query.card_id;
  const query = 'SELECT * FROM rent_cards WHERE card_id != ? ORDER BY card_id DESC LIMIT 4';

  db.query(query, [card_id], (err, result) => {
    if (err) {
      console.error('Error fetching other cards:', err);
      return res.status(500).json({ error: 'Error fetching other cards' });
    }
    res.json(result);  // Send a list of other cards
  });
});


// Get all farmers
app.get('/get-farmers', (req, res) => {
  db.query('SELECT * FROM Farmer', (err, results) => {
    if (err) {
      console.error("Error fetching farmers:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json(results);
  });
});

// Get farmer count
app.get('/farmer-count', (req, res) => {
  db.query('SELECT COUNT(*) as count FROM Farmer', (err, result) => {
    if (err) {
      console.error("Error getting farmer count:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json({ count: result[0].count });
  });
});

// Delete farmer
app.post('/delete-farmer', (req, res) => {
  const { farmer_id } = req.body;

  db.query('DELETE FROM Farmer WHERE FarmerID = ?', [farmer_id], (err, result) => {
    if (err) {
      console.error("Error deleting farmer:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.redirect('/view-farmer');
  });
});

// Update farmer
app.post('/update-farmer', (req, res) => {
  console.log("Update farmer request received:", req.body);
  const {
    farmer_id,
    first_name,
    last_name,
    email,
    contact,
    address,
    nic,
    gender,
    acc_number,
    location,
    acres,
    compost,
    harvest
  } = req.body;

  // Validate required fields
  if (!farmer_id) {
    return res.status(400).json({ error: "Farmer ID is required" });
  }

  // Convert and validate numeric fields
  const parsedAcres = acres ? parseInt(acres, 10) : 0;
  const parsedCompost = compost ? parseFloat(compost) : 0;
  const parsedHarvest = harvest ? parseFloat(harvest) : 0;

  const query = `UPDATE Farmer 
               SET FirstName = ?, LastName = ?, Email = ?, 
                   Contact = ?, Address = ?, NIC = ?, 
                   Gender = ?, AccNumber = ?, Location = ?,
                   Acres = ?, Compost = ?, Harvest = ? 
               WHERE FarmerID = ?`;

  db.query(
    query,
    [
      first_name || '',
      last_name || '',
      email || '',
      contact || '',
      address || '',
      nic || '',
      gender || '',
      acc_number || '',
      location || '',
      parsedAcres,
      parsedCompost,
      parsedHarvest,
      farmer_id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating farmer:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
      }

      console.log("Update result:", result);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Farmer not found" });
      }

      console.log("Farmer updated successfully, affected rows:", result.affectedRows);
      res.json({ success: true, message: "Farmer updated successfully" });
    }
  );
});



// Get all buyers
app.get('/get-buyers', (req, res) => {
  db.query('SELECT * FROM buyer', (err, results) => {
      if (err) {
          console.error("Error fetching buyers:", err);
          return res.status(500).json({ error: "Server error" });
      }
      res.json(results);
  });
});

// Get buyer count
app.get('/buyer-count', (req, res) => {
  db.query('SELECT COUNT(*) as count FROM buyer', (err, result) => {
      if (err) {
          console.error("Error getting buyer count:", err);
          return res.status(500).json({ error: "Server error" });
      }
      res.json({ count: result[0].count });
  });
});

// Delete buyer
app.post('/delete-buyer', (req, res) => {
  const { buyer_id } = req.body;
  
  db.query('DELETE FROM buyer WHERE buyer_id = ?', [buyer_id], (err, result) => {
      if (err) {
          console.error("Error deleting buyer:", err);
          return res.status(500).json({ error: "Server error" });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Buyer not found" });
      }
      
      res.redirect('/view-buyers');
  });
});

// Update buyer
app.post('/update-buyer', (req, res) => {
  console.log("Update buyer request received:", req.body);
  const { 
      buyer_id, 
      buyer_name, 
      address, 
      email, 
      contact_number, 
      nic,
      username,
      password
  } = req.body;

  // Validate required fields
  if (!buyer_id) {
      return res.status(400).json({ error: "Buyer ID is required" });
  }

  const query = `UPDATE buyer 
               SET buyer_name = ?, address = ?, email = ?, 
                   contact_number = ?, NIC = ?, username = ?, 
                   PASSWORD = ? 
               WHERE buyer_id = ?`;

  db.query(
      query, 
      [
          buyer_name || '', 
          address || '', 
          email || '', 
          contact_number || '', 
          nic || '', 
          username || '', 
          password || '',
          buyer_id
      ], 
      (err, result) => {
          if (err) {
              console.error("Error updating buyer:", err);
              return res.status(500).json({ error: "Server error", details: err.message });
          }
          
          console.log("Update result:", result);
          
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: "Buyer not found" });
          }
          
          console.log("Buyer updated successfully, affected rows:", result.affectedRows);
          res.json({ success: true, message: "Buyer updated successfully" });
      }
  );
});


// Get harvest count
app.get('/harvest-count', (req, res) => {
  db.query('SELECT COUNT(*) as count FROM Harvest', (err, result) => {
      if (err) {
          console.error("Error getting harvest count:", err);
          return res.status(500).json({ error: "Server error" });
      }
      res.json({ count: result[0].count });
  });
});

// Delete harvest
app.post('/delete-harvest', (req, res) => {
  const { buyer_id } = req.body;
  
  db.query('DELETE FROM Harvest WHERE harvest_id = ?', [harvest_id], (err, result) => {
      if (err) {
          console.error("Error deleting harvest:", err);
          return res.status(500).json({ error: "Server error" });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "harvest not found" });
      }
      
      res.redirect('/view-harvest');
  });
});

// Update buyer
app.post('/update-harvest', (req, res) => {
  console.log("Update harvest request received:", req.body);
  const { 
      harvest_id, 
      contact_number,
      total_harvest,
      unit_price,
  } = req.body;

  // Validate required fields
  if (!harvest_id) {
      return res.status(400).json({ error: "Harvest ID is required" });
  }

  const query = `UPDATE Harvest 
               SET  contact_number=?,total_harvest=?, unit_price=?
               WHERE harvest_id = ?`;

  db.query(
      query, 
      [
        contact_number|| '', 
        total_harvest || '', 
        unit_price|| '', 
         harvest_id
      ], 
      (err, result) => {
          if (err) {
              console.error("Error updating harvest:", err);
              return res.status(500).json({ error: "Server error", details: err.message });
          }
          
          console.log("Update result:", result);
          
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: "Harvest not found" });
          }
          
          console.log("Harvest updated successfully, affected rows:", result.affectedRows);
          res.json({ success: true, message: "Harvest updated successfully" });
      }
  );
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});