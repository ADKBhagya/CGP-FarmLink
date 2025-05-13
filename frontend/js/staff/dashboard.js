//Card section
    
             // Function to format the date as "Monday, 28 January"
function formatDate() {
    const now = new Date();
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const dayOfWeek = daysOfWeek[now.getDay()];
    const dayOfMonth = now.getDate();
    const month = monthsOfYear[now.getMonth()];
    
    const dateString = `${dayOfWeek}, ${dayOfMonth} ${month}`;
    document.getElementById("date").textContent = dateString;
}

             // Function to update the current time
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    
    const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    document.getElementById("time").textContent = timeString;
}

             // Simulated weather data update
function updateWeather() {
    const weatherData = {
        temperature: "30°C",
        condition: "Mostly Cloudy",
        iconClass: "fas fa-cloud" 
    };
    
    document.getElementById("temperature").textContent = weatherData.temperature;
    document.getElementById("weather-condition").textContent = weatherData.condition;
    document.getElementById("weather-icon").className = weatherData.iconClass;
}



             // Update all data
function updateData() {
    formatDate();
    updateTime();
    updateWeather();
}

             // Call updateData every second to keep the time updated
setInterval(updateData, 1000);
updateData();


// Navbar Section 
document.addEventListener("DOMContentLoaded", function () {
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll(".content-section").forEach(section => {
            section.style.display = "none";
        });

        // Show the clicked section
        document.getElementById(sectionId).style.display = "block";

        // Update active tab
        document.querySelectorAll(".tabs button").forEach(button => {
            button.classList.remove("active");
        });

        document.querySelector(`.tabs button[data-section='${sectionId}']`).classList.add("active");
    }

    // Attach event listeners to tabs
    document.querySelectorAll(".tabs button").forEach(button => {
        button.addEventListener("click", function () {
            let sectionId = this.getAttribute("data-section");
            showSection(sectionId);
        });
    });

    // Show the default section (Register Farmer)
    showSection("register-farmer");
});



//Register Farmer section

document.addEventListener("DOMContentLoaded", function () {
    // Allow only letters
    function validateLetters(input) {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^A-Za-z ]/g, '');
        });
    }

    // Allow only numbers
    function validateNumbers(input) {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Format contact number
    function formatContactNumber(input) {
        input.addEventListener("input", function () {
            let cleaned = this.value.replace(/\D/g, '');
            if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

            let formatted = cleaned.replace(/^(\d{3})(\d{3})?(\d{4})?$/, function (_, p1, p2, p3) {
                return p3 ? `${p1} ${p2} ${p3}` : p2 ? `${p1} ${p2}` : p1;
            });

            this.value = formatted;
        });
    }

    // Apply validations
    validateLetters(document.getElementById("FirstName"));
    validateLetters(document.getElementById("LastName"));

    validateNumbers(document.getElementById("Contact"));
    formatContactNumber(document.getElementById("Contact"));

    validateNumbers(document.getElementById("NIC"));
    validateNumbers(document.getElementById("AccNumber"));
    validateNumbers(document.getElementById("Acres"));
    validateNumbers(document.getElementById("Compost"));
    validateNumbers(document.getElementById("Harvest"));

   

    window.openregisterPopup = function () {
        const popup = document.getElementById("registerpopup");
        popup.classList.add("open-register-popup");
        popup.style.visibility = "visible";
        popup.style.transform = "translateX(-50%) scale(1)";
    };

    window.closeregisterPopup = function () {
        const popup = document.getElementById("registerpopup");
        popup.classList.remove("open-register-popup");
        popup.style.visibility = "hidden";
        popup.style.transform = "translateX(-50%) scale(0)";
    };

    window.openDiscardPopup = function () {
        let form = document.getElementById("farmerForm");
        let inputs = form.querySelectorAll("input[required], select[required]");
        let isEmpty = true;

        inputs.forEach(input => {
            if (input.value.trim()) {
                isEmpty = false;
            }
        });

        if (!isEmpty) {
            document.getElementById("discardPopup").style.visibility = "visible";
            document.getElementById("discardPopup").style.transform = "translateX(-50%) scale(1)";
        } else {
            let firstRequiredField = document.querySelector("input[required]");
            if (firstRequiredField) {
                firstRequiredField.reportValidity();
                firstRequiredField.focus();
            }
        }
    };

    window.closeDiscardPopup = function () {
        const discardPopup = document.getElementById("discardPopup");
        discardPopup.style.visibility = "hidden";
        discardPopup.style.transform = "translateX(-50%) scale(0)";
    };

    window.discardChanges = function () {
        document.getElementById("farmerForm").reset();
        closeDiscardPopup();
    };
});


//View shop section


//Add Shop Popup
// Stock control functionality
const decreaseButton = document.getElementById('decrease');
const increaseButton = document.getElementById('increase');
const stockCount = document.getElementById('stock-count');

