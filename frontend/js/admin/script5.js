document.addEventListener("DOMContentLoaded", function () {
    const rentItemsBtn = document.getElementById("rentItemsBtn");
    const fertilizerBtn = document.getElementById("fertilizerBtn");
    const rentItemsSection = document.getElementById("rentItems");
    const fertilizerSection = document.getElementById("fertilizer");

    rentItemsBtn.addEventListener("click", function () {
        rentItemsSection.classList.add("active");
        fertilizerSection.classList.remove("active");
        rentItemsBtn.classList.add("active");
        fertilizerBtn.classList.remove("active");
    });

    fertilizerBtn.addEventListener("click", function () {
        fertilizerSection.classList.add("active");
        rentItemsSection.classList.remove("active");
        fertilizerBtn.classList.add("active");
        rentItemsBtn.classList.remove("active");
    });
});
