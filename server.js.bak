const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "replace_this_with_a_strong_secret";

app.use(cors());
app.use(express.json());

// ✅ MySQL connection (only once)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "restaurantDB"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});


// ✅ NEW
app.use(express.static(path.join(__dirname, "frontend"), { index: false }));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "Login.html"));
});

app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "Menu.html"));
});

// ✅ Fetch Menu API
app.get("/api/menu", (req, res) => {
  db.query("SELECT * FROM Menu", (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching menu" });
    res.json(results);
  });
});

// ✅ Register API
app.post("/api/register", async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password) return res.status(400).send("Missing fields");

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO Users (name, email, password, address) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, address || ""],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") return res.status(400).send("Email already registered");
          return res.status(500).send("Error registering user");
        }
        res.status(201).send("✅ User registered successfully");
      }
    );
  } catch {
    res.status(500).send("Error registering user");
  }
});

// ✅ Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM Users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).send("Error checking user");
    if (results.length === 0) return res.status(400).send("❌ User not found");

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("❌ Invalid password");

    const token = jwt.sign({ id: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ message: "✅ Login successful", token, name: user.name });
  });
});

// ✅ PLACE ORDER API
app.post("/api/place-order", (req, res) => {
  const { cart, orderType, tableNo, address, phone, total, date } = req.body;

  const sql = `INSERT INTO orders (order_type, table_no, address, phone, items, total, date)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [orderType, tableNo, address, phone, JSON.stringify(cart), total, date],
    (err, result) => {
      if (err) {
        console.log("❌ Query Error:", err);
        return res.status(500).json({ message: "Error placing order" });
      }
      res.json({ message: "✅ Order Saved", orderId: result.insertId });
    }
  );
});


// ✅ Start Server Once
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
