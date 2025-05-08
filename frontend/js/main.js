// Update temperature every minute
function updateTemperature() {
    const temp = document.querySelector('.stat-card h3');
    if (temp) {
        // Simulate temperature changes (for demo purposes)
        const randomTemp = (Math.random() * (32 - 28) + 28).toFixed(1);
        temp.textContent = `${randomTemp}°C`;
    }
}

// Update time
function updateTime() {
    const timeElement = document.querySelector('.stat-card small');
    if (timeElement) {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const time = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
        timeElement.innerHTML = `${days[now.getDay()]}<br>${time}`;
    }
}

// Initialize counters animation
function animateCounters() {
    const counters = document.querySelectorAll('.count');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 50; // Adjust speed of counting
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current).toString().padStart(3, '0');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toString().padStart(3, '0');
            }
        };
        
        updateCounter();
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateTemperature();
    updateTime();
    animateCounters();
    
    // Update temperature every minute
    setInterval(updateTemperature, 60000);
    
    // Update time every second
    setInterval(updateTime, 1000);
});

// Add hover effects to cards
document.querySelectorAll('.meeting-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
}); 