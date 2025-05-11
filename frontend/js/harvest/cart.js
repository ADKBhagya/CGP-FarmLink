// DOM Elements
const cartItemsContainer = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderNotes = document.getElementById('orderNotes');

// Cart items array
let cartItems = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    displayCartItems();
    updateCartSummary();
    
    checkoutBtn.addEventListener('click', processCheckout);
});

// Functions
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
    }
}

function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function displayCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        const emptyCartMessage = document.createElement('div');
        emptyCartMessage.className = 'empty-cart-message';
        emptyCartMessage.textContent = 'Your cart is empty. Add some products to continue shopping.';
        cartItemsContainer.appendChild(emptyCartMessage);
        return;
    }
    
    cartItems.forEach((item, index) => {
        const cartItem = createCartItemElement(item, index);
        cartItemsContainer.appendChild(cartItem);
    });
}

function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    // Calculate item total
    const itemTotal = item.price * item.quantity;
    
    // Format price
    const formattedPrice = `Rs ${parseFloat(item.price).toFixed(2)}`;
    
    // Create image source
    let imageUrl;
    if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image')) {
        imageUrl = item.image;
    } else if (item.image && typeof item.image === 'object' && item.image.data) {
        const uint8Array = new Uint8Array(item.image.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        imageUrl = URL.createObjectURL(blob);
    } else {
        imageUrl = 'images/farmer.jpg';
    }
    
    // Create the HTML structure
    cartItem.innerHTML = `
        <img src="${imageUrl}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <div class="cart-item-name">${item.name || 'Product Name'}</div>
            <div class="cart-item-price">${formattedPrice}</div>
            <div class="cart-quantity-selector">
                <span>Select Quantity</span>
                <div class="quantity-controls">
                    <button class="quantity-control-btn minus" data-index="${index}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-control-btn plus" data-index="${index}">+</button>
                </div>
            </div>
            <div class="cart-days-selector">
                <span>Select Days</span>
                <div class="days-controls">
                    <button class="days-control-btn minus" data-index="${index}">-</button>
                    <span class="days-value">${item.days}</span>
                    <button class="days-control-btn plus" data-index="${index}">+</button>
                </div>
            </div>
        </div>
        <button class="remove-from-cart" data-index="${index}">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add event listeners for quantity buttons
    const minusQuantityBtn = cartItem.querySelector('.quantity-control-btn.minus');
    const plusQuantityBtn = cartItem.querySelector('.quantity-control-btn.plus');
    
    minusQuantityBtn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        if (cartItems[idx].quantity > 1) {
            cartItems[idx].quantity -= 1;
            cartItems[idx].total = cartItems[idx].price * cartItems[idx].quantity;
            saveCartToStorage();
            displayCartItems();
            updateCartSummary();
        }
    });
    
    plusQuantityBtn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        cartItems[idx].quantity += 1;
        cartItems[idx].total = cartItems[idx].price * cartItems[idx].quantity;
        saveCartToStorage();
        displayCartItems();
        updateCartSummary();
    });
    
    // Add event listeners for days buttons
    const minusDaysBtn = cartItem.querySelector('.days-control-btn.minus');
    const plusDaysBtn = cartItem.querySelector('.days-control-btn.plus');
    
    minusDaysBtn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        if (cartItems[idx].days > 1) {
            cartItems[idx].days -= 1;
            saveCartToStorage();
            displayCartItems();
            updateCartSummary();
        }
    });
    
    plusDaysBtn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        cartItems[idx].days += 1;
        saveCartToStorage();
        displayCartItems();
        updateCartSummary();
    });
    
    // Add event listener for remove button
    cartItem.querySelector('.remove-from-cart').addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        removeFromCart(idx);
    });
    
    return cartItem;
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    
    saveCartToStorage();
    displayCartItems();
    updateCartSummary();
}

function updateCartSummary() {
    // Calculate total
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Format subtotal
    const formattedSubtotal = `Rs ${subtotal.toFixed(2)} LKR`;
    
    // Update DOM
    cartSubtotal.textContent = formattedSubtotal;
}

function processCheckout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty. Add some products to checkout.');
        return;
    }
    
    const notes = orderNotes.value.trim();
    
    // In a real application, you would send the cart items and notes to the server
    // For now, we'll just show a success message
    alert('Thank you for your order! It will be processed shortly.');
    
    // Clear cart
    cartItems = [];
    saveCartToStorage();
    
    // Redirect to home page
    window.location.href = '/';
}