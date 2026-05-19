let cart = {};

async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    const html = products.map(p => `
        <div class="col-md-3">
            <div class="product-card h-100">
                <img src="${p.image_url}" class="product-img w-100">
                <div class="card-body">
                    <h5 class="fw-bold">${p.name}</h5>
                    <p class="text-muted small">${p.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price-tag">₹${p.price}</span>
                        <button onclick="addToCart(${p.id})" class="btn btn-gradient btn-sm">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('products-list').innerHTML = html;
}

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    updateCartCount();
}

function updateCartCount() {
    const count = Object.values(cart).reduce((a,b)=>a+b,0);
    document.getElementById('cart-count').textContent = count;
}

async function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    if (page === 'cart') await loadCart();
}

async function loadCart() {
    const ids = Object.keys(cart);
    if (ids.length === 0) {
        document.getElementById('cart-content').innerHTML = `
            <p class="text-center">Cart is empty 😢</p>
            <div class="text-center"><button onclick="showPage('home')" class="btn btn-primary">Shop Now</button></div>
        `;
        return;
    }
    const res = await fetch(`/api/cart?ids=${ids.join(',')}`);
    const { cartItems, total } = await res.json();
    
    const itemsHtml = cartItems.map(item => `
        <tr><td>${item.name}</td><td>₹${item.price}</td><td>${cart[item.id]}</td><td>₹${item.price * cart[item.id]}</td></tr>
    `).join('');
    
    document.getElementById('cart-content').innerHTML = `
        <table class="table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table>
        <h4 class="text-end">Total: ₹${total}</h4>
        <form onsubmit="checkout(event)" class="mt-4">
            <input id="name" class="form-control mb-2" placeholder="Full Name" required>
            <input id="phone" class="form-control mb-2" placeholder="Phone" required>
            <textarea id="address" class="form-control mb-2" placeholder="Address" required></textarea>
            <button type="submit" class="btn btn-success w-100">Place Order ₹${total}</button>
        </form>
    `;
}

async function checkout(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        cart: cart
    };
    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const { orderId } = await res.json();
    cart = {};
    updateCartCount();
    document.getElementById('cart-content').innerHTML = `
        <div class="text-center">
            <h1>✅ Order Placed!</h1>
            <p class="lead">Your Order ID: <strong>${orderId}</strong></p>
            <button onclick="showPage('home')" class="btn btn-primary">Continue Shopping</button>
        </div>
    `;
}

async function trackOrder() {
    const id = document.getElementById('track-id').value;
    const res = await fetch(`/api/track/${id}`);
    const data = await res.json();
    
    if (!data.order) {
        document.getElementById('track-result').innerHTML = `<div class="alert alert-danger mt-3">Order not found!</div>`;
        return;
    }
    
    const items = data.items.map(i => `<li>${i.product_name} x ${i.quantity} - ₹${i.price * i.quantity}</li>`).join('');
    document.getElementById('track-result').innerHTML = `
        <div class="alert alert-success mt-3">
            <h5>Order Found!</h5>
            <p><strong>ID:</strong> ${data.order.id}</p>
            <p><strong>Status:</strong> <span class="badge bg-success">${data.order.status}</span></p>
            <p><strong>Name:</strong> ${data.order.customer_name}</p>
            <p><strong>Total:</strong> ₹${data.order.total}</p>
            <p><strong>Items:</strong></p><ul>${items}</ul>
        </div>
    `;
}

loadProducts();