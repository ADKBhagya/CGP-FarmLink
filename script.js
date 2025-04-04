//Staff

async function registerFarmer() {
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
        const response = await fetch("http://localhost:5000/api/staff/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(farmerData),
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Farmer Registered Successfully! Staff ID: " + result.StaffID);
            document.getElementById("farmerForm").reset(); // Clear form after submission
        } else {
            alert("⚠ Error: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("⚠ Failed to register farmer. Please try again!");
    }
}

loadFarmers();




  