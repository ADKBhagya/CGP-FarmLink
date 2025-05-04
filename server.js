const express = require("express");
const cors = require("cors");
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require("../CGP-FarmLink/backend/db");

// Initialize a SINGLE Express app
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Existing Routes
const staffRoutes = require("../CGP-FarmLink/backend/routes/staff");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// New Shop Routes
const rentItemsRoutes = require("../CGP-FarmLink/backend/routes/rentItems");
const fertilizersRoutes = require("../CGP-FarmLink/backend/routes/fertilizers");
const buyersRoutes = require("../CGP-FarmLink/backend/routes/buyers");
const dashboardRoutes = require("../CGP-FarmLink/backend/routes/dashboard");



// API Routes
app.use("/api/staff", staffRoutes);
app.use("/api/rent-items", rentItemsRoutes);
app.use("/api/fertilizers", fertilizersRoutes);

// Farmer details route
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

// Harvest details route
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

// Root Route
app.get("/", (req, res) => {
    res.send("FarmLink Backend is Running! 🚀");
});






//SERVICES SECTION CODES

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

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Main page route
app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, 'public/services.html'));
});

// -------------------------------
// Routes for Rent Items Section
// -------------------------------

// Route to serve the rent items page
app.get('/rent-items', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/rent.html'));
});

// Route to serve the rent item details page
app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/rent-productdetails.html'));
});

// Route to serve the fertilizer item details page
app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/fertilizer-productdetails.html'));
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
            const processedCard = {...card };

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
                const processedCard = {...card };
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
            const processedCard = {...card };
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
        query, [name, price, phone_no, location, description, rating, item_details, category, days, stock, imageBuffer],
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

// Route to serve the fertilizer items page
app.get('/fertilizer-items', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/fertilizer.html'));
});

// Route to serve the fertilizer item details page
app.get('/harvest-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/fertilizer-productdetails.html'));
});

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
        query, [imageBuffer, name, price, phone_no, location, description, rating, item_details, category, days, stock],
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
                    'UPDATE rent_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?', [newQuantity, newDays, userId, cardId],
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
                    'INSERT INTO rent_cart (user_id, card_id, quantity, days) VALUES (?, ?, ?, ?)', [userId, cardId, quantity || 1, days || 1],
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
                    'UPDATE fertilizer_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?', [newQuantity, newDays, userId, cardId],
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
                    'INSERT INTO fertilizer_cart (user_id, card_id, quantity, days) VALUES (?, ?, ?, ?)', [userId, cardId, quantity || 1, days || 1],
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
            const processedItem = {...item };

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
            const processedItem = {...item };

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
        'UPDATE rent_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?', [quantity, days, userId, cardId],
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
        'UPDATE fertilizer_cart SET quantity = ?, days = ? WHERE user_id = ? AND card_id = ?', [quantity, days, userId, cardId],
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
        'DELETE FROM rent_cart WHERE user_id = ? AND card_id = ?', [userId, cardId],
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
        'DELETE FROM fertilizer_cart WHERE user_id = ? AND card_id = ?', [userId, cardId],
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














//ADMIN CODES



// Serve the dashboard page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// Route for View Staff page
app.get('/view-staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewstaff.html'));
});

// Route for View Staff page
app.get('/viewstaff', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewstaff.html'));
});

// Route for View Farmer page
app.get('/view-farmer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewfarmer.html'));
});

// Route for View Harvest page
app.get('/view-harvest', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewharvest.html'));
});

// Route for View Shop page
app.get('/view-shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewshop.html'));
});

// Route for View Buyers page
app.get('/view-buyers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewbuyer.html'));
});

// Route to handle form submission
app.post('/create-staff', (req, res) => {
    console.log(req.body); // Log the incoming data to ensure it's being passed correctly
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
        if (err) throw err;
        res.render('viewstaff', { staff: results });
    });
});


