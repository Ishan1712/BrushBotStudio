const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change to your MySQL username
    password: 'Ishan_17', // Change to your MySQL password
    database: 'PaintStation'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Fetch all brush files
app.get('/brushfiles', (req, res) => {
    db.query('SELECT * FROM BrushFile', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});
// Fetch latest status from heartbeatlog
app.get('/status', (req, res) => {
    db.query('SELECT status FROM heartbeatlog ORDER BY timestamp DESC LIMIT 1', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results.length > 0 ? results[0] : { status: 0 }); // Default to 0 if no status found
        }
    });
});

// Update brush file
app.put('/brushfiles/:id', (req, res) => {
    const { atom, fluid, shape, description } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE BrushFile SET atom=?, fluid=?, shape=?, description=? WHERE id=?';
    db.query(sql, [atom, fluid, shape, description, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ message: 'Updated successfully' });
        }
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
