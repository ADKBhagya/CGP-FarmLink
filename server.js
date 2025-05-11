const express = require("express");
const cors = require('cors');
require("dotenv").config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require("./backend/db");

// Route Imports (Avoid redeclaration!)
const staffRoutes = require("./backend/routes/staff");
const rentItemsRoutes = require("./backend/routes/rentItems");
const fertilizersRoutes = require("./backend/routes/fertilizers");
const buyersRoutes = require("./backend/routes/buyers");
const dashboardRoutes = require("./backend/routes/dashboard");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


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













//SERVICES SECTION CODES START

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure the uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// -------------------------------
// Routes for Rent Items Section
// -------------------------------

// Route to serve the rent items page
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/rent-items', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/services/rent.html'));
});

// Route for fertilizer product details
app.get('/html/services/harvest-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/services/fertilizer-productdetails.html'));
});

// Route for rent product details
app.get('/html/services/product-details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/services/rent-productdetails.html'));
});

// Route to get rent cards with additional filtering
app.get('/getRentCardsByCategory', (req, res) => {
  const category = req.query.category || 'all';

  let query = 'SELECT * FROM rent_cards';
  if (category !== 'all') {
    query += ' WHERE category = ?';
  }
  query += ' ORDER BY card_id DESC';

  const queryParams = category !== 'all' ? [category] : [];

  db.query(query, queryParams, (err, result) => {
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

    res.json(processedResults);
  });
});

// Route to search rent cards by name or description
app.get('/searchRentCards', (req, res) => {
  const searchTerm = req.query.term || '';

  if (!searchTerm.trim()) {
    // If no search term, return all cards
    return db.query('SELECT * FROM rent_cards ORDER BY card_id DESC', (err, result) => {
      if (err) {
        console.error('Error fetching rent cards:', err);
        return res.status(500).json({ error: 'Error fetching rent cards' });
      }

      // Process images as above
      const processedResults = result.map(card => {
        const processedCard = { ...card };
        if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
          processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
        }
        return processedCard;
      });

      res.json(processedResults);
    });
  }

  // Search in name, description, and category fields
  const query = `
      SELECT * FROM rent_cards 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR location LIKE ?
      ORDER BY card_id DESC
  `;
  const searchPattern = `%${searchTerm}%`;

  db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, result) => {
    if (err) {
      console.error('Error searching rent cards:', err);
      return res.status(500).json({ error: 'Error searching rent cards' });
    }

    // Process images
    const processedResults = result.map(card => {
      const processedCard = { ...card };
      if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
        processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
      }
      return processedCard;
    });

    res.json(processedResults);
  });
});

