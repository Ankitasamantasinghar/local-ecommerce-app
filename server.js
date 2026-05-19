const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database.js');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, products) => {
        res.json(products);
    });
});

app.get('/api/cart', (req, res) => {
    const ids = req.query.ids.split(',');
    db.all(`SELECT * FROM products WHERE id IN (${ids.join(',')})`, [], (err, products) => {
        res.json({ cartItems: products });
    });
});

app.post('/api/checkout', (req, res) => {
    const { name, address, phone, cart } = req.body;
    const ids = Object.keys(cart);
    
    db.all(`SELECT * FROM products WHERE id IN (${ids.join(',')})`, [], (err, products) => {
        let total = 0;
        products.forEach(p => total += p.price * cart[p.id]);
        
        db.run(`INSERT INTO orders (customer_name, address, phone, total, status, order_date) VALUES (?,?,?,?,?, datetime('now'))`,
            [name, address, phone, total, 'Processing'], function(err) {
                const orderId = this.lastID;
                const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?,?,?,?,?)");
                products.forEach(p => stmt.run([orderId, p.id, p.name, cart[p.id], p.price]));
                stmt.finalize();
                res.json({ orderId });
            });
    });
});

app.get('/api/track/:id', (req, res) => {
    db.get("SELECT * FROM orders WHERE id =?", [req.params.id], (err, order) => {
        if (!order) return res.json({ order: null });
        db.all("SELECT * FROM order_items WHERE order_id =?", [req.params.id], (err, items) => {
            res.json({ order, items });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));