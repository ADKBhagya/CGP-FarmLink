// DOM Elements
const productGrid = document.getElementById('productGrid');
const productFormModal = document.getElementById('productFormModal');
const productForm = document.getElementById('productForm');
const openFormBtn = document.getElementById('openFormBtn');
const closeBtn = document.querySelector('.close');
const searchHeader = document.getElementById('searchHeader');
const categoryFilterBtns = document.querySelectorAll('.category-filter-btn');
const formTitle = document.getElementById('formTitle');
const cardIdInput = document.getElementById('card_id');
const currentImageContainer = document.getElementById('current-image-container');
const currentImage = document.getElementById('current-image');
const cartCount = document.querySelector('.cart-count');
const API_BASE_URL = 'http://localhost:5000';
let selectedProductId = null;
let editingProductId = null;
let currentProductData = null;
let allProducts = [];
let cartItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    loadCartFromStorage();
    updateCartCount();
    
    // Ensure openFormBtn exists and has click handler
    if (openFormBtn) {
        openFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add button clicked'); // Debug
            openModal();
        });
    }
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === productFormModal) {
            closeModal();
        }
    });
    
    // Form submission handler
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
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            
            if (category === 'all') {
                displayProducts(allProducts);
            } else {
                filterByCategory(category);
            }
        });
    });
});

// Modal Functions
function openModal(productId = null) {
    console.log('Opening modal', productId); // Debug
    
    if (!productFormModal) {
        console.error('Modal element not found');
        return;
    }
    
    productFormModal.style.display = 'block';
    
    if (productId) {
        editingProductId = productId;
        formTitle.textContent = 'Edit Product';
        fillFormWithProductData(productId);
    } else {
        editingProductId = null;
        formTitle.textContent = 'Add New Product';
        productForm.reset();
        if (cardIdInput) {
            cardIdInput.value = '';
        }
        currentImageContainer.classList.add('hidden');
        document.getElementById('image').setAttribute('required', 'required');
    }
}

function closeModal() {
    console.log('Closing modal'); // Debug
    
    if (!productFormModal) {
        console.error('Modal element not found');
        return;
    }
    
    productFormModal.style.display = 'none';
    editingProductId = null;
    currentProductData = null;
}

// Fetch and Display Products
async function fetchProducts() {
    try {
        console.log('Fetching products from:', `${API_BASE_URL}/api/products`);
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Expected JSON, got ${contentType}`);
        }
        
        const products = await response.json();
        console.log('Products fetched successfully:', products.length);
        allProducts = products;
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Display empty grid or cached products
        if (allProducts.length > 0) {
            displayProducts(allProducts);
        } else {
            displayProducts([]);
        }
        
        // Re-throw only if it's not the initial load
        if (document.readyState === 'complete') {
            throw error;
        }
    }
}

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



// Delete Product
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        await response.json();
        fetchProducts();
        alert('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Fill Form for Editing
async function fillFormWithProductData(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        
        const product = await response.json();
        currentProductData = product;
        
        // Fill form fields
        if (cardIdInput) cardIdInput.value = product.card_id;
        document.getElementById('name').value = product.name || '';
        document.getElementById('price').value = product.price || '';
        document.getElementById('phone_no').value = product.phone_no || '';
        
        const locationInput = document.getElementById('location');
        if (locationInput) locationInput.value = product.location || '';
        
        document.getElementById('description').value = product.description || '';
        document.getElementById('item_details').value = product.item_details || '';
        document.getElementById('category').value = product.category || '';
        
        const stockInput = document.getElementById('stock');
        if (stockInput) stockInput.value = product.stock || 1;
        
        document.getElementById('days').value = product.days || 1;
        
        // Handle image
        if (product.image) {
            currentImageContainer.classList.remove('hidden');
            currentImage.src = product.image;
            document.getElementById('image').removeAttribute('required');
        } else {
            currentImageContainer.classList.add('hidden');
            document.getElementById('image').setAttribute('required', 'required');
        }
        
    } catch (error) {
        console.error('Error fetching product details:', error);
        alert('Failed to load product details for editing.');
        closeModal();
    }
}

// Filter Functions
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
    const filteredProducts = allProducts.filter(product => 
        product.category && product.category === category
    );
    
    displayProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.className = 'no-products-message';
        noProductsMessage.textContent = `No products found in category "${category}".`;
        productGrid.appendChild(noProductsMessage);
    }
}

// Form Submission with better debugging
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submission started');
    
    const formData = new FormData(productForm);
    
    // Log form data for debugging
    console.log('Form data being sent:');
    for (let [key, value] of formData.entries()) {
        if (key === 'image' && value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    
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
    
    // Remove card_id for new products
    if (!editingProductId) {
        formData.delete('card_id');
    }
    
    // Handle image updates
    if (editingProductId && document.getElementById('image').files.length === 0) {
        formData.delete('image');
    }
    
    try {
        let response;
        const url = editingProductId 
            ? `${API_BASE_URL}/api/products/${editingProductId}`
            : `${API_BASE_URL}/api/products`;
        
        console.log(`Sending ${editingProductId ? 'PUT' : 'POST'} request to:`, url);
        
        response = await fetch(url, {
            method: editingProductId ? 'PUT' : 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        // Read the response body
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error('Invalid response format from server');
        }
        
        if (response.ok) {
            console.log('Success response data:', responseData);
            closeModal();
            
            // Add a small delay before fetching products
            setTimeout(async () => {
                try {
                    await fetchProducts();
                    alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
                } catch (fetchError) {
                    console.error('Error fetching products after save:', fetchError);
                    // Still show success since the product was saved
                    alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
                    // Manually add the product to the display
                    if (!editingProductId && responseData) {
                        allProducts.unshift(responseData);
                        displayProducts(allProducts);
                    }
                }
            }, 500); // 500ms delay
            
        } else {
            console.log('Error response data:', responseData);
            alert(`Failed to save product: ${responseData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error during form submission:', error);
        console.error('Error stack:', error.stack);
        
        // Check if the product was actually saved by checking the current products
        try {
            const checkResponse = await fetch(`${API_BASE_URL}/api/products`);
            if (checkResponse.ok) {
                const products = await checkResponse.json();
                // Check if our product is in the list (by name)
                const productName = formData.get('name');
                const foundProduct = products.find(p => p.name === productName);
                
                if (foundProduct) {
                    console.log('Product was actually saved despite error');
                    closeModal();
                    allProducts = products;
                    displayProducts(products);
                    alert('Product added successfully!');
                    return;
                }
            }
        } catch (checkError) {
            console.error('Error checking if product was saved:', checkError);
        }
        
        alert(`Error saving product: ${error.message}`);
    }
}

// Cart Functions (Stub functions since cart functionality not fully implemented)
function loadCartFromStorage() {
    // Implementation not shown in original code
}

function updateCartCount() {
    // Implementation not shown in original code
}