// Route to delete staff
app.post('/delete-staff', (req, res) => {
    const { staff_id } = req.body; // Get the staff_id from the form submission

    // Query to delete the staff by staff_id
    db.query('DELETE FROM staff WHERE staff_id = ?', [staff_id], (err, result) => {
        if (err) {
            console.error("Error deleting staff:", err);
            return res.status(500).send("Server error");
        }
        res.redirect('/viewstaff'); // Redirect to the staff view page after deletion
    });
});

app.get('/get-staff', (req, res) => {
    db.query('SELECT * FROM staff', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(results); // Send staff data as JSON
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
        query, [
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
    console.log('Received Form Data:', req.body); // Log the form fields
    console.log('Received Uploaded File:', req.file); // Log the file data

    // Extract data from the form
    const { fertilizer_name, price, stock, category, description, rating, item_details } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Path to the uploaded image

    // Prepare the SQL query to insert fertilizer data
    const query = `INSERT INTO fertilizer (fertilizer_name, price, stock, category, description, rating, item_details, image) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // Insert the data into the database
    db.query(query, [fertilizer_name, price, stock, category, description, rating, item_details, image], (err, result) => {
        if (err) {
            console.error('Database Error:', err.stack); // Log the error stack for more details
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

        // Process the results to handle BLOB images
        const processedResults = result.map(fertilizer => {
            // Create a copy of the fertilizer object
            const processedFertilizer = {...fertilizer };

            // If image is a Buffer (BLOB data), convert it to base64
            if (processedFertilizer.image && Buffer.isBuffer(processedFertilizer.image)) {
                processedFertilizer.image = `data:image/jpeg;base64,${processedFertilizer.image.toString('base64')}`;
            }

            return processedFertilizer;
        });

        res.json(processedResults); // Send the processed results back as JSON
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

        // Process BLOB image if exists
        if (result[0] && result[0].image && Buffer.isBuffer(result[0].image)) {
            result[0].image = `data:image/jpeg;base64,${result[0].image.toString('base64')}`;
        }

        res.json(result[0]); // Send the fertilizer details
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

        // Process the results to handle BLOB images
        const processedResults = result.map(fertilizer => {
            // Create a copy of the fertilizer object
            const processedFertilizer = {...fertilizer };

            // If image is a Buffer (BLOB data), convert it to base64
            if (processedFertilizer.image && Buffer.isBuffer(processedFertilizer.image)) {
                processedFertilizer.image = `data:image/jpeg;base64,${processedFertilizer.image.toString('base64')}`;
            }

            return processedFertilizer;
        });

        res.json(processedResults); // Send a list of other fertilizers
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
    console.log('Received Form Data:', req.body); // Log the form fields
    console.log('Received Uploaded File:', req.file); // Log the file data

    // Extract data from the form
    const { name, price, phone_no, location, description, rating, item_details, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Prepare the SQL query to insert rent card data
    const query = `INSERT INTO rent_cards (name, price, phone_no, location, description, rating, item_details, category, image) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Insert the data into the database
    db.query(query, [name, price, phone_no, location, description, rating, item_details, category, image], (err, result) => {
        if (err) {
            console.error('Database Error:', err.stack); // Log the error stack for more details
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
            const processedCard = {...card };

            // If image is a Buffer (BLOB data), convert it to base64
            if (processedCard.image && Buffer.isBuffer(processedCard.image)) {
                processedCard.image = `data:image/jpeg;base64,${processedCard.image.toString('base64')}`;
            }

            return processedCard;
        });

        res.json(processedResults); // Send the processed results back as JSON
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
        res.json(result[0]); // Send the first matching result as JSON
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
        res.json(result); // Send a list of other cards
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
        query, [
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
        query, [
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
        query, [
            contact_number || '',
            total_harvest || '',
            unit_price || '',
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


// Start a SINGLE server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

















//HARVEST CODES


// Connect to database
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        console.log('Running in fallback mode with in-memory data');
        return;
    }
    console.log('Connected to MySQL database');

    // Create table if not exists
    const createTableQuery = `
  CREATE TABLE IF NOT EXISTS harvest_cards (
      card_id INT(11) PRIMARY KEY AUTO_INCREMENT,
      image VARCHAR(255),
      name VARCHAR(100),
      price DECIMAL(10,2),
      phone_no VARCHAR(15),
      location VARCHAR(100),
      description TEXT,
      rating DECIMAL(2,1),
      item_details TEXT,
      category VARCHAR(50),
      stock INT(11),
      days INT(11)
  )`;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }
        console.log('Table checked/created successfully');
    });
});

// Fallback products array in case database connection fails
let fallbackProducts = [];

// API Routes
// Get all products
app.get('/api/products', (req, res) => {
    // Check if database is connected
    if (db.state === 'disconnected') {
        return res.json(fallbackProducts);
    }

    const query = 'SELECT * FROM harvest_cards';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }

        // Convert BLOB image data to base64 for easy transport
        const products = results.map(product => {
            const processedProduct = {...product };
            if (product.image) {
                // Convert binary image data to Base64 string
                processedProduct.image = `data:image/jpeg;base64,${Buffer.from(product.image).toString('base64')}`;
            }
            return processedProduct;
        });

        res.json(products);
    });
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    // Check if database is connected
    if (db.state === 'disconnected') {
        const product = fallbackProducts.find(p => p.card_id === parseInt(productId));

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.json(product);
    }

    const query = 'SELECT * FROM harvest_cards WHERE card_id = ?';

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Convert BLOB image data to base64
        const product = {...results[0] };
        if (product.image) {
            product.image = `data:image/jpeg;base64,${Buffer.from(product.image).toString('base64')}`;
        }

        res.json(product);
    });
});

