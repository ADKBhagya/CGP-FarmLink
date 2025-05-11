// DOM Elements
const productGrid = document.getElementById('productGrid');
const productFormModal = document.getElementById('productFormModal');
const productForm = document.getElementById('productForm');
const openFormBtn = document.querySelector('.add-btn');
const closeBtn = document.querySelector('.close');
const searchHeader = document.getElementById('searchHeader');
const cartCount = document.querySelector('.cart-count');
const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');

// Cart items array
let cartItems = [];
let allProducts = []; // Store all products for filtering

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    loadCartFromStorage();
    updateCartCount();
    
    if (openFormBtn) {
        openFormBtn.addEventListener('click', openModal);
    }
    
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === productFormModal) {
            closeModal();
        }
    });
    
    productForm.addEventListener('submit', handleFormSubmit);
    
    // Search functionality
    if (searchHeader) {
        searchHeader.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterProducts(searchTerm);
        });
    }
    
    // Category filter buttons
    categoryFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category to filter by
            const category = this.getAttribute('data-category');
            
            if (category === 'all') {
                displayProducts(allProducts);
            } else {
                filterByCategory(category);
            }
        });
    });
});

// Functions
function openModal() {
    productFormModal.style.display = 'block';
    productForm.reset();
}

function closeModal() {
    productFormModal.style.display = 'none';
}

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();
        allProducts = products; // Store for filtering
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        displayProducts([]);
    }
}

function displayProducts(products) {
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'No products found. Add some products using the form.';
        productGrid.appendChild(noProductsMessage);
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
}

// Update the display function to make cards clickable
function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }
    
    productGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        let imageUrl = product.image || '../../assets/default-image.jpg';
        
        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">Rs ${product.price}</p>
            <p class="category">${product.category}</p>
            <div class="product-buttons">
                <button class="add-to-cart" data-id="${product.card_id}">Add to Cart</button>
            </div>
        `;
        
        // Add click event listener to the card itself
        productCard.style.cursor = 'pointer';
        productCard.addEventListener('click', function(e) {
            // Don't navigate if clicking on the button
            if (!e.target.closest('.product-buttons') && !e.target.closest('button')) {
                window.location.href = `product-details.html?id=${product.card_id}`;
            }
        });
        
        productGrid.appendChild(productCard);
    });

    // Add event listeners to dynamically created buttons
    attachCardEventListeners();
}

// Update event listener function to handle both navigation and cart functionality
function attachCardEventListeners() {
    // Event delegation for add to cart buttons
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.addEventListener('click', function(event) {
            if (event.target.classList.contains('add-to-cart')) {
                event.stopPropagation(); // Prevent card click
                const productId = event.target.getAttribute('data-id');
                addToCart(productId);
            }
        });
    }
}

// Add to cart function (implement based on your cart logic)
function addToCart(productId) {
    // Find the product in allProducts array
    const product = allProducts.find(p => p.card_id == productId);
    if (product) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.card_id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Product added to cart!');
    }
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Load cart from storage
function loadCartFromStorage() {
    updateCartCount();
}

// CSS for hover effect (add to your CSS file)
const additionalStyles = `
.product-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.product-buttons {
    position: relative;
    z-index: 1;
    margin-top: 10px;
}

.add-to-cart {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    font-weight: bold;
    transition: background-color 0.2s;
}

.add-to-cart:hover {
    background-color: #45a049;
}
`;

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Use card_id consistently (not cart_id)
    card.setAttribute('data-id', product.card_id);
    card.setAttribute('data-name', product.name);
    card.setAttribute('data-price', product.price);
    card.setAttribute('data-category', product.category || '');
    
    // Format the price
    const formattedPrice = `Rs ${parseFloat(product.price).toFixed(2)}`;
    
    // Create star rating
    const rating = product.rating || 4.8; // Use rating from database if available
    const starsHTML = '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>';
    
    // Create image URL from blob or use image URL directly
    let imageUrl;
    if (product.image && typeof product.image === 'string' && product.image.startsWith('data:image')) {
        // It's already a data URL
        imageUrl = product.image;
    } else if (product.image && product.image.data) {
        // Convert Blob data from MySQL to data URL
        const uint8Array = new Uint8Array(product.image.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        imageUrl = URL.createObjectURL(blob);
    } else {
        // Fallback image
        imageUrl = 'img/rice.png';
    }
    
    // Generate random reviews count
    const reviewsCount = Math.floor(Math.random() * 20) + 10;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category || 'Rice Product'}</div>
            <div class="product-rating">
                <div class="rating-stars">${starsHTML}</div>
                <div class="product-reviews">${rating} • ${reviewsCount} Reviews</div>
            </div>
            <div class="product-description">${product.description || 'Fresh rice product'}</div>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-buttons">
                <button class="add-to-cart" data-id="${product.card_id}">ADD TO CART</button>
            </div>
        </div>
    `;
    
    // Add event listener for card click to navigate to details page
    card.addEventListener('click', function(e) {
        // Only navigate if not clicking the add to cart button
        if (!e.target.classList.contains('add-to-cart')) {
            window.location.href = `/product-details.html?id=${product.card_id}`;
        }
    });
    
    // Add event listener to add to cart button
    card.querySelector('.add-to-cart').addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent card click navigation
        addToCart(product);
    });
    
    return card;
}

function addToCart(product) {
    // Check if product is already in cart
    const existingItemIndex = cartItems.findIndex(item => item.card_id === product.card_id);
    
    if (existingItemIndex !== -1) {
        // Product already in cart, increase quantity
        cartItems[existingItemIndex].quantity += 1;
        cartItems[existingItemIndex].total = cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
    } else {
        // Add new product to cart
        cartItems.push({
            card_id: product.card_id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            quantity: 1,
            days: 1,
            total: product.price
        });
    }
    
    // Save cart to localStorage
    saveCartToStorage();
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    alert('Product added to cart successfully!');
}

function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
    }
}

function updateCartCount() {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function filterProducts(searchTerm) {
    if (!searchTerm) {
        displayProducts(allProducts);
        return;
    }
    
    const filteredProducts = allProducts.filter(product => {
        const productName = (product.name || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();
        const productCategory = (product.category || '').toLowerCase();
        return productName.includes(searchTerm) || 
               productDescription.includes(searchTerm) ||
               productCategory.includes(searchTerm);
    });
    
    displayProducts(filteredProducts);
}

function filterByCategory(category) {
    if (!category) {
        displayProducts(allProducts);
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.category && product.category === category
    );
    
    displayProducts(filteredProducts);
    
    // If no products in this category, show message
    if (filteredProducts.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = `No products found in category "${category}".`;
        productGrid.appendChild(noProductsMessage);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(productForm);
    
    // Map quantity to stock if needed
    if (formData.has('quantity') && !formData.has('stock')) {
        const quantity = formData.get('quantity');
        formData.delete('quantity');
        formData.append('stock', quantity);
    }
    
    // Add default location if missing
    if (!formData.has('location') || formData.get('location') === '') {
        formData.append('location', 'Local Farm');
    }
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const newProduct = await response.json();
            closeModal();
            fetchProducts(); // Refresh the product list
            alert('Product added successfully!');
        } else {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            alert(`Failed to add product: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
    }
}