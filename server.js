const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Password',
    database: 'Database_Name'
});

// Get Stocks Information
app.get('/api/stocks', (req, res) => {
    const username = req.query.username;

    let query = `SELECT * FROM ${mysql.escapeId(username)} WHERE State = 'Holding'`;
    const params = [];

    const { Stock_Name, Account_Name } = req.query;

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

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password, name, gender, address, email, dob, contact_number } = req.body;

    const dobDate = new Date(dob);
    const age = Math.floor((new Date() - dobDate) / (1000 * 60 * 60 * 24 * 365.25));

    pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        } else {
            if (results.length > 0) {
                res.status(409).json({ success: false, message: 'Username already exists.' });
            } else {
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
                                        CREATE TABLE ${mysql.escapeId(username)} (
                                            id INT PRIMARY KEY AUTO_INCREMENT,
                                            stock_Name varchar(100) not null,
                                            Quantity int not null,
                                            Price float not null,
                                            charges float not null,
                                            Acc_Name varchar(100) not null,
                                            inv_amt int not null,
                                            Date_purch date not null,
                                            State varchar(50) not null,
                                            Profit_made int
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
    const username = req.query.username;
    const { Stocks_Name, Quantity, Price, Charges, Account_Name, Purchase_Date } = req.body;
    const quantity = parseFloat(Quantity);
    const price = parseFloat(Price);
    const charges = parseFloat(Charges);
    const Amount_invested = (quantity * price) + charges;

    const checkQuery = `SELECT Quantity, inv_amt FROM ${mysql.escapeId(username)} WHERE Stock_Name = ? AND Acc_Name = ?`;

    pool.query(checkQuery, [Stocks_Name, Account_Name], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        }

        if (results.length > 0) {
            const existingQuantity = results[0].Quantity;
            const existingInvAmt = results[0].inv_amt;

            const newQuantity = existingQuantity + quantity;
            const newInvAmt = existingInvAmt + Amount_invested;
            const newPrice = newInvAmt / newQuantity;

            // Update the existing stock entry
            const updateQuery = `UPDATE ${mysql.escapeId(username)} SET Quantity = ?, Price = ?, inv_amt = ? WHERE Stock_Name = ? AND Acc_Name = ?`;

            pool.query(updateQuery, [newQuantity, newPrice, newInvAmt, Stocks_Name, Account_Name], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred while updating the stock.' });
                }
                return res.status(200).json({ success: true, message: 'Stock updated successfully.' });
            });
        } else {
            // Stock does not exist, insert a new one with default state and profit_made as null
            const insertQuery = `INSERT INTO ${mysql.escapeId(username)} (Stock_Name, Quantity, Price, Charges, Acc_Name, inv_amt, Date_purch, State, Profit_made) VALUES (?, ?, ?, ?, ?, ?, ?, 'Holding', NULL)`;

            pool.query(insertQuery, [Stocks_Name, Quantity, Price, Charges, Account_Name, Amount_invested, Purchase_Date], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'An error occurred while adding the stock.' });
                }
                return res.status(200).json({ success: true, message: 'Stock added successfully.' });
            });
        }
    });
});


// Endpoint to get stock names
app.get('/api/stocknames', (req, res) => {
    const username = req.query.username;
    const tableName = mysql.escapeId(username); // Escape the table name
    pool.query(`SELECT DISTINCT stock_Name FROM ${tableName} where State = "Holding"`, (err, results) => { // Use backticks here
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching stock names.' });
        }

        const stockNames = results.map(row => row.stock_Name);
        res.status(200).json({ success: true, stockNames });
    });
});

// Endpoint to get stock names
app.get('/api/indianstocks', (req, res) => {
    pool.query(`SELECT distinct stock_name FROM indian_stocks order by stock_name`, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching stock names.' });
        }

        const stockNames = results.map(row => row.stock_name); // Ensure the correct column name
        res.status(200).json({ success: true, stockNames });
    });
});


// Get Account Name for dropdown
app.get('/api/accountnames', (req, res) => {
    const username = req.query.username;
    const tableName = mysql.escapeId(username); // Escape the table name
    pool.query(`SELECT DISTINCT Acc_Name FROM ${tableName} `, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'An error occurred while fetching account names.' });
        }
        const accountNames = results.map(row => row.Acc_Name);
        res.status(200).json({ success: true, accountNames });
    });
});


