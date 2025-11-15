ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456789';
FLUSH PRIVILEGES;

USE restaurantDB
INSERT INTO Menu (name, price, restaurant) VALUES
('Margherita Pizza', 299.00, 'Pizza Palace'),
('Cheeseburger', 199.00, 'Burger House'),
('Pasta Alfredo', 249.00, 'Italiano'),
('Veggie Wrap', 149.00, 'Healthy Bites');

SELECT * FROM Users; 
Show databases
SHOW tables;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_type VARCHAR(20) NOT NULL,
    table_no INT NULL,
    address VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    items JSON NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM Orders

DESCRIBE orders;

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_type VARCHAR(20),
  table_no INT NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Users table
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(255)
);


-- Orders and order_items tables
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_name VARCHAR(200),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
