const express = require('express');
const basicAuth = require('basic-auth');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

console.log(`USERNAME: ${USERNAME}, PASSWORD: ${PASSWORD}`);

// Initialize and connect to the SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS team (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table "team" is ready.');
            }
        });
    }
});

app.use(bodyParser.urlencoded({ extended: false }));

function auth(req, res, next) {
    const user = basicAuth(req);
    console.log('User:', user);
    if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).send('Authentication required.');
    }
    next();
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

// Route to add a new team member
app.post('/add-team-member', (req, res) => {
    const { name, role } = req.body;
    const sql = 'INSERT INTO team (name, role) VALUES (?, ?)';
    db.run(sql, [name, role], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Failed to add team member' });
        }
        res.json({ message: 'Team member added successfully', id: this.lastID });
    });
});

// Route to get all team members
app.get('/get-team-members', (req, res) => {
    const sql = 'SELECT * FROM team';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve team members' });
        }
        res.json(rows);
    });
});

// Route to serve index.html (assuming it's your home page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bootstrap.html'));
});

// Route to serve team.html
app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'barchart.html'));
});

// Route to serve roster.html
app.get('/roster', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'roster.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});


// // server.js
// const express = require('express');
// const db = require('./database');

// const app = express();
// const port = 3000;

app.get('/data', (req, res) => {
    db.all("SELECT house, COUNT(FULLNAME) as count FROM house_mock GROUP BY house", (err, rows) => {
        if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

// app.use(express.static('public'));

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}/`);
// });
