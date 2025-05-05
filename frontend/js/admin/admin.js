document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".dashboard-nav button").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelector(".dashboard-nav .active").classList.remove("active");
            this.classList.add("active");
        });
    });
});


    window.addEventListener('load', () => {
        // Once the page loads, start the process
        getLocationAndWeather();
      });
      
      function getLocationAndWeather() {
        // Check if browser supports Geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              fetchWeather(lat, lon);
            },
            error => {
              console.error("Error getting location:", error);
              displayError("Could not retrieve your location.");
            }
          );
        } else {
          displayError("Geolocation not supported in this browser.");
        }
      }
      
      async function fetchWeather(lat, lon) {
        const apiKey = "498783f458160f559d1d0ae55daf8ba4"; // Replace with your OpenWeatherMap API key
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      
        try {
          const response = await fetch(url);
          const data = await response.json();
      
          // Check if the response is valid
          if (data.cod !== 200) {
            displayError(data.message || "Error fetching weather data.");
            return;
          }
      
          displayWeather(data);
        } catch (error) {
          console.error("Error fetching weather data:", error);
          displayError("Unable to fetch weather data.");
        }
      }
      
      function displayWeather(data) {
        const weatherCard = document.getElementById('weatherCard');
      
        // Extract the data we need
        const tempCelsius = Math.round(data.main.temp);
        const condition = data.weather[0].description; // e.g. "light rain"
        const iconCode = data.weather[0].icon;         // e.g. "10d"
      
        // Create or update the inner HTML
        weatherCard.innerHTML = `
          <div class="temp">${tempCelsius}&#176;C</div>
          <div class="condition">${capitalizeFirstLetter(condition)}</div>
          <div class="icon">${getWeatherIcon(iconCode)}</div>
          <div class="date">${formatDate(new Date())}</div>
          <div class="time" id="time">${formatTime(new Date())}</div>
        `;
      
        // Update time every minute
        setInterval(() => {
          document.getElementById('time').textContent = formatTime(new Date());
        }, 1000 * 60);
      }
      
      // If there's an error, show a message in the card
      function displayError(msg) {
        const weatherCard = document.getElementById('weatherCard');
        weatherCard.textContent = msg;
      }
      
      // Helper function to capitalize first letter of a string
      function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      
      // Helper function to format date like "Monday, 28 January"
      function formatDate(dateObj) {
        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      
        const dayName = days[dateObj.getDay()];
        const dayNumber = dateObj.getDate();
        const monthName = months[dateObj.getMonth()];
        // const year = dateObj.getFullYear(); // If you want to show the year
      
        return `${dayName}, ${dayNumber} ${monthName}`;
      }
      
      // Helper function to format time like "09:41 AM"
      function formatTime(dateObj) {
        let hours = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
      
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? `0${minutes}` : minutes;
      
        return `${hours}:${minutes} ${ampm}`;
      }
      
      // Optionally, map OpenWeatherMap icon codes to your own icons or emojis
      function getWeatherIcon(iconCode) {
        // Basic example mapping
        // For full icon list, see: https://openweathermap.org/weather-conditions
        const iconMap = {
          "01d": "☀️",
          "01n": "🌕",
          "02d": "🌤",
          "02n": "☁️",
          "03d": "☁️",
          "03n": "☁️",
          "04d": "☁️",
          "04n": "☁️",
          "09d": "🌧",
          "09n": "🌧",
          "10d": "🌦",
          "10n": "🌧",
          "11d": "⛈",
          "11n": "⛈",
          "13d": "❄️",
          "13n": "❄️",
          "50d": "🌫",
          "50n": "🌫",
        };
      
        return iconMap[iconCode] || "☁️";
      }