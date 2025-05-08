// === Register Farmer ===
async function registerFarmer() {
  const form = document.getElementById("farmerForm");

  // ✅ Check form validation before submitting
  if (!form.checkValidity()) {
    form.reportValidity();  // This shows the default browser popup
    return; // stop here if validation fails
  }

  const farmerData = {
    FirstName: document.getElementById("FirstName").value,
    LastName: document.getElementById("LastName").value,
    Email: document.getElementById("Email").value,
    Contact: document.getElementById("Contact").value,
    Address: document.getElementById("Address").value,
    NIC: document.getElementById("NIC").value,
    Gender: document.getElementById("Gender").value,
    AccNumber: document.getElementById("AccNumber").value,
    Location: document.getElementById("Location").value,
    Acres: parseFloat(document.getElementById("Acres").value),
    Compost: parseFloat(document.getElementById("Compost").value),
    Harvest: parseFloat(document.getElementById("Harvest").value),
  };

  try {
    const res = await fetch("http://localhost:5000/api/staff/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(farmerData),
    });
    const result = await res.json();
    if (res.ok) {
      form.reset();
      openregisterPopup(); // ✅ FIXED: call the global function directly
    } else {
      alert("❌ " + result.error);
    }
  } catch (error) {
    alert("❌ Failed to connect server");
    console.error(error);
  }
}


// === Load Farmers ===
async function loadFarmers() {
  try {
    const res = await fetch("http://localhost:5000/api/staff/getFarmers");
    const farmers = await res.json();
    const tableBody = document.getElementById("farmerTableBody");
    tableBody.innerHTML = "";

    farmers.forEach(farmer => {
      tableBody.innerHTML += `
        <tr data-id="${farmer.FarmerID}">
          <td>${farmer.FarmerID}</td>
          <td>${farmer.FirstName} ${farmer.LastName}</td>
          <td>${farmer.Email}</td>
          <td>${farmer.Contact}</td>
          <td>${farmer.NIC}</td>
          <td>${farmer.AccNumber}</td>
          <td>${farmer.Location}</td>
          <td>${farmer.Acres}</td>
          <td>${farmer.Compost}</td>
          <td>${farmer.Harvest}</td>
          <td>
            <button onclick="promptFarmerDelete(${farmer.FarmerID})" class="b-delete">Delete</button>
          </td>
        </tr>
        `;
    });
  } catch (error) {
    console.error("Error loading farmers:", error);
  }
}

// === Load Harvest ===
async function loadHarvest() {
  try {
    const res = await fetch("http://localhost:5000/api/harvest/getHarvest");
    const harvests = await res.json();
    const tableBody = document.getElementById("HarvestTableBody");
    tableBody.innerHTML = "";

    harvests.forEach(h => {
      tableBody.innerHTML += `
        <tr>
          <td>${h.FarmerID}</td>
          <td>${h.Name}</td>
          <td>${h.ContactNo}</td>
          <td>${h.Location}</td>
          <td>${h.TotalHarvest}</td>
          <td>${h.UnitPrice}</td>
          <td>${h.TotalValue}</td>
        </tr>
        `;
    });
  } catch (error) {
    console.error("Error loading harvest:", error);
  }
}

// === Tab Switching ===
function switchShopTab(type) {
  document.getElementById("tab-rent").classList.remove("active");
  document.getElementById("tab-fert").classList.remove("active");
  document.getElementById("rent-items-section").style.display = "none";
  document.getElementById("fertilizer-section").style.display = "none";

  if (type === "rent") {
    document.getElementById("tab-rent").classList.add("active");
    document.getElementById("rent-items-section").style.display = "block";
  } else {
    document.getElementById("tab-fert").classList.add("active");
    document.getElementById("fertilizer-section").style.display = "block";
  }
}

// === Animated Modal Popup Functions ===
const animateModalOpen = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "flex";
  setTimeout(() => modal.querySelector(".modal-content").classList.add("show-modal"), 10);
};

