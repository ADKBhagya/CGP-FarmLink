// Allow search on Enter key press
document.getElementById('harvestSearchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchHarvest();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Variables
    const tableBody = document.querySelector("#harvestTable tbody");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const pageInfo = document.getElementById("page-info");

    let currentPage = 1;
    const rowsPerPage = 10;
    let deleteRow = null;

    // Make these functions available globally for the search functions
    window.currentPage = currentPage;
    window.displayTable = displayTable;
    window.updatePageInfo = updatePageInfo;

    function loadHarvestData() {
        console.log('Fetching harvest data...');

        fetch(`${API_BASE_URL}/get-harvests`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            harvestData = data;
            filteredData = [...harvestData];
            displayTable(currentPage);
            updatePageInfo();
        })
        .catch(error => {
            console.error('Error fetching harvest data:', error);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading harvest data: ${error.message}</td></tr>`;
            }
        });
    }

    // Display harvest table with pagination
    function displayTable(page) {
        window.currentPage = page; // Update global reference
        tableBody.innerHTML = "";
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedData = filteredData.slice(start, end);

        if (paginatedData.length === 0 && page > 1) {
            window.currentPage--;
            displayTable(window.currentPage);
            return;
        }

        paginatedData.forEach(harvest => {
            let row = document.createElement("tr");
            row.setAttribute('data-id', harvest.harvest_id);

            row.innerHTML = `
                <td>${harvest.harvest_id}</td>
                <td>${harvest.farmer_id || ""}</td>
                <td>${harvest.contact_number || ""}</td>
                <td>${harvest.total_harvest || ""}</td>
                <td>${harvest.unit_price || ""}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <form action="${API_BASE_URL}/delete-harvest" method="POST" style="display: inline;">
                        <input type="hidden" name="harvest_id" value="${harvest.harvest_id}">
                        <button type="submit" class="delete-btn">Delete</button>
                    </form>
                </td>
            `;
            tableBody.appendChild(row);
        });

        updateDashboardHarvestCount();
    }

    // Update page info text
    function updatePageInfo() {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
        pageInfo.textContent = `Page ${window.currentPage} of ${totalPages}`;

        // Disable/enable pagination buttons
        prevBtn.disabled = window.currentPage === 1;
        nextBtn.disabled = window.currentPage === totalPages;

        // Visual feedback for disabled buttons
        if (prevBtn.disabled) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }

        if (nextBtn.disabled) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    // Rest of your code remains the same...
    
    // Initialize
    loadHarvestData();
});

  // Move these outside to make them global
  let harvestData = [];
  let filteredData = [];
  
  function searchHarvest() {
      const searchValue = document.getElementById('harvestSearchInput').value.trim();
      
      if (searchValue === '') {
          // If search is empty, reset to show all data
          filteredData = [...harvestData];
      } else {
          // Filter data by harvest_id
          filteredData = harvestData.filter(harvest =>
              harvest.harvest_id.toString().includes(searchValue)
          );
      }
      
      // Update the display
      window.currentPage = 1; // Reset to first page
      window.displayTable(window.currentPage);
      window.updatePageInfo();
  }
  
  function resetHarvestSearch() {
      document.getElementById('harvestSearchInput').value = '';
      filteredData = [...harvestData];
      window.currentPage = 1;
      window.displayTable(window.currentPage);
      window.updatePageInfo();
  }