// Route to add a new rent card
app.post('/addRentCard', upload.single('image'), (req, res) => {
  console.log('Form data received:', req.body);
  console.log('File received:', req.file);

  // Check if the image file is uploaded successfully
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Extract data from the form
  const { name, price, phone_no, location, description, rating, item_details, category, days, stock = 1 } = req.body;

  // Read the image file from disk
  let imageBuffer;
  try {
    imageBuffer = fs.readFileSync(req.file.path);
  } catch (fileErr) {
    console.error('Error reading uploaded file:', fileErr);
    return res.status(500).json({ error: 'Error processing uploaded image' });
  }

  // Query to insert rent card data
  const query = `
      INSERT INTO rent_cards 
      (name, price, phone_no, location, description, rating, item_details, category, days, stock, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Insert the data into the database
  db.query(
    query,
    [name, price, phone_no, location, description, rating, item_details, category, days, stock, imageBuffer],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Error while adding rent card: ' + err.message });
      }

      // Clean up the uploaded file after inserting to database
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Warning: Could not delete temporary file:', unlinkErr);
      }

      console.log('Card added successfully with ID:', result.insertId);
      res.status(200).json({
        success: 'Rent card added successfully',
        cardId: result.insertId
      });
    }
  );
});

// Route to get a single rent card by ID
app.get('/getRentCardById', (req, res) => {
  const cardId = req.query.id;

  if (!cardId) {
    return res.status(400).json({ error: 'Card ID is required' });
  }

  db.query('SELECT * FROM rent_cards WHERE card_id = ?', [cardId], (err, result) => {
    if (err) {
      console.error('Error fetching card details:', err);
      return res.status(500).json({ error: 'Error fetching card details' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Process image for the single card
    const card = result[0];
    if (card.image && Buffer.isBuffer(card.image)) {
      card.image = `data:image/jpeg;base64,${card.image.toString('base64')}`;
    }

    res.json(card);
  });
});

// -------------------------------
// Routes for Fertilizer Items Section
// -------------------------------


app.get('/getHarvestCardsByCategory', (req, res) => {
  const category = req.query.category || 'all';

  let query = 'SELECT * FROM fertilizer';
  if (category !== 'all') {
    query += ' WHERE category = ?';
  }
  query += ' ORDER BY fertilizer_id DESC';

  const queryParams = category !== 'all' ? [category] : [];

  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('Error fetching fertilizer cards:', err);
      return res.status(500).json({ error: 'Error fetching fertilizer cards' });
    }

    // Process the results to handle BLOB images
    const processedResults = result.map(card => {
      // Create a copy of the card object and map fertilizer_id to card_id for compatibility
      const processedCard = {
        ...card,
        card_id: card.fertilizer_id,
        name: card.fertilizer_name
      };

      // If image is a Buffer (BLOB data), convert it to base64
      if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
        processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
      }

      return processedCard;
    });

    res.json(processedResults);
  });
});

// Route to search fertilizer cards
app.get('/searchHarvestCards', (req, res) => {
  const searchTerm = req.query.term || '';

  if (!searchTerm.trim()) {
    // If no search term, return all cards
    return db.query('SELECT * FROM fertilizer ORDER BY fertilizer_id DESC', (err, result) => {
      if (err) {
        console.error('Error fetching fertilizer cards:', err);
        return res.status(500).json({ error: 'Error fetching fertilizer cards' });
      }

      // Process images as above
      const processedResults = result.map(card => {
        const processedCard = {
          ...card,
          card_id: card.fertilizer_id,
          name: card.fertilizer_name
        };

        if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
          processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
        }
        return processedCard;
      });

      res.json(processedResults);
    });
  }

  // Search in fertilizer_name, description, and category fields
  const query = `
      SELECT * FROM fertilizer 
      WHERE fertilizer_name LIKE ? OR description LIKE ? OR category LIKE ? OR location LIKE ?
      ORDER BY fertilizer_id DESC
  `;
  const searchPattern = `%${searchTerm}%`;

  db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, result) => {
    if (err) {
      console.error('Error searching fertilizer cards:', err);
      return res.status(500).json({ error: 'Error searching fertilizer cards' });
    }

    // Process images
    const processedResults = result.map(card => {
      const processedCard = {
        ...card,
        card_id: card.fertilizer_id,
        name: card.fertilizer_name
      };

      if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
        processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
      }
      return processedCard;
    });

    res.json(processedResults);
  });
});

app.post('/addHarvestCard', upload.single('image'), (req, res) => {
  console.log('Fertilizer data received:', req.body);
  console.log('Fertilizer image file received:', req.file);

  // Check if the image file is uploaded successfully
  if (!req.file) {
    console.error('No file uploaded!');
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Extract data from the form
  const { name, price, phone_no, location, description, rating, item_details, category, days, stock = 1 } = req.body;

  // Read the image file from disk
  let imageBuffer;
  try {
    imageBuffer = fs.readFileSync(req.file.path);
  } catch (fileErr) {
    console.error('Error reading uploaded file:', fileErr);
    return res.status(500).json({ error: 'Error processing uploaded image' });
  }

  // Query to insert fertilizer data
  const query = `
      INSERT INTO fertilizer 
      (image, fertilizer_name, price, phone_no, location, description, rating, item_details, category, days, stock) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Insert the data into the database
  db.query(
    query,
    [imageBuffer, name, price, phone_no, location, description, rating, item_details, category, days, stock],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Error while adding fertilizer card: ' + err.message });
      }

      // Clean up the uploaded file after inserting to database
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Warning: Could not delete temporary file:', unlinkErr);
      }

      console.log('Fertilizer card added successfully with ID:', result.insertId);
      res.status(200).json({
        success: 'Fertilizer card added successfully',
        cardId: result.insertId
      });
    }
  );
});

