const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

// Serve static files (e.g., Bootstrap CSS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get the most recently modified player
app.get('/api/top-player', (req, res) => {
    db.get('SELECT * FROM players ORDER BY modified_at DESC LIMIT 1', (err, row) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.json(row);
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
