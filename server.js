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
const fertilizer_details_path = path.join(__dirname, 'frontend/html/services/fertilizer-productdetails.html');
const rent_details_path = path.join(__dirname, 'frontend/html/services/rent-productdetails.html');

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
app.get('/frontend/html/services/harvest-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/services/fertilizer-productdetails.html'));
  });

// Route for rent product details
app.get('/frontend/html/services/product-details.html', (req, res) => {
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
          const processedCard = {...card};
          
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
              const processedCard = {...card};
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
          const processedCard = {...card};
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
          const processedItem = {...item};
          
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
          const processedItem = {...item};
          
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







// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});