// Route to get a single fertilizer card by ID
app.get('/getHarvestCardById', (req, res) => {
  const cardId = req.query.id;

  if (!cardId) {
    return res.status(400).json({ error: 'Card ID is required' });
  }

  db.query('SELECT * FROM fertilizer WHERE fertilizer_id = ?', [cardId], (err, result) => {
    if (err) {
      console.error('Error fetching fertilizer card details:', err);
      return res.status(500).json({ error: 'Error fetching fertilizer card details' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Fertilizer card not found' });
    }

    // Process image for the single card and adjust field names for compatibility
    const card = result[0];

    const processedCard = {
      ...card,
      card_id: card.fertilizer_id,
      name: card.fertilizer_name
    };

    if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
      processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
    }

    res.json(processedCard);
  });
});








// Route to serve the cart page
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/cart.html'));
});

// Route to add an item to the rent cart
app.post('/addToRentCart', (req, res) => {
  const { userId, cardId, quantity, days } = req.body;

  if (!userId || !cardId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the card exists
  db.query('SELECT * FROM rent_cards WHERE card_id = ?', [cardId], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if the item is already in the cart
    db.query('SELECT * FROM rent_cart WHERE user_id = ? AND card_id = ?', [userId, cardId], (err, cartResults) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (cartResults.length > 0) {
        // Item is already in cart, update quantity and days
        const newQuantity = cartResults[0].quantity + (quantity || 1);
        const newDays = days || cartResults[0].days;

        db.query(
          'UPDATE rent_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?',
          [newQuantity, newDays, userId, cardId],
          (err, updateResult) => {
            if (err) {
              console.error('Database Error:', err);
              return res.status(500).json({ error: 'Failed to update cart' });
            }

            res.json({ success: true, message: 'Cart updated successfully' });
          }
        );
      } else {
        // Item is not in cart, add it
        db.query(
          'INSERT INTO rent_cart (user_id, card_id, quantity, days) VALUES (?, ?, ?, ?)',
          [userId, cardId, quantity || 1, days || 1],
          (err, insertResult) => {
            if (err) {
              console.error('Database Error:', err);
              return res.status(500).json({ error: 'Failed to add item to cart' });
            }

            res.json({ success: true, message: 'Item added to cart successfully' });
          }
        );
      }
    });
  });
});

app.post('/addToFertilizerCart', (req, res) => {
  const { userId, cardId, quantity, days } = req.body;

  if (!userId || !cardId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if the card exists
  db.query('SELECT * FROM fertilizer WHERE fertilizer_id = ?', [cardId], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if the item is already in the cart
    db.query('SELECT * FROM fertilizer_cart WHERE user_id = ? AND card_id = ?', [userId, cardId], (err, cartResults) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (cartResults.length > 0) {
        // Item is already in cart, update quantity and days
        const newQuantity = cartResults[0].quantity + (quantity || 1);
        const newDays = days || cartResults[0].days;

        db.query(
          'UPDATE fertilizer_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?',
          [newQuantity, newDays, userId, cardId],
          (err, updateResult) => {
            if (err) {
              console.error('Database Error:', err);
              return res.status(500).json({ error: 'Failed to update cart' });
            }

            res.json({ success: true, message: 'Cart updated successfully' });
          }
        );
      } else {
        // Item is not in cart, add it
        db.query(
          'INSERT INTO fertilizer_cart (user_id, card_id, quantity, days) VALUES (?, ?, ?, ?)',
          [userId, cardId, quantity || 1, days || 1],
          (err, insertResult) => {
            if (err) {
              console.error('Database Error:', err);
              return res.status(500).json({ error: 'Failed to add item to cart' });
            }

            res.json({ success: true, message: 'Item added to cart successfully' });
          }
        );
      }
    });
  });
});

