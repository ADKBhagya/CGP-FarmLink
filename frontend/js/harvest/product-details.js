// DOM Elements
const productImage = document.getElementById('product-image');
const productName = document.getElementById('product-name');
const productPhone = document.getElementById('product-phone');
const productDescription = document.getElementById('product-description');
const productPrice = document.getElementById('product-price');
const productDetailsList = document.getElementById('product-details-list');
const recommendedProductsContainer = document.getElementById('recommended-products');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const cartCount = document.querySelector('.cart-count');

// Current product and quantity
let currentProduct = null;
let selectedQuantity = 1;
let allProducts = []; // Store all products for recommendations

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('Product Details page loaded');
    console.log('Current URL:', window.location.href);
    console.log('Product ID:', productId);
    
    if (productId) {
        fetchProductDetails(productId);
        fetchAllProducts();
    } else {
        // Display error message instead of redirecting immediately
        console.error('No product ID provided in URL');
        
        // Show error message on the page
        const container = document.querySelector('.product-details-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>Error: No Product Selected</h2>
                    <p>Please select a product from the shop page to view its details.</p>
                    <p>Current URL: ${window.location.href}</p>
                    <a href="harvest.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Back to Shop</a>
                </div>
            `;
        }
        
        // Optionally redirect after delay (comment out for testing)
        // setTimeout(() => {
        //     window.location.href = 'harvest.html';
        // }, 3000);
        
        return; // Exit early
    }
    
    // Setup quantity controls
    setupQuantityControls();
    
    // Add to cart button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    // Load cart from storage and update count
    loadCartFromStorage();
    updateCartCount();
});

// Setup quantity controls with plus/minus buttons
function setupQuantityControls() {
    // Create quantity control elements
    const quantitySelect = document.querySelector('.quantity-select');
    if (quantitySelect) {
        quantitySelect.innerHTML = `
            <label>Select Quantity</label>
            <div class="quantity-controls">
                <button id="decrease-quantity" class="quantity-control-btn">-</button>
                <span id="quantity-value" class="quantity-value">1</span>
                <button id="increase-quantity" class="quantity-control-btn">+</button>
            </div>
        `;
        
        // Get the new elements
        const decreaseBtn = document.getElementById('decrease-quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const quantityValue = document.getElementById('quantity-value');
        
        // Add event listeners
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (selectedQuantity > 1) {
                    selectedQuantity--;
                    quantityValue.textContent = selectedQuantity;
                }
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                // You might want to add a max quantity check based on stock
                selectedQuantity++;
                quantityValue.textContent = selectedQuantity;
            });
        }
    }
}

// Functions
async function fetchProductDetails(productId) {
    try {
        console.log(`Fetching product details for ID: ${productId}`);
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product details received:', product);
        currentProduct = product;
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert(`Error loading product details: ${error.message}`);
        
        // Show error on page
        const container = document.querySelector('.product-details-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>Error Loading Product</h2>
                    <p>Unable to load product details. Error: ${error.message}</p>
                    <a href="harvest.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Back to Shop</a>
                </div>
            `;
        }
    }
}

async function fetchAllProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        allProducts = products;
        
        // Display recommended products excluding current product
        if (currentProduct) {
            const recommendedProducts = products.filter(product => 
                product.card_id !== currentProduct.card_id
            );
            
            displayRecommendedProducts(recommendedProducts);
        }
    } catch (error) {
        console.error('Error fetching all products:', error);
    }
}

