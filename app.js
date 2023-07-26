const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');
db.serialize(function () {
    db.run("CREATE TABLE users (username TEXT, password TEXT, title TEXT)");
    db.run("INSERT INTO users VALUES ('123', '123123', '123')");
});

// GET method route for the '/' path
app.get('/', function (req, res) {
    // Send the 'index.html' file to the browser
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST method route for '/login' path
app.post('/login', function (req, res) {
    // Get the username and password from the request body
    const { username, password } = req.body;

    // Create a SQL query to check the validity of username and password
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    // Execute the query on the database
    db.get(query, [username, password], function (err, row) {
        if (err) {
            console.log('ERROR', err);
            return res.redirect('/index.html#error'); // Redirect to an error page if there's an error with the database
        } else if (!row) {
            return res.redirect('/index.html#unauthorized'); // Redirect to an unauthorized page if username and password are invalid
        } else {
            // Valid credentials, send a response with a secret message
            res.send(`Hello <b>${row.title}!</b><br /> 
                This file contains all your secret data: <br /><br /> 
                SECRETS <br /><br /> MORE SECRETS <br /><br /> 
                <a href="/index.html">Go back to login</a>`);
        }
    });
});

// Start the server
const server = http.createServer(app);
const port = 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
