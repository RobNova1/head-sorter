const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

// Serve static files (e.g., Bootstrap CSS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get the top three most recently modified players
app.get('/api/top-players', (req, res) => {
    db.all('SELECT * FROM players ORDER BY modified_at DESC LIMIT 6', (err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.json(rows);
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'top_player.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