let stock = 2;

function updateStock() {
    stockCount.textContent = stock < 10 ? `0${stock}` : stock;
}

decreaseButton.addEventListener('click', () => {
    if (stock > 1) {
        stock--;
        updateStock();
    }
});

increaseButton.addEventListener('click', () => {
    stock++;
    updateStock();
});

// Image upload functionality
const imageUpload = document.getElementById('imageUpload');
const uploadBox = document.querySelector('.upload-box');
const plusButton = document.querySelector('.plus-button');
let uploadedImage = null;

function clearPreviousImage() {
    const existingImage = uploadBox.querySelector('img');
    if (existingImage) {
        existingImage.remove();
    }
}

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            clearPreviousImage(); 

            plusButton.style.display = 'none';

            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.alt = file.name;

            imgPreview.style.width = '100%';
            imgPreview.style.height = '100%';
            imgPreview.style.objectFit = 'cover';
            imgPreview.style.borderRadius = '20px';
            imgPreview.style.position = 'absolute';
            imgPreview.style.top = '0';
            imgPreview.style.left = '0';

            uploadBox.appendChild(imgPreview);
            uploadedImage = imgPreview.src; // Store image URL for later use
        };
        reader.readAsDataURL(file);
    }
});

// Open Popup
function openPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("popup-overlay").style.display = "block";
    document.body.classList.add("popup-open"); 
}

// Close Popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("popup-overlay").style.display = "none";
    document.body.classList.remove("popup-open"); 
}

// Close popup when clicking outside of it
document.getElementById("popup-overlay").addEventListener("click", closePopup);

