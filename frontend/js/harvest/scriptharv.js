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
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === productFormModal) {
            closeModal();
        }
    });
    
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }
    
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
    if (productFormModal) {
        productFormModal.style.display = 'block';
        productForm.reset();
    }
}

function closeModal() {
    if (productFormModal) {
        productFormModal.style.display = 'none';
    }
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

// Single displayProducts function
function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }
    
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = 'No products found. Add some products using the form.';
        productGrid.appendChild(noProductsMessage);
        return;
    }

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
                // For Live Server, use relative paths
                window.location.href = `product-details.html?id=${product.card_id}`;
            }
        });
        
        productGrid.appendChild(productCard);
    });

    // Add event listeners to dynamically created buttons
    attachCardEventListeners();
}

// Event listener function for cart buttons
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

// Single addToCart function
function addToCart(productId) {
    // Find the product in allProducts array
    const product = allProducts.find(p => p.card_id == productId);
    if (product) {
        // Check if product already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item.card_id == productId);
        
        if (existingItemIndex !== -1) {
            // Product already in cart, increase quantity
            cartItems[existingItemIndex].quantity += 1;
        } else {
            // Add new product to cart
            cartItems.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save cart to localStorage
        saveCartToStorage();
        // Update cart count
        updateCartCount();
        
        alert('Product added to cart!');
    }
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
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
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
        const response = await fetch('http://localhost:5000/api/products', {
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