// Update getFertilizerCart to work with the new table structure
app.get('/getFertilizerCart', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Query to join cart with fertilizer to get full item details
  const query = `
      SELECT c.cart_id, c.card_id, c.quantity, c.days, c.date_added,
             f.fertilizer_name as name, f.price, f.description, f.image, f.category, f.rating
      FROM fertilizer_cart c
      JOIN fertilizer f ON c.card_id = f.fertilizer_id
      WHERE c.user_id = ?
      ORDER BY c.date_added DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    // Process images in results
    const processedResults = results.map(item => {
      const processedItem = { ...item };

      if (processedItem.image && Buffer.isBuffer(processedItem.image)) {
        processedItem.image = `data:image/jpeg;base64,${processedItem.image.toString('base64')}`;
      }

      return processedItem;
    });

    res.json(processedResults);
  });
});

// Route to get the rent cart items for a user
app.get('/getRentCart', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Query to join cart with rent_cards to get full item details
  const query = `
      SELECT c.cart_id, c.card_id, c.quantity, c.days, c.date_added,
             r.name, r.price, r.description, r.image, r.category, r.rating
      FROM rent_cart c
      JOIN rent_cards r ON c.card_id = r.card_id
      WHERE c.user_id = ?
      ORDER BY c.date_added DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    // Process images in results
    const processedResults = results.map(item => {
      const processedItem = { ...item };

      if (processedItem.image && Buffer.isBuffer(processedItem.image)) {
        processedItem.image = `data:image/jpeg;base64,${processedItem.image.toString('base64')}`;
      }

      return processedItem;
    });

    res.json(processedResults);
  });
});


// Route to update an item in the rent cart
app.put('/updateRentCartItem', (req, res) => {
  const { userId, cardId, quantity, days } = req.body;

  if (!userId || !cardId || !quantity || !days) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'UPDATE rent_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?',
    [quantity, days, userId, cardId],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Failed to update cart item' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ success: true, message: 'Cart item updated successfully' });
    }
  );
});

// Route to update an item in the fertilizer cart (renamed from harvest)
app.put('/updateFertilizerCartItem', (req, res) => {
  const { userId, cardId, quantity, days } = req.body;

  if (!userId || !cardId || !quantity || !days) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'UPDATE fertilizer_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?',
    [quantity, days, userId, cardId],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Failed to update cart item' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ success: true, message: 'Cart item updated successfully' });
    }
  );
});

// Route to remove an item from the rent cart
app.delete('/removeRentCartItem', (req, res) => {
  const { userId, cardId } = req.query;

  if (!userId || !cardId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'DELETE FROM rent_cart WHERE user_id = ? AND card_id = ?',
    [userId, cardId],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Failed to remove cart item' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ success: true, message: 'Cart item removed successfully' });
    }
  );
});

// Route to remove an item from the fertilizer cart (renamed from harvest)
app.delete('/removeFertilizerCartItem', (req, res) => {
  const { userId, cardId } = req.query;

  if (!userId || !cardId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    'DELETE FROM fertilizer_cart WHERE user_id = ? AND card_id = ?',
    [userId, cardId],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Failed to remove cart item' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ success: true, message: 'Cart item removed successfully' });
    }
  );
});

// Route to clear the entire rent cart for a user
app.delete('/clearRentCart', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.query('DELETE FROM rent_cart WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }

    res.json({ success: true, message: 'Cart cleared successfully' });
  });
});

