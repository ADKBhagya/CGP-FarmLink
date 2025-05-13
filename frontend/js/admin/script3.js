document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("tbody");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const pdfBtn = document.querySelector(".pdf-btn");

    let currentPage = 1;
    const rowsPerPage = 5;
    let data = [];

 

    prevBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            displayTable(currentPage);
        }
    });

    nextBtn.addEventListener("click", function () {
        if (currentPage < Math.ceil(data.length / rowsPerPage)) {
            currentPage++;
            displayTable(currentPage);
        }
    });

    pdfBtn.addEventListener("click", function () {
        const printWindow = window.open("", "_blank");
        printWindow.document.write("<html><head><title>View Farmer</title></head><body>");
        printWindow.document.write(document.querySelector("table").outerHTML);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    });

    generateData();
    displayTable(currentPage);
});