// Get the information for Home Page
app.get('/api/dashboard', (req, res) => {
    const username = req.query.username;
    pool.query(`
        SELECT 
            Acc_Name, 
    SUM(CASE WHEN State = 'Holding' THEN inv_amt ELSE 0 END) AS Amount_Invested,
    SUM(CASE WHEN State = 'Sold' THEN profit_made ELSE 0 END) AS Realized_Profit 
        FROM ?? 
        GROUP BY Acc_Name
    `, [username], (err, results) => {
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
                        const token = jwt.sign({ id: user.id, username: user.username },
                            'your-secret-key', { expiresIn: '1h' }
                        );
                        res.json({ success: true, token: token });
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

// stock Price api
const fetchStockPrice = async(ticker) => {
    const url = `https://www.google.com/finance/quote/${ticker}:NSE`;
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const priceElement = $(".YMlKec.fxKbKc");

        if (priceElement.length) {
            return priceElement.text().trim().replace("₹", "").replace(/,/g, "");
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

    const tickers = stockNames.split(',');
    const prices = {};

    try {
        for (const ticker of tickers) {
            prices[ticker] = await fetchStockPrice(ticker);
        }

        res.json(prices);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.delete('/api/deletestocks/:id', (req, res) => {
    const { id } = req.params;
    const username = req.query.username;

    const tableName = mysql.escapeId(username);
    const query = `DELETE FROM ${tableName} WHERE id = ?`;

    pool.query(query, [id], (err, result) => {
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

app.get('/api/user/:username', (req, res) => {
    const username = req.params.username;
    pool.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
        if (results.length > 0) {
            res.status(200).json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

app.put('/api/user/:username', (req, res) => {
    const username = req.params.username; // Use username parameter
    const { name, gender, address, email, age, dob, contact_number } = req.body;
    pool.query(
        'UPDATE Users SET name = ?, gender = ?, address = ?, email = ?, age = ?, dob = ?, contact_number = ? WHERE username = ?', [name, gender, address, email, age, dob, contact_number, username],
        (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            if (results.affectedRows > 0) {
                res.status(200).json({ success: true, message: 'User updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        }
    );
});


app.put('/api/updatestock/:id', (req, res) => {
    const { id } = req.params;
    const { stock, profitOrLoss, sellingPrice, investedAmount, balance } = req.body;
    const username = req.query.username;

    // Check if username is provided
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const tableName = mysql.escapeId(username); // Escape username

    if (stock.Quantity == null) {
        // Update the existing stock to mark it as sold
        const queryUpdate = `UPDATE ${tableName} SET State = 'Sold' WHERE id = ?`;

        pool.query(queryUpdate, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            res.status(200).json({ success: true, message: 'Stock marked as sold' });
        });
    } else {
        // Fetch current stock details
        const queryFetch = `SELECT * FROM ${tableName} WHERE id = ?`;

        pool.query(queryFetch, [id], (err, currentStock) => {
            if (err || currentStock.length === 0) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Server error or stock not found' });
            }

            const existingQuantity = currentStock[0].Quantity;
            const newQuantity = existingQuantity - stock.Quantity;

            // Update the remaining stock
            const queryUpdateStock = `UPDATE ${tableName} SET Quantity = ?, Profit_made = ?, inv_amt = ? WHERE id = ?`;
            pool.query(queryUpdateStock, [stock.Quantity, profitOrLoss, balance, id], (err, updateResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Server error while updating stock' });
                }

                // Format the date to 'YYYY-MM-DD HH:MM:SS'
                const currentDate = new Date();
                const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

                // Insert a new row for the sold stock
                const queryInsertSold = `INSERT INTO ${tableName} (stock_Name, Quantity, Price, charges, Acc_Name, inv_amt, Date_purch, Profit_made, State) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Sold')`;
                pool.query(queryInsertSold, [stock.stock_Name, newQuantity, sellingPrice, stock.charges, stock.Acc_Name, investedAmount, formattedDate, profitOrLoss], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'Server error while inserting sold stock' });
                    }

                    res.status(200).json({ success: true, message: 'Stock updated and sold stock recorded' });
                });
            });
        });
    }
});

app.put('/api/editstock/:id', (req, res) => {
    const { Price, quantity, Account_Name, Stock_Name, username } = req.body;
    const id = req.params.id;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const query = `UPDATE ${mysql.escapeId(username)} 
                   SET Price = ?, Quantity = ?, Acc_Name = ?, Stock_Name = ?
                   WHERE id = ?`;

    pool.query(query, [Price, quantity, Account_Name, Stock_Name, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to update stock.' });
        }
        return res.status(200).json({ success: true, message: 'Stock updated successfully.' });
    });
});


app.get('/api/filteredInvestments', (req, res) => {
    const { username, accounts, fromDate, toDate } = req.query;
    const accountArray = accounts.split(',').map(acc => `'${acc}'`).join(',');
    const tableName = username;

    const query = `
        SELECT Acc_name, stock_name, date_purch, Quantity, profit_made
        FROM ${tableName}
        WHERE State = 'Sold'
          AND Acc_Name IN (${accountArray})
          AND Date_purch BETWEEN ? AND ?`;

    pool.query(query, [fromDate, toDate], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, investmentSummary: results });
    });
});

app.delete('/api/deletestocks/:id', (req, res) => {
    const { id } = req.params;
    const username = req.query.username;

    const tableName = mysql.escapeId(username);
    const query = `DELETE FROM ${tableName} WHERE id = ?`;

    pool.query(query, [id], (err, result) => {
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