// Route to clear the entire fertilizer cart for a user (renamed from harvest)
app.delete('/clearFertilizerCart', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  db.query('DELETE FROM fertilizer_cart WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }

    res.json({ success: true, message: 'Cart cleared successfully' });
  });
});


//SERVICES SECTION CODES END





//ADMIN CODES START

const activeUsers = {};

// ======== LOGIN ROUTES ========

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/login.html'));
});

// Process login with database validation
app.post('/login-action', (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;

  // Query the database for the user
  const query = 'SELECT * FROM admin WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      // Failed login
      return res.redirect('http://localhost:5000/login?error=Invalid+username+or+password');
    }

    // Check if user exists and password matches
    if (results.length > 0 && results[0].password === password) {
      // Create a simple auth token
      const token = Date.now().toString();
      activeUsers[token] = {
        username,
        admin_id: results[0].admin_id,
        first_name: results[0].first_name,
        last_name: results[0].last_name
      };

      // Set token cookie with appropriate settings for cross-origin
      res.cookie('auth_token', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: 'Lax',
        secure: false
      });

      // Redirect to admin page with the Live Server URL
      return res.redirect('http://localhost:5000/admin');
    }

    // Failed login
    return res.redirect('http://localhost:5000/login?error=Invalid+username+or+password');
  });
});
// Direct login (development only)
app.get('/quick-login', (req, res) => {
  const token = Date.now().toString();
  activeUsers[token] = { username: 'admin' };
  res.cookie('auth_token', token, {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'None',
    secure: true
  });
  res.redirect('http://localhost:5000/admin');
});

// Simple auth check function
function isAuthenticated(req) {
  const token = req.cookies?.auth_token;
  return token && activeUsers[token];
}

// Logout
app.get('/logout', (req, res) => {
  const token = req.cookies?.auth_token;
  if (token) {
    delete activeUsers[token];
    res.clearCookie('auth_token');
  }
  res.redirect('http://localhost:5000/login');
});

// ======== MAIN ROUTES ========

// Serve the dashboard page (root)
app.get('/admin', (req, res) => {
  // Simple direct serving
  res.sendFile(path.join(__dirname, 'frontend/html/admin/admin.html'));
});

// Route for View Staff page
app.get('/view-staff', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewstaff.html'));
});

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

app.get('/viewbuyer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/html/admin/viewbuyer.html'));
});

// ======== API ROUTES ========

// Route to handle form submission
app.post('/create-staff', (req, res) => {
  console.log(req.body);
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
    res.sendFile(path.join(__dirname, 'frontend/html/admin/viewstaff.html'));
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
  const { staff_id } = req.body;

  db.query('DELETE FROM staff WHERE staff_id = ?', [staff_id], (err, result) => {
    if (err) {
      console.error("Error deleting staff:", err);
      return res.status(500).send("Server error");
    }
    res.redirect('/viewstaff');
  });
});

app.get('/get-staff', (req, res) => {
  db.query('SELECT * FROM staff', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// Route to update staff information
app.post('/update-staff', (req, res) => {
  console.log("Update staff request received:", req.body);
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

// Get Fertilizers
// Get Fertilizers
app.get('/getFertilizers', (req, res) => {
  const query = 'SELECT * FROM fertilizer ORDER BY fertilizer_id DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching fertilizers:', err);
      return res.status(500).json({ error: 'Error fetching fertilizers' });
    }

    // Process the results to handle BLOB images
    const processedResults = result.map(fertilizer => {
      const processedFertilizer = { ...fertilizer };

      // If image is a Buffer (BLOB data), convert it to base64
      if (processedFertilizer.image && Buffer.isBuffer(processedFertilizer.image)) {
        processedFertilizer.image = `data:image/jpeg;base64,${processedFertilizer.image.toString('base64')}`;
      }

      return processedFertilizer;
    });

    res.json(processedResults);
  });
});

// Get Rent Cards
app.get('/get-harvests', (req, res) => {
  console.log('Get harvests request received');
  console.log('Cookies:', req.cookies);
  
  const query = 'SELECT HarvestID, FarmerID, ContactNo, TotalHarvest, UnitPrice FROM Harvest';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching harvests:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    
    console.log('Query results:', results);
    
    // Map the results
    const mappedResults = results.map(row => ({
      harvest_id: row.HarvestID,
      farmer_id: row.FarmerID,
      contact_number: row.ContactNo,
      total_harvest: row.TotalHarvest,
      unit_price: row.UnitPrice
    }));
    
    console.log('Mapped results:', mappedResults);
    res.json(mappedResults);
  });
});

