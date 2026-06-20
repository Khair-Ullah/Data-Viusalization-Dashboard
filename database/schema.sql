DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS metrics;

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    quantity INTEGER NOT NULL
);

-- D3.js Charts rendring
INSERT INTO sales (date, amount, category, region, quantity) VALUES
('2026-06-01', 450.50, 'Electronics', 'North America', 2),
('2026-06-01', 85.00, 'Clothing', 'Europe', 3),
('2026-06-02', 300.00, 'Software', 'Asia', 1),
('2026-06-02', 45.00, 'Home', 'North America', 4),
('2026-06-03', 550.00, 'Electronics', 'Asia', 5),
('2026-06-04', 120.00, 'Clothing', 'North America', 2),
('2026-06-05', 199.99, 'Software', 'Europe', 1),
('2026-06-06', 210.00, 'Home', 'Asia', 7),
('2026-06-07', 890.00, 'Electronics', 'North America', 4),
('2026-06-08', 340.00, 'Clothing', 'Europe', 6),
('2026-06-09', 750.00, 'Software', 'North America', 2),
('2026-06-10', 150.00, 'Home', 'Europe', 3);