const animateModalClose = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.querySelector(".modal-content").classList.remove("show-modal");
  setTimeout(() => modal.style.display = "none", 300);
};

function openAddProductPopup() {
  animateModalOpen("addProductModal");
}
function closeAddProductPopup() {
  animateModalClose("addProductModal");
}
function openEditProductPopup() {
  animateModalOpen("editProductModal");
}
function closeEditProductPopup() {
  animateModalClose("editProductModal");
}

// === Add CSS Animations to Head ===
const style = document.createElement("style");
style.innerHTML = `
.modal-content {
  opacity: 0;
  transform: translateY(-40px);
  transition: all 0.3s ease;
}
.modal-content.show-modal {
  opacity: 1;
  transform: translateY(0);
}
.modal {
  animation: fadeIn 0.3s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`;
document.head.appendChild(style);

// === Load Rent Items ===
async function loadRentItems() {
  const container = document.getElementById("rent-items-container");
  const res = await fetch("http://localhost:5000/api/rent-items");
  const items = await res.json();
  container.innerHTML = "";

  items.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <img src="${item.rent_image}" alt="${item.rent_name}">
        <h3>${item.rent_name}</h3>
        <p>Rs ${item.rent_price}</p>
        <p>Stock: ${item.rent_stock}</p>
        <div class="actions">
          <button class="btn btn-edit" onclick="editProduct(${item.rent_id}, 'rent')">Edit</button>
          <button class="btn btn-delete" onclick="deleteProduct(${item.rent_id}, 'rent')">Delete</button>
        </div>
      </div>`;
  });
}

// === Load Fertilizers ===
async function loadFertilizers() {
  const container = document.getElementById("fertilizer-container");
  const res = await fetch("http://localhost:5000/api/fertilizers");
  const items = await res.json();
  container.innerHTML = "";

  items.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <img src="${item.fert_image}" alt="${item.fert_name}">
        <h3>${item.fert_name}</h3>
        <p>Rs ${item.fert_price}</p>
        <p>Stock: ${item.fert_stock}</p>
        <div class="actions">
          <button class="btn btn-edit" onclick="editProduct(${item.fert_id}, 'fert')">Edit</button>
          <button class="btn btn-delete" onclick="deleteProduct(${item.fert_id}, 'fert')">Delete</button>
        </div>
      </div>`;
  });
}

// === Edit Product (Prefill) ===
async function editProduct(id, category) {
  const res = await fetch(`http://localhost:5000/api/${category === "rent" ? "rent-items" : "fertilizers"}/${id}`);
  const data = await res.json();

  document.getElementById("editProductId").value = id;
  document.getElementById("editName").value = data[`${category}_name`];
  document.getElementById("editImage").value = data[`${category}_image`];
  document.getElementById("editDescription").value = data[`${category}_description`];
  document.getElementById("editStock").value = data[`${category}_stock`];
  document.getElementById("editPrice").value = data[`${category}_price`];
  document.getElementById("editCategory").value = category;

  openEditProductPopup();
}

// === Delete Product ===
async function deleteProduct(id, category) {
  if (!confirm("Are you sure to delete this product?")) return;
  const res = await fetch(`http://localhost:5000/api/${category === "rent" ? "rent-items" : "fertilizers"}/${id}`, { method: "DELETE" });

  if (res.ok) {
    alert("✅ Deleted!");
    loadRentItems();
    loadFertilizers();
  } else {
    alert("❌ Failed to delete.");
  }
}

