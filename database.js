const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./store.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, price REAL, description TEXT, image_url TEXT, stock INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT, address TEXT, phone TEXT, 
        total REAL, status TEXT, order_date TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER, product_id INTEGER, 
        product_name TEXT, quantity INTEGER, price REAL
    )`);

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            const products = [
                ['Wireless Headphones', 2499, 'Noise cancelling, 20hr battery', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 15],
                ['Smart Watch', 4999, 'Fitness tracking, heart rate monitor', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 10],
                ['Coffee Mug', 299, 'Ceramic, 350ml, local artisan made', 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400', 50],
                ['Backpack', 1299, 'Water resistant, laptop compartment', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 20]
            ];
            const stmt = db.prepare("INSERT INTO products (name, price, description, image_url, stock) VALUES (?,?,?,?,?)");
            products.forEach(p => stmt.run(p));
            stmt.finalize();
            console.log('Sample products added');
        }
    });
});

module.exports = db;