
# Portfolio Management System

This project is a backend application for managing user portfolios, including stock investments and account summaries. It is built using **Node.js**, **Express**, and **MySQL**, and supports various features like user registration, stock management, and real-time stock price retrieval.

---

## Features

1. **User Registration**:
   - Users can register by providing personal details.
   - Automatically creates a user-specific table for managing stock information.

2. **User Login**:
   - Authenticates users using **bcrypt** for password hashing.
   - Issues JWT tokens for secure session management.

3. **Stock Management**:
   - Add, update, and delete stocks specific to the user.
   - Dynamically fetch and display stock information based on filters.
   - Calculate investment amounts and update records if the same stock is added again.

4. **Stock Price Retrieval**:
   - Fetch real-time stock prices from Google Finance using **axios** and **cheerio**.
   - Display stock prices in the dashboard.

5. **Account Summaries**:
   - View account summaries, including total investments and realized profits for each account.

6. **Responsive Endpoints**:
   - Fetch distinct stock names and account names for dropdown filters.
   - Customizable dashboard with user-specific data.

---

## Tech Stack

- **Node.js**: Backend framework.
- **Express**: For creating RESTful APIs.
- **MySQL**: Relational database to store user and stock information.
- **bcrypt**: For secure password hashing.
- **jsonwebtoken**: For managing authentication and sessions.
- **axios** & **cheerio**: To scrape stock prices from web pages.
- **moment**: For date manipulation and calculations.
- **CORS**: For enabling cross-origin resource sharing.

---

## API Endpoints

### User Management
- **Register User**:  
  `POST /api/register`  
  Registers a new user and creates a user-specific table for stock management.

- **Login User**:  
  `POST /api/login`  
  Authenticates users and issues a JWT token.

### Stock Management
- **Get Stocks**:  
  `GET /api/stocks?username={username}`  
  Fetches stocks for a specific user. Filters can be applied for `Stock_Name` and `Account_Name`.

- **Add Stocks**:  
  `POST /api/addstocks?username={username}`  
  Adds or updates stock information for the user.

- **Delete Stocks**:  
  `DELETE /api/deletestocks/:id?username={username}`  
  Deletes a stock entry by its `id`.

- **Get Account Names**:  
  `GET /api/accountnames?username={username}`  
  Fetches distinct account names for a user.

- **Get Stock Names**:  
  `GET /api/stocknames?username={username}`  
  Fetches distinct stock names for a user.

- **Get Indian Stock Names**:  
  `GET /api/indianstocks`  
  Fetches all distinct stock names from the master table of Indian stocks.

### Dashboard
- **Get Investment Summary**:  
  `GET /api/dashboard?username={username}`  
  Returns total investments and realized profits grouped by account name.

### Real-Time Stock Prices
- **Get Current Prices**:  
  `GET /api/current-prices?stockNames={comma-separated-stock-names}`  
  Fetches real-time prices for the provided stock names.

---

## How It Works

1. **User Registration**:
   - Validates input data.
   - Hashes the user's password and saves user details in the database.
   - Creates a user-specific table for stock management.

2. **Stock Management**:
   - Adds new stocks or updates existing ones by recalculating weighted averages for price and investment amounts.

3. **Real-Time Stock Price Retrieval**:
   - Scrapes stock prices from Google Finance using web scraping libraries.
   - Returns prices in a structured format.

4. **Dashboard**:
   - Aggregates stock data for holding and sold states.
   - Displays account-level summaries.

---

## Security Measures

- **Password Hashing**: Uses **bcrypt** for storing passwords securely.
- **Authentication**: JWT tokens are used for user authentication and session management.
- **SQL Injection Prevention**: Uses `mysql.escapeId` and parameterized queries to prevent SQL injection attacks.
- **CORS**: Ensures secure API access across domains.

---

## Prerequisites

- **Node.js** (v14+)
- **MySQL** (v8+)

---

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