// Add to Shop functionality
function addToShop() {
    const productTitle = document.getElementById('productTitle').value;
    const productDescription = document.getElementById('productDescription').value;
    const productPrice = document.getElementById('productPrice').value;
    const productStock = stock;

    // Validate form data
    if (!productTitle || !productDescription || !productPrice || !uploadedImage) {
        alert("Please fill in all the fields and upload an image.");
        return;
    }

    // Create a new card for the product
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
        <img src="${uploadedImage}" alt="${productTitle}">
        <div class="card-content">
            <div class="card-header">
                <h3 class="title">${productTitle}</h3>
                <span class="id-no">${Math.floor(Math.random() * 1000)}</span>
            </div>
            <p class="description">${productDescription}</p>
            <span class="price">Rs ${productPrice}</span>
            <div class="stock-info">
                <span class="stock"><b>${productStock} In Stock</b></span>
                <span class="rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="far fa-star"></i>
                    <span>4.0</span>
                </span>
            </div>
            <div class="action-buttons">
                <button class="btn-edit" onclick="openEditPopup(this)">Edit</button>
                <button class="btn-delete" onclick="openPopup()">Delete</button>
            </div> 
        </div>
    `;

    // Log for debugging
    console.log('Product Added:', {
        productTitle,
        productDescription,
        productPrice,
        uploadedImage,
        productStock
    });

    // Append the new card to the shop container
    const shopContainer = document.getElementById('shop');  // Ensure the shop container exists in your HTML
    if (shopContainer) {
        shopContainer.appendChild(card);
    } else {
        console.log("Shop container not found.");
    }

    // Close the popup
    closePopup();

    // Reset form fields
    document.getElementById('productTitle').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    stock = 2; // Reset stock to default value
    updateStock();
}




//Edit Popup 


let currentCard = null; // Track the card being edited

function openEditPopup(button) {
    currentCard = button.closest('.card'); // Store the card being edited

    // Extract product details
    document.getElementById('editProductTitle').value = currentCard.querySelector('.title').innerText;
    document.getElementById('editProductDescription').value = currentCard.querySelector('.description').innerText;
    document.getElementById('editProductPrice').value = currentCard.querySelector('.price').innerText.replace('Rs ', '');
    document.getElementById('editStockCount').innerText = currentCard.querySelector('.stock').innerText.split(' ')[0];
    
    // Extract and display image
    const imageSrc = currentCard.querySelector('img').src;
    document.getElementById('editImagePreview').src = imageSrc;

    // Show popup
    document.getElementById('popup-overlay').style.display = 'block';
    document.getElementById('edit-popup').style.display = 'block';
}

function saveEditChanges() {
    if (!currentCard) return; // Ensure a card is selected

    // Update card values
    currentCard.querySelector('.title').innerText = document.getElementById('editProductTitle').value;
    currentCard.querySelector('.description').innerText = document.getElementById('editProductDescription').value;
    currentCard.querySelector('.price').innerText = `Rs ${document.getElementById('editProductPrice').value}`;
    currentCard.querySelector('.stock').innerText = `${document.getElementById('editStockCount').innerText} in stock`;

    // Update image if a new one is uploaded
    const imageInput = document.getElementById('editImageUpload');
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentCard.querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(imageInput.files[0]);
    }

    // Close popup
    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('edit-popup').style.display = 'none';
    currentCard = null; // Reset card
}

// Handle Stock Count Buttons
document.getElementById('editIncrease').addEventListener('click', function() {
    const stockCountElement = document.getElementById('editStockCount');
    let stockCount = parseInt(stockCountElement.innerText);
    stockCountElement.innerText = stockCount + 1;
});

document.getElementById('editDecrease').addEventListener('click', function() {
    const stockCountElement = document.getElementById('editStockCount');
    let stockCount = parseInt(stockCountElement.innerText);
    if (stockCount > 0) {
        stockCountElement.innerText = stockCount - 1;
    }
});


// Delete Popup

// Function to open the delete popup near the card
function openDeletePopup(button) {
    // Get the card associated with the clicked delete button
    const card = button.closest('.card'); 
    
    // Store the card element in a global variable for later use
    window.cardToDelete = card;

    // Get the popup element
    let popup = document.getElementById("Delete-Popup");

    // Get the card's position relative to the page
    let cardRect = card.getBoundingClientRect();

    // Set the popup's position next to the card (e.g., to the right of the card)
    popup.style.left = cardRect.right + window.scrollX + 10 + 'px'; // Right of the card with a 10px offset
    popup.style.top = cardRect.top + window.scrollY + 'px'; // Align it vertically with the top of the card

    // Show the delete popup near the card
    popup.style.visibility = "visible";
    popup.style.transform = "scale(1)"; // Show the popup with a scaling transition
}

// Function to close the delete popup (when "No" is clicked)
function handleNo() {
    closeDeletePopup(); // Close the delete popup
}

// Function to close the delete popup
function closeDeletePopup() {
    let popup = document.getElementById("Delete-Popup");
    popup.style.visibility = "hidden";
    popup.style.transform = "scale(0)"; // Hide the popup
}

// Function to handle the "Delete" button click (remove the card)
function handleDelete() {
    // If a card is stored, remove it from the DOM
    if (window.cardToDelete) {
        window.cardToDelete.remove(); // Remove the card from the page
    }
    closeDeletePopup(); // Close the popup after deleting
}

//PDF Download Function

async function downloadFarmersPDF() {
    const section = document.getElementById("view-farmers");
    const table = document.getElementById("farmerTableContainer");
  
    // Show table if hidden
    const originalDisplay = section.style.display;
    section.style.display = "block";
  
    await loadFarmers(); // Ensure data is loaded
  
    setTimeout(async () => {
      html2canvas(table).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape");
  
        const pdfWidth = pdf.internal.pageSize.getWidth();
  
        // ✅ Add Title
        pdf.setFontSize(18);
        pdf.text("FarmLink - Registered Farmers Report", pdfWidth / 2, 15, { align: "center" });
  
        // Add image after title
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
        pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight); // Start image lower to make space for title
        pdf.save("farmers-report.pdf");
  
        section.style.display = originalDisplay;
      });
    }, 500);
  }
  
  
  
  async function downloadBuyersPDF() {
    const section = document.getElementById("view-buyers");
    const table = document.getElementById("buyerTableContainer");
  
    const originalDisplay = section.style.display;
    section.style.display = "block";
  
    await loadBuyers(); // Ensure data is loaded
  
    setTimeout(() => {
      html2canvas(table).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape");
  
        const pdfWidth = pdf.internal.pageSize.getWidth();
  
        // Title
        pdf.setFontSize(18);
        pdf.text("FarmLink - Buyers Report", pdfWidth / 2, 15, { align: "center" });
  
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
        pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
        pdf.save("buyers-report.pdf");
  
        section.style.display = originalDisplay;
      });
    }, 500);
  }
  
  
  async function downloadHarvestPDF() {
    const section = document.getElementById("view-harvest");
    const table = document.getElementById("harvestTableContainer");
  
    const originalDisplay = section.style.display;
    section.style.display = "block";
  
    await loadHarvest(); // Ensure data is loaded
  
    setTimeout(() => {
      html2canvas(table).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape");
  
        const pdfWidth = pdf.internal.pageSize.getWidth();
  
        // Title
        pdf.setFontSize(18);
        pdf.text("FarmLink - Harvest Report", pdfWidth / 2, 15, { align: "center" });
  
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
        pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
        pdf.save("harvest-report.pdf");
  
        section.style.display = originalDisplay;
      });
    }, 500);
  }
  
  
    // Optional filter function
    function filterTable(input, tableBodyId) {
      const filter = input.value.toLowerCase();
      const rows = document.getElementById(tableBodyId).getElementsByTagName("tr");
        for (let row of rows) {
        row.style.display = [...row.cells].some(cell => 
            cell.textContent.toLowerCase().includes(filter)
        ) ? "" : "none";
        }

    }