// === Save Edited Product ===
document.getElementById("editProductForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editProductId").value;
  const category = document.getElementById("editCategory").value;

  const updated = {
    [`${category}_name`]: document.getElementById("editName").value,
    [`${category}_image`]: document.getElementById("editImage").value,
    [`${category}_description`]: document.getElementById("editDescription").value,
    [`${category}_stock`]: document.getElementById("editStock").value,
    [`${category}_rating`]: 4.0,
    [`${category}_price`]: parseFloat(document.getElementById("editPrice").value)
  };

  const res = await fetch(`http://localhost:5000/api/${category === "rent" ? "rent-items" : "fertilizers"}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  });

  if (res.ok) {
    alert("✅ Updated successfully!");
    closeEditProductPopup();
    loadRentItems();
    loadFertilizers();
  } else {
    alert("❌ Update failed.");
  }
});

// === Add New Product ===
document.getElementById("addProductForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const product = {
    name: document.getElementById("addName").value,
    image: document.getElementById("addImage").value,
    description: document.getElementById("addDescription").value,
    stock: document.getElementById("addStock").value,
    price: parseFloat(document.getElementById("addPrice").value),
    category: document.getElementById("addCategory").value,
    rating: 4.0
  };

  const payload = product.category === "rent" ? {
    rent_id: null,
    rent_name: product.name,
    rent_image: product.image,
    rent_description: product.description,
    rent_stock: product.stock,
    rent_rating: product.rating,
    rent_price: product.price
  } : {
    fert_id: null,
    fert_name: product.name,
    fert_image: product.image,
    fert_description: product.description,
    fert_stock: product.stock,
    fert_rating: product.rating,
    fert_price: product.price
  };

  const res = await fetch(`http://localhost:5000/api/${product.category === "rent" ? "rent-items" : "fertilizers"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert("✅ Product added!");
    closeAddProductPopup();
    loadRentItems();
    loadFertilizers();
  } else {
    const err = await res.json();
    alert("❌ Failed: " + err.error);
  }
});


async function loadBuyers() {
  try {
    const res = await fetch("http://localhost:5000/api/buyers");
    const buyers = await res.json();
    const tableBody = document.getElementById("buyerTableBody");
    tableBody.innerHTML = "";

    buyers.forEach(buyer => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${buyer.buyer_id}</td>
        <td>${buyer.buyer_name}</td>
        <td>${buyer.contact_number}</td>
        <td>${buyer.email}</td>
        <td>${buyer.item_id || "N/A"}</td>
        <td>${buyer.product_name || "N/A"}</td>
        <td>${buyer.price || "N/A"}</td>
        <td>${buyer.total_amount || "N/A"}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading buyers:", err);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:5000/api/dashboard/summary")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("staff-count").textContent = data.staff;
      document.getElementById("farmers-count").textContent = data.farmers;
      document.getElementById("buyers-count").textContent = data.buyers;
      document.getElementById("harvest-count").textContent = `${data.totalHarvest}kg`;
    })
    .catch((err) => {
      console.error("Failed to load summary data:", err);
    });
});


let farmerToDeleteId = null;

function promptFarmerDelete(id) {
  farmerToDeleteId = id;
  const popup = document.getElementById("farmerDeletePopup");
  popup.style.visibility = "visible";
  popup.style.transform = "translateX(-50%) scale(1)";
}

function cancelFarmerDelete() {
  farmerToDeleteId = null;
  const popup = document.getElementById("farmerDeletePopup");
  popup.style.visibility = "hidden";
  popup.style.transform = "translateX(-50%) scale(0)";
}

async function confirmFarmerDelete() {
  if (!farmerToDeleteId) return;

  try {
    const res = await fetch(`http://localhost:5000/api/staff/delete/${farmerToDeleteId}`, {
      method: "DELETE"
    });

    if (res.ok) {
      Toastify({
        text: "✅ Farmer deleted!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#E54335",
      }).showToast();

      cancelFarmerDelete(); // ✅ CLOSE the popup before reload
      loadFarmers();        // ✅ Then reload data

    } else {
      const result = await res.json();
      alert("❌ Delete failed: " + result.error);
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("❌ Server error.");
  }
}




// === On Load ===
window.onload = () => {
  loadFarmers();
  loadHarvest();
  loadRentItems();
  loadFertilizers();
  switchShopTab("rent");
  loadBuyers();

};