// Add a new product
// Add a new product
app.post('/api/products', upload.single('image'), (req, res) => {
    try {
        const {
            name,
            price,
            phone_no,
            location,
            description,
            category,
            item_details,
            stock,
            days
        } = req.body;

        // Check if required fields are present
        if (!name || !price) {
            return res.status(400).json({ error: 'Missing required fields: name and price are required' });
        }

        // Get the image data from the uploaded file
        const imageBuffer = req.file ? req.file.buffer : null;

        // Set a default rating for new products
        const rating = 5.0;

        // Set a default location if not provided
        const productLocation = location || 'Local Farm';

        // Check if database is connected
        if (db.state === 'disconnected') {
            console.log('Database disconnected, using fallback storage');
            const maxId = fallbackProducts.length > 0 ?
                fallbackProducts.reduce((max, product) => Math.max(max, product.card_id), 0) : 0;
            const newId = maxId + 1;

            // For fallback mode, convert image buffer to base64
            let imageData = null;
            if (imageBuffer) {
                imageData = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            }

            const newProduct = {
                card_id: newId,
                name,
                price,
                phone_no,
                location: productLocation,
                description,
                category,
                item_details,
                stock: stock || 1,
                days: days || 1,
                image: imageData,
                rating
            };

            fallbackProducts.push(newProduct);
            return res.status(201).json(newProduct);
        }

        console.log('Adding product to database:', {
            name,
            price,
            phone_no,
            location: productLocation,
            description,
            category,
            item_details,
            stock,
            days
        });

        // With database connected, insert the product
        const query = `
INSERT INTO harvest_cards 
(name, price, phone_no, location, description, category, item_details, stock, days, image, rating) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(
            query, [name, price, phone_no, productLocation, description, category, item_details, stock || 1, days || 1, imageBuffer, rating],
            (err, result) => {
                if (err) {
                    console.error('Error adding product:', err);
                    return res.status(500).json({ error: `Failed to add product: ${err.message}` });
                }

                // Return the created product with the new ID
                const createdProduct = {
                    card_id: result.insertId, // This will be the auto-generated ID
                    name,
                    price,
                    phone_no,
                    location: productLocation,
                    description,
                    category,
                    item_details,
                    stock: stock || 1,
                    days: days || 1,
                    image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer.toString('base64')}` : null,
                    rating
                };

                res.status(201).json(createdProduct);
            }
        );
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