function displayProductDetails(product) {
    console.log('Displaying product details:', product);
    
    // Update product image
    if (product.image && typeof product.image === 'string' && product.image.startsWith('data:image')) {
        productImage.src = product.image;
    } else if (product.image && product.image.data) {
        const uint8Array = new Uint8Array(product.image.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        productImage.src = URL.createObjectURL(blob);
    } else {
        productImage.src = '../../assets/default-image.jpg';
    }
    
    // Set alt text
    productImage.alt = product.name;
    
    // Update product info - use actual database values
    document.title = product.name + " - Product Details";
    productName.textContent = product.name;
    productPhone.textContent = product.phone_no || '079 XXX XXXX';
    productDescription.textContent = product.description || 'Fresh rice product';
    
    // Format price
    const formattedPrice = `Rs ${parseFloat(product.price).toFixed(2)}`;
    productPrice.textContent = formattedPrice;
    
    // Generate details from item_details in database
    productDetailsList.innerHTML = '';
    
    if (product.item_details) {
        // If item_details is a single string, split it by periods or line breaks to create bullet points
        let detailsArray = [];
        if (typeof product.item_details === 'string') {
            // Split by periods or line breaks
            detailsArray = product.item_details
                .split(/\.|\n/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }
        
        // If no details found or empty after splitting, use the whole text as one item
        if (detailsArray.length === 0) {
            detailsArray = [product.item_details];
        }
        
        // Add each detail as a list item
        detailsArray.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            productDetailsList.appendChild(li);
        });
    } else {
        // Create default details if none in database
        const defaultDetails = [
            `Fresh ${product.category || 'rice'} directly from the farm`,
            `Premium quality, hand-selected by ${product.name}`,
            `Grown in ${product.location || 'ideal conditions'}`,
            `Perfect for daily meals and special occasions`
        ];
        
        defaultDetails.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            productDetailsList.appendChild(li);
        });
    }
}

function displayRecommendedProducts(products) {
    // Show up to 3 recommended products
    const recommendedProducts = products.slice(0, 3);
    
    recommendedProductsContainer.innerHTML = '';
    
    if (recommendedProducts.length === 0) {
        const noRecommendations = document.createElement('p');
        noRecommendations.textContent = 'No recommended products available.';
        recommendedProductsContainer.appendChild(noRecommendations);
        return;
    }
    
    recommendedProducts.forEach(product => {
        const card = createRecommendedProductCard(product);
        recommendedProductsContainer.appendChild(card);
    });
}

function createRecommendedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'recommended-product-card';
    card.setAttribute('data-id', product.card_id);
    
    // Format price
    const formattedPrice = `Rs ${parseFloat(product.price).toFixed(2)}`;
    
    // Create image source
    let imageUrl;
    if (product.image && typeof product.image === 'string' && product.image.startsWith('data:image')) {
        imageUrl = product.image;
    } else if (product.image && product.image.data) {
        const uint8Array = new Uint8Array(product.image.data);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        imageUrl = URL.createObjectURL(blob);
    } else {
        imageUrl = '../../assets/default-image.jpg';
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="recommended-product-image">
        <div class="recommended-product-info">
            <div class="recommended-product-name">${product.name}</div>
            <div class="recommended-product-category">${product.category || 'Rice Product'}</div>
            <div class="recommended-product-price">${formattedPrice}</div>
            <button class="recommended-add-to-cart">ADD TO CART</button>
        </div>
    `;
    
    // Add event listener to card for navigation
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking the add to cart button
        if (!e.target.classList.contains('recommended-add-to-cart')) {
            // Use relative path
            console.log(`Navigating to product ${product.card_id}`);
            window.location.href = `product-details.html?id=${product.card_id}`;
        }
    });
    
    // Add event listener to add to cart button
    const addToCartButton = card.querySelector('.recommended-add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            addProductToCart(product);
        });
    }
    
    return card;
}

// Cart functions
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        return JSON.parse(storedCart);
    }
    return [];
}

function saveCartToStorage(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = loadCartFromStorage();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function addToCart() {
    if (!currentProduct) return;
    
    addProductToCart(currentProduct, selectedQuantity);
}

function addProductToCart(product, quantity = 1) {
    let cart = loadCartFromStorage();
    
    // Check if product is already in cart - use card_id not cart_id
    const existingItemIndex = cart.findIndex(item => item.card_id === product.card_id);
    
    if (existingItemIndex !== -1) {
        // Product already in cart, increase quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            card_id: product.card_id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            quantity: quantity,
            days: 1
        });
    }
    
    saveCartToStorage(cart);
    updateCartCount();
    
    // Show success message
    alert('Product added to cart successfully!');
}