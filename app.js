
const express = require('express');
const app = express();
const port = 3000;

// Enable CORS 
const cors = require('cors');
app.use(cors());

// Serve static files 
app.use(express.static('public'));

// API endpoint
app.get('/api/example', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