// Update a product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    try {
        const productId = req.params.id;
        const {
            name,
            price,
            phone_no,
            location,
            description,
            category,
            item_details,
            stock,
            days
        } = req.body;

        // Check if required fields are present
        if (!name || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get the image data from the uploaded file
        const imageBuffer = req.file ? req.file.buffer : null;

        // Set a default rating if not provided
        const rating = 5.0;

        // Check if database is connected
        if (db.state === 'disconnected') {
            const productIndex = fallbackProducts.findIndex(p => p.card_id === parseInt(productId));

            if (productIndex === -1) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // For fallback mode, convert image buffer to base64 or keep existing image
            let imageData = fallbackProducts[productIndex].image;
            if (imageBuffer) {
                imageData = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            }

            const updatedProduct = {
                card_id: parseInt(productId),
                name,
                price,
                phone_no,
                location,
                description,
                category,
                item_details,
                stock: stock || fallbackProducts[productIndex].stock,
                days: days || fallbackProducts[productIndex].days,
                image: imageData,
                rating: fallbackProducts[productIndex].rating
            };

            fallbackProducts[productIndex] = updatedProduct;
            return res.json(updatedProduct);
        }

        // If a new image was uploaded, update it too; otherwise, just update the other fields
        let query, queryParams;

        if (imageBuffer) {
            query = `
          UPDATE harvest_cards 
          SET name = ?, price = ?, phone_no = ?, location = ?, description = ?, 
          category = ?, item_details = ?, stock = ?, days = ?, image = ?, rating = ? 
          WHERE card_id = ?`;

            queryParams = [name, price, phone_no, location, description,
                category, item_details, stock || 1, days || 1, imageBuffer, rating, productId
            ];
        } else {
            query = `
          UPDATE harvest_cards 
          SET name = ?, price = ?, phone_no = ?, location = ?, description = ?, 
          category = ?, item_details = ?, stock = ?, days = ?, rating = ? 
          WHERE card_id = ?`;

            queryParams = [name, price, phone_no, location, description,
                category, item_details, stock || 1, days || 1, rating, productId
            ];
        }

        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).json({ error: 'Failed to update product' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Get the updated product to return
            db.query('SELECT * FROM harvest_cards WHERE card_id = ?', [productId], (err, results) => {
                if (err || results.length === 0) {
                    return res.json({
                        card_id: parseInt(productId),
                        name,
                        price,
                        phone_no,
                        location,
                        description,
                        category,
                        item_details,
                        stock: stock || 1,
                        days: days || 1
                    });
                }

                // Convert BLOB image data to base64
                const product = {...results[0] };
                if (product.image) {
                    product.image = `data:image/jpeg;base64,${Buffer.from(product.image).toString('base64')}`;
                }

                res.json(product);
            });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    // Check if database is connected
    if (db.state === 'disconnected') {
        const productIndex = fallbackProducts.findIndex(p => p.card_id === parseInt(productId));

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        fallbackProducts.splice(productIndex, 1);
        return res.json({ message: 'Product deleted successfully' });
    }

    const query = 'DELETE FROM harvest_cards WHERE card_id = ?';

    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    });
});

// Handle product details page
app.get('/product-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product-details.html'));
});

// Handle cart page
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Serve the HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'harvest.html'));
});

app.get('/farmer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'farmer.html'));
});

// Error handler for multer file upload errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        // An unknown error occurred
        return res.status(500).json({ error: err.message });
    }
    next();
});






























app.use("/api/buyers", buyersRoutes);

app.use("/api/dashboard", dashboardRoutes);

/*
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import userRouter from './routes/customer.routes.js';
import { checkConnection } from './functions/db.functions.js';
import farmerRouter from './routes/farmer.routes.js';
import loginRouter from './routes/login.routes.js';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './.env' });
*/
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');
/*
checkConnection();

app.use('/api/customer', userRouter);
app.use('/api/farmer', farmerRouter);
app.use('/api/auth', loginRouter);
*/
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/customer", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "customer.html"));
});

app.get("/farmer", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "farmer.html"));
});

app.get("/customer-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "customer-dashboard.html"));
});

app.get("/farmer-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "farmer-dashboard.html"));
});

app.get("/staff-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "staff-dashboard.html"));
});

