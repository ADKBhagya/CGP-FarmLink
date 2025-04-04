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

//Meetings
function openMeetingPage(pageUrl) {
    window.open(pageUrl, '_blank'); // Opens in a new tab
}
document.getElementById("scheduleMeetingBtn").addEventListener("click", function() {
    window.location.href = "/CGP-FarmLink/frontend/html/meetings/calendar(1).html"; // Redirect to the calendar page
  });
  let calendar = document.querySelector('.calendar')

const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
}

getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    let currDate = new Date()
    if (!month) month = currDate.getMonth()
    if (!year) year = currDate.getFullYear()

    let curr_month = `${month_names[month]}`
    month_picker.innerHTML = curr_month
    calendar_header_year.innerHTML = year

    // get first day of month
    
    let first_day = new Date(year, month, 1)

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div')
        if (i >= first_day.getDay()) {
            day.classList.add('calendar-day-hover')
            day.innerHTML = i - first_day.getDay() + 1
            day.innerHTML += `<span></span>
                            <span></span>
                            <span></span>
                            <span></span>`
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.classList.add('curr-date')
            }
        }
        calendar_days.appendChild(day)
    }
}

let month_list = calendar.querySelector('.month-list')

month_names.forEach((e, index) => {
    let month = document.createElement('div')
    month.innerHTML = `<div data-month="${index}">${e}</div>`
    month.querySelector('div').onclick = () => {
        month_list.classList.remove('show')
        curr_month.value = index
        generateCalendar(index, curr_year.value)
    }
    month_list.appendChild(month)
})

let month_picker = calendar.querySelector('#month-picker')

month_picker.onclick = () => {
    month_list.classList.add('show')
}

let currDate = new Date()

let curr_month = {value: currDate.getMonth()}
let curr_year = {value: currDate.getFullYear()}

generateCalendar(curr_month.value, curr_year.value)

document.querySelector('#prev-year').onclick = () => {
    --curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

document.querySelector('#next-year').onclick = () => {
    ++curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

function goToMeetings() {
    window.location.href = "/CGP-FarmLink/frontend/html/meetings/meetings.html" // Replace with the correct URL
}



