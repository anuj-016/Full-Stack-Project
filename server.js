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

// ---------- New Order & Admin APIs ----------
const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// POST /api/order  - create order and order_items
app.post("/api/order", (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !items || !items.length) return res.status(400).json({ error: "Invalid payload" });
  const total = items.reduce((s, it) => s + (it.quantity * it.price), 0);

  db.query("INSERT INTO orders (user_id, total_amount) VALUES (?, ?)", [user_id, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const orderId = result.insertId;
    const values = items.map(i => [orderId, i.item_name, i.quantity, i.price]);
    db.query("INSERT INTO order_items (order_id, item_name, quantity, price) VALUES ?", [values], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Order placed", order_id: orderId });
    });
  });
});

// GET /api/user/:id/orders - fetch orders for a user
app.get("/api/user/:id/orders", verifyToken, (req, res) => {
  const uid = req.params.id;
  // ensure requester is same user or admin
  if (req.user.id != uid && req.user.email !== "admin@admin.com") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const sql = `SELECT o.order_id, o.total_amount, o.created_at, oi.item_name, oi.quantity, oi.price
               FROM orders o JOIN order_items oi ON o.order_id = oi.order_id
               WHERE o.user_id = ? ORDER BY o.created_at DESC`;
  db.query(sql, [uid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /api/admin/orders - admin view of all orders
app.get("/api/admin/orders", verifyToken, (req, res) => {
  if (req.user.email !== "admin@admin.com") return res.status(403).json({ error: "Admin only" });
  const sql = `SELECT o.order_id, o.user_id, u.name, u.email, o.total_amount, o.created_at, oi.item_name, oi.quantity, oi.price
               FROM orders o
               JOIN Users u ON o.user_id = u.user_id
               JOIN order_items oi ON o.order_id = oi.order_id
               ORDER BY o.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// ---------- End New APIs ----------

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
