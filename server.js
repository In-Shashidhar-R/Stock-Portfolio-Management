const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Import axios
const cheerio = require('cheerio');


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Sashidhar@04',
    database: 'portfolio'
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password, name, gender, address, email, age, dob, contact_number } = req.body;

    pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        } else {
            if (results.length > 0) {
                res.status(409).json({ success: false, message: 'Username already exists.' });
            } else {
                // Hash the password before saving
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
                    } else {
                        pool.query('INSERT INTO users (username, password, name, gender, address, email, age, dob, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [username, hash, name, gender, address, email, age, dob, contact_number],
                            (error, results) => {
                                if (error) {
                                    console.error(error);
                                    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
                                } else {
                                    // Create a table with the username
                                    const createTableQuery = `
                                        CREATE TABLE ${mysql.escapeId(name)} (
                                            stock_Name varchar(100) not null,
                                            Quantity int not null,
                                            Price float not null,
                                            charges float not null,
                                            Acc_Name varchar(100) not null,
                                            inv_amt int not null,
                                            Date_purch date not null
                                        )`;

                                    pool.query(createTableQuery, (tableError) => {
                                        if (tableError) {
                                            console.error(tableError);
                                            res.status(500).json({ success: false, message: 'User registered but failed to create user-specific table.' });
                                        } else {
                                            res.json({ success: true, message: 'User registered successfully and user table created.' });
                                        }
                                    });
                                }
                            });
                    }
                });
            }
        }
    });
});

// addstocks endpoint
app.post('/api/addstocks', (req, res) => {
    const { Stocks_Name, Quantity, Price, Charges, Account_Name, Purchase_Date } = req.body;
    const Amount_invested = (Quantity * Price + Charges).toFixed(2); // Calculate and format Amount Invested

    pool.query(
        'INSERT INTO test1 (Stock_Name, Quantity, Price, Charges, Acc_Name, inv_amt, Date_purch) VALUES (?, ?, ?, ?, ?, ?, ?)', [Stocks_Name, Quantity, Price, Charges, Account_Name, Amount_invested, Purchase_Date],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
            }

            res.status(200).json({ success: true, message: 'Stock added successfully.' });
        }
    );
});

// Endpoint to get stock names
app.get('/api/stocknames', (req, res) => {
    pool.query('SELECT DISTINCT stock_Name FROM test1', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching stock names.' });
        }

        const stockNames = results.map(row => row.stock_Name);
        res.status(200).json({ success: true, stockNames });
    });
});

// Get Account Name for dropdown
app.get('/api/accountnames', (req, res) => {
    pool.query('SELECT DISTINCT Acc_Name FROM test1', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching account names.' });
        }
        const accountNames = results.map(row => row.Acc_Name); // Correct mapping to Acc_Name
        res.status(200).json({ success: true, accountNames });
    });
});

// Get the information for Home Page
app.get('/api/dashboard', (req, res) => {
    pool.query('select acc_Name,sum(inv_amt) as Total_Investment from test1 group by Acc_name', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching account summaries.' });
        }
        const investmentSummary = results;
        res.status(200).json({ success: true, investmentSummary });
    });
});


//Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        } else {
            if (results.length > 0) {
                const user = results[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
                    } else if (isMatch) {
                        res.json({ success: true, username: user.username });
                    } else {
                        res.json({ success: false, message: 'Invalid username or password.' });
                    }
                });
            } else {
                res.json({ success: false, message: 'Invalid username or password.' });
            }
        }
    });
});

// Get the stocks information
app.get('/api/stocks', (req, res) => {
    const { Stock_Name, Account_Name } = req.query;

    let query = 'SELECT * FROM test1 WHERE 1=1';
    const params = [];

    if (Stock_Name) {
        query += ' AND stock_Name = ?';
        params.push(Stock_Name);
    }

    if (Account_Name) {
        query += ' AND Acc_Name = ?';
        params.push(Account_Name);
    }

    pool.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching stocks.' });
        }
        res.status(200).json({ success: true, stocks: results });
    });
});

let settings = {
    profile: { username: 'user123', email: 'user@example.com' },
    notifications: { email: true, sms: false },
    apiKeys: { alphaVantage: 'BIDD06H3Z0V4ZXSO' }
};

// stock Price api

const fetchStockPrice = async(ticker) => {
    const url = `https://www.google.com/finance/quote/${ticker}:NSE`;
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const priceElement = $(".YMlKec.fxKbKc");

        if (priceElement.length) {
            return priceElement.text().trim().replace("₹", "");
        } else {
            return 'Not found';
        }
    } catch (error) {
        console.error(`Error fetching price for ${ticker}:`, error);
        return 'Error';
    }
};

// Endpoint to get current prices of stocks
app.get('/api/current-prices', async(req, res) => {
    const { stockNames } = req.query;

    if (!stockNames) {
        return res.status(400).json({ error: 'stockNames query parameter is required' });
    }

    const tickers = stockNames.split(','); // Split stock names if multiple
    const prices = {};

    try {
        // Fetch prices for each ticker one by one
        for (const ticker of tickers) {
            prices[ticker] = await fetchStockPrice(ticker);
        }

        res.json(prices);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.get('/api/settings', (req, res) => {
    res.json(settings);
});

app.put('/api/settings/profile', (req, res) => {
    settings.profile = req.body;
    res.status(200).send('Profile updated');
});

app.put('/api/settings/notifications', (req, res) => {
    settings.notifications = req.body;
    res.status(200).send('Notifications updated');
});

app.put('/api/settings/api-keys', (req, res) => {
    settings.apiKeys = req.body;
    res.status(200).send('API Keys updated');
});
app.delete('/api/deletestocks/:id', (req, res) => {
    const { id } = req.params;

    pool.query('DELETE FROM test1 WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Stock deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Stock not found' });
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});