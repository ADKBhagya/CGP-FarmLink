document.addEventListener("DOMContentLoaded", function () {
    let deleteRow = null; // Store the row to be deleted

    // Open delete confirmation modal
    function openDeleteModal(row) {
        deleteRow = row;
        document.getElementById("deleteModal").style.display = "flex";
    }

    // Close the modal
    function closeDeleteModal() {
        document.getElementById("deleteModal").style.display = "none";
        deleteRow = null; // Reset stored row
    }

    // Handle delete button click inside table
    document.querySelector("tbody").addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-btn")) {
            event.preventDefault(); // Prevent form submission
            let row = event.target.closest("tr"); // Get the selected row
            openDeleteModal(row);
        }
    });

    // Confirm delete action
    document.getElementById("confirmDelete").addEventListener("click", function () {
        if (deleteRow) {
            const form = deleteRow.querySelector("form");
            form.submit(); // Submit the form to delete the staff member
        }
        closeDeleteModal(); // Close modal after deleting
    });

    // Cancel delete action
    document.getElementById("cancelDelete").addEventListener("click", function () {
        closeDeleteModal(); // Close modal when "No" is clicked
    });

    // Close modal when clicking outside the modal content
    document.getElementById("deleteModal").addEventListener("click", function (event) {
        if (event.target === document.getElementById("deleteModal")) {
            closeDeleteModal();
        }
    });

    // PDF Generation Function
    document.getElementById("downloadPDF").addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        let doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text("FarmLink Staff List", 14, 22);
        doc.setFontSize(12);
        doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);

        // Use autotable plugin if available
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({ 
                html: '#staffTable',
                startY: 35,
                theme: 'grid',
                headStyles: { fillColor: [75, 75, 75] },
                columnStyles: {
                    10: { cellWidth: 'auto', halign: 'center' } // Format the actions column
                },
                didDrawPage: function(data) {
                    // Footer
                    doc.setFontSize(10);
                    doc.text("FarmLink - Staff Management System", 14, doc.internal.pageSize.height - 10);
                    doc.text("Page " + doc.internal.getNumberOfPages(), doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
                }
            });
        } else {
            // Fallback for when autotable is not available
            const table = document.querySelector("table");
            const rows = table.querySelectorAll("tr");
            let y = 40;

            rows.forEach((row, index) => {
                if (index === 0) {
                    // Add header styling
                    doc.setFillColor(75, 75, 75);
                    doc.setTextColor(255, 255, 255);
                } else {
                    // Reset for data rows
                    doc.setTextColor(0, 0, 0);
                }

                const cells = row.querySelectorAll("th, td");
                let x = 10;
                
                cells.forEach((cell, cellIndex) => {
                    // Skip the last column (actions) for PDF
                    if (cellIndex < cells.length - 1) {
                        const text = cell.innerText;
                        doc.text(text.substring(0, 25), x, y); // Limit text length
                        x += 20; // Adjust X for the next cell
                    }
                });
                
                y += 10; // Move to next row
                
                // Add a new page if we're near the bottom
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
        }

        doc.save("FarmLink_Staff_List.pdf");
    });

    // Fetch and display staff data
    fetch('/get-staff')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('tbody');
            tableBody.innerHTML = ''; // Clear any existing rows
            
            data.forEach(staff => {
                const row = document.createElement('tr');
                // Format the date to be more readable
                const joinedDate = new Date(staff.joined_date).toLocaleDateString();
                
                row.innerHTML = `
                    <td>${staff.staff_id}</td>
                    <td>${staff.first_name} ${staff.last_name}</td>
                    <td>${staff.contact_number}</td>
                    <td>${staff.position}</td>
                    <td>${staff.gender}</td>
                    <td>${joinedDate}</td>
                    <td>${staff.nic}</td>
                    <td>${staff.email}</td>
                    <td>${staff.username}</td>
                    <td>${staff.password}</td>
                    <td>
                        <form action="/delete-staff" method="POST">
                            <input type="hidden" name="staff_id" value="${staff.staff_id}">
                            <button type="submit" class="delete-btn">Delete</button>
                        </form>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching staff data:', error));
});