// Add the update-harvest route
app.post('/update-harvest', (req, res) => {
  const { harvest_id, farmer_id, contact_number, total_harvest, unit_price } = req.body;

  const query = `UPDATE Harvest 
                   SET FarmerID = ?, ContactNo = ?, TotalHarvest = ?, UnitPrice = ?
                   WHERE HarvestID = ?`;

  db.query(query, [farmer_id, contact_number, total_harvest, unit_price, harvest_id], (err, result) => {
    if (err) {
      console.error('Error updating harvest:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Harvest not found' });
    }

    res.json({ success: true, message: 'Harvest updated successfully' });
  });
});

// Add the delete-harvest route
app.post('/delete-harvest', (req, res) => {
  const { harvest_id } = req.body;

  const query = 'DELETE FROM Harvest WHERE HarvestID = ?';

  db.query(query, [harvest_id], (err, result) => {
    if (err) {
      console.error('Error deleting harvest:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Harvest not found' });
    }

    res.redirect('http://localhost:5000/viewharvest.html');
  });
});


// Route to update farmer information
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

  const query = `UPDATE Farmer 
                   SET FirstName = ?, LastName = ?, Email = ?, Contact = ?, 
                       Address = ?, NIC = ?, Gender = ?, AccNumber = ?, 
                       Location = ?, Acres = ?, Compost = ?, Harvest = ? 
                   WHERE FarmerID = ?`;

  db.query(
    query,
    [
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
      harvest,
      farmer_id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating farmer:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Farmer not found" });
      }

      console.log("Farmer updated successfully, affected rows:", result.affectedRows);
      res.json({ success: true, message: "Farmer updated successfully" });
    }
  );
});

// Route to delete farmer
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

    res.redirect('http://localhost:5000/viewfarmer.html');
  });
});

// Get Rent Cards
app.get('/getRentCards', (req, res) => {
  const query = 'SELECT * FROM rent_cards ORDER BY card_id DESC';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching rent cards:', err);
      return res.status(500).json({ error: 'Error fetching rent cards' });
    }

    // Process the results to handle BLOB images
    const processedResults = result.map(card => {
      const processedCard = { ...card };

      // If image is a Buffer (BLOB data), convert it to base64
      if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
        processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
      }

      return processedCard;
    });

    res.json(processedResults);
  });
});


// Route to update buyer information
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

  const query = `UPDATE buyer 
                   SET buyer_name = ?, address = ?, email = ?, 
                       contact_number = ?, NIC = ?, username = ?, 
                       PASSWORD = ? 
                   WHERE buyer_id = ?`;

  db.query(
    query,
    [
      buyer_name,
      address,
      email,
      contact_number,
      nic,
      username,
      password,
      buyer_id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating buyer:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Buyer not found" });
      }

      console.log("Buyer updated successfully, affected rows:", result.affectedRows);
      res.json({ success: true, message: "Buyer updated successfully" });
    }
  );
});

// Route to delete buyer
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

    res.redirect('http://localhost:5000/viewbuyer.html');
  });
});


//ADMIN CODES END





// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});


