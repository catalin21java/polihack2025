// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== SIDEBAR TOGGLE =====
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        });
    }
    
    // On small screens, toggle sidebar visibility
    const handleResize = () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('sidebar-collapsed');
            sidebar.classList.add('sidebar-hidden');
            mainContent.classList.remove('sidebar-collapsed');
            
            // Add mobile toggle functionality
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && 
                    !sidebarToggle.contains(e.target) && 
                    sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                }
            });
        } else {
            sidebar.classList.remove('sidebar-hidden', 'show');
        }
    };
    
    // Initial check and listen for window resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // ===== USER DATA =====
    // Simulated user data
    const userData = {
        name: "John Packer",
        points: 1284,
        co2Saved: 42.8,
        distance: 87.5,
        activeDays: 5,
        healthData: {
            steps: 7500,
            stepsGoal: 10000,
            activeMinutes: 41,
            activeMinutesGoal: 50,
            caloriesBurned: 285,
            caloriesBurnedGoal: 300,
            connected: false
        },
        activityData: {
            // Last 12 weeks of activity (for charts)
            weekly: [
                { week: "May 22", walking: 15.3, cycling: 22.8, publicTransport: 32.1 },
                { week: "May 29", walking: 17.8, cycling: 19.5, publicTransport: 28.7 },
                { week: "Jun 5", walking: 14.2, cycling: 24.3, publicTransport: 30.5 },
                { week: "Jun 12", walking: 18.9, cycling: 20.1, publicTransport: 25.8 },
                { week: "Jun 19", walking: 16.5, cycling: 22.7, publicTransport: 29.3 },
                { week: "Jun 26", walking: 19.1, cycling: 18.9, publicTransport: 26.4 },
                { week: "Jul 3", walking: 20.5, cycling: 25.2, publicTransport: 41.8 },
                { week: "Jul 10", walking: 18.7, cycling: 23.8, publicTransport: 35.2 },
                { week: "Jul 17", walking: 16.9, cycling: 21.4, publicTransport: 32.6 },
                { week: "Jul 24", walking: 15.2, cycling: 22.5, publicTransport: 28.9 },
                { week: "Jul 31", walking: 17.8, cycling: 20.3, publicTransport: 30.7 },
                { week: "Aug 7", walking: 19.5, cycling: 24.5, publicTransport: 34.2 }
            ],
            // Recent activities
            recent: [
                {
                    type: "walking",
                    title: "Morning Walk",
                    distance: 3.2,
                    duration: 38,
                    calories: 145,
                    points: 30,
                    timestamp: new Date(new Date().setHours(7, 35, 0, 0)),
                    details: "3.2 km in 38 minutes"
                },
                {
                    type: "cycling",
                    title: "Commute to Work",
                    distance: 8.7,
                    duration: 29,
                    calories: 210,
                    points: 50,
                    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(8, 20, 0, 0),
                    details: "8.7 km in at average speed of 18 km/h"
                },
                {
                    type: "public_transport",
                    title: "Evening Bus Ride",
                    distance: 12.5,
                    duration: 45,
                    co2Saved: 1.5,
                    points: 25,
                    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(18, 10, 0, 0),
                    details: "12.5 km journey by public transport"
                }
            ]
        },
        environmentalImpact: {
            co2Saved: 42.8,
            treeEquivalent: 15,
            fuelSaved: 83,
            userRank: "Top 5%"
        },
        availableRewards: [
            {
                id: 1,
                title: "Free Coffee",
                provider: "Green Bean Cafe",
                points: 150,
                image: "https://placehold.co/80x80/e9f5db/1b4332?text=Coffee&font=poppins"
            },
            {
                id: 2,
                title: "Bike Tune-Up",
                provider: "City Cycles",
                points: 300,
                image: "https://placehold.co/80x80/e9f5db/1b4332?text=Bike&font=poppins"
            },
            {
                id: 3,
                title: "Movie Tickets",
                provider: "Cinema City",
                points: 250,
                image: "https://placehold.co/80x80/e9f5db/1b4332?text=Movie&font=poppins"
            }
        ]
    };

    // ===== INITIALIZE CHARTS =====
    // Activity Chart
    const activityChartEl = document.getElementById('activityChart');
    let activityChart;
    
    if (activityChartEl) {
        const ctx = activityChartEl.getContext('2d');
        
        // Get last 4 weeks of data (most recent)
        const chartData = userData.activityData.weekly.slice(-4);
        
        activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(item => item.week),
                datasets: [
                    {
                        label: 'Walking',
                        data: chartData.map(item => item.walking),
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--walking'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--walking'),
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Cycling',
                        data: chartData.map(item => item.cycling),
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--cycling'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--cycling'),
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Public Transport',
                        data: chartData.map(item => item.publicTransport),
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--public-transport'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--public-transport'),
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        titleFont: {
                            family: "'Poppins', sans-serif",
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        },
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.raw} km`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            }
                        }
                    }
                }
            }
        });
        
        // Period selector buttons
        const periodBtns = document.querySelectorAll('.activity-chart .card-actions .btn-sm');
        
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                periodBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update chart data based on selected period
                let dataToShow;
                if (this.textContent === 'Week') {
                    dataToShow = userData.activityData.weekly.slice(-1);
                } else if (this.textContent === 'Month') {
                    dataToShow = userData.activityData.weekly.slice(-4);
                } else if (this.textContent === 'Year') {
                    dataToShow = userData.activityData.weekly;
                }
                
                activityChart.data.labels = dataToShow.map(item => item.week);
                activityChart.data.datasets[0].data = dataToShow.map(item => item.walking);
                activityChart.data.datasets[1].data = dataToShow.map(item => item.cycling);
                activityChart.data.datasets[2].data = dataToShow.map(item => item.publicTransport);
                
                activityChart.update();
            });
        });
    }

    // Environmental Impact Chart
    const impactChartEl = document.getElementById('impactChart');
    let impactChart;
    
    if (impactChartEl) {
        const ctx = impactChartEl.getContext('2d');
        
        impactChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Walking', 'Cycling', 'Public Transport'],
                datasets: [{
                    data: [
                        userData.activityData.weekly.reduce((total, week) => total + week.walking, 0),
                        userData.activityData.weekly.reduce((total, week) => total + week.cycling, 0),
                        userData.activityData.weekly.reduce((total, week) => total + week.publicTransport, 0)
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--walking'),
                        getComputedStyle(document.documentElement).getPropertyValue('--cycling'),
                        getComputedStyle(document.documentElement).getPropertyValue('--public-transport')
                    ],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                    borderWidth: 5,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        titleFont: {
                            family: "'Poppins', sans-serif",
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        },
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return ` ${context.label}: ${value.toFixed(1)} km (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== TRIP PLANNER FUNCTIONALITY =====
    const tripForm = document.querySelector('.trip-form');
    
    if (tripForm) {
        const planRouteBtn = tripForm.querySelector('.form-actions .btn-primary');
        
        planRouteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const startLocation = document.getElementById('start-location').value;
            const endLocation = document.getElementById('end-location').value;
            const transportMode = document.querySelector('input[name="transport"]:checked').value;
            
            if (!startLocation || !endLocation) {
                showNotification('Please enter both start and destination locations.', 'error');
                return;
            }
            
            // Show planning notification
            showNotification(`Planning your ${transportMode} route from ${startLocation} to ${endLocation}...`, 'info');
            
            // Simulate API call delay
            setTimeout(() => {
                // Success notification with simulated data
                const distance = (Math.random() * 8 + 2).toFixed(1);
                const duration = Math.round(distance * (transportMode === 'walking' ? 12 : transportMode === 'cycling' ? 4 : 3));
                const points = calculatePoints(transportMode, distance);
                const co2Saved = calculateCO2Saved(transportMode, distance);
                
                showNotification(`Route found! ${distance} km, approx. ${duration} mins. You'll earn ${points} points and save ${co2Saved.toFixed(2)} kg of CO₂.`, 'success');
            }, 2000);
        });
        
        // Show alternatives button
        const alternativesBtn = tripForm.querySelector('.form-actions .btn-outline');
        
        alternativesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const startLocation = document.getElementById('start-location').value;
            const endLocation = document.getElementById('end-location').value;
            
            if (!startLocation || !endLocation) {
                showNotification('Please enter both start and destination locations.', 'error');
                return;
            }
            
            // Show planning notification
            showNotification(`Finding alternative routes from ${startLocation} to ${endLocation}...`, 'info');
            
            // Simulate API call delay
            setTimeout(() => {
                showRouteAlternatives(startLocation, endLocation);
            }, 1500);
        });
    }

    function showRouteAlternatives(start, end) {
        // Create modal for route alternatives
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content route-alternatives';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3>Route Alternatives</h3>
            <button class="modal-close">&times;</button>
        `;
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        // Generate random route alternatives
        const walkingDistance = (Math.random() * 4 + 1).toFixed(1);
        const walkingDuration = Math.round(walkingDistance * 12);
        const walkingPoints = calculatePoints('walking', walkingDistance);
        const walkingCO2 = calculateCO2Saved('walking', walkingDistance);
        
        const cyclingDistance = (Math.random() * 4 + 5).toFixed(1);
        const cyclingDuration = Math.round(cyclingDistance * 4);
        const cyclingPoints = calculatePoints('cycling', cyclingDistance);
        const cyclingCO2 = calculateCO2Saved('cycling', cyclingDistance);
        
        const publicDistance = (Math.random() * 5 + 5).toFixed(1);
        const publicDuration = Math.round(publicDistance * 3);
        const publicPoints = calculatePoints('public_transport', publicDistance);
        const publicCO2 = calculateCO2Saved('public_transport', publicDistance);
        
        modalBody.innerHTML = `
            <div class="route-list">
                <div class="route-item">
                    <div class="route-mode walking">
                        <i class="fas fa-walking"></i>
                    </div>
                    <div class="route-details">
                        <h4>Walking Route</h4>
                        <p>${walkingDistance} km (approx. ${walkingDuration} minutes)</p>
                        <div class="route-meta">
                            <span><i class="fas fa-star"></i> Earn ${walkingPoints} points</span>
                            <span><i class="fas fa-leaf"></i> Save ${walkingCO2.toFixed(2)} kg CO₂</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary">Select</button>
                </div>
                <div class="route-item">
                    <div class="route-mode cycling">
                        <i class="fas fa-bicycle"></i>
                    </div>
                    <div class="route-details">
                        <h4>Cycling Route</h4>
                        <p>${cyclingDistance} km (approx. ${cyclingDuration} minutes)</p>
                        <div class="route-meta">
                            <span><i class="fas fa-star"></i> Earn ${cyclingPoints} points</span>
                            <span><i class="fas fa-leaf"></i> Save ${cyclingCO2.toFixed(2)} kg CO₂</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary">Select</button>
                </div>
                <div class="route-item">
                    <div class="route-mode public-transport">
                        <i class="fas fa-bus"></i>
                    </div>
                    <div class="route-details">
                        <h4>Public Transport</h4>
                        <p>${publicDistance} km (approx. ${publicDuration} minutes)</p>
                        <div class="route-meta">
                            <span><i class="fas fa-star"></i> Earn ${publicPoints} points</span>
                            <span><i class="fas fa-leaf"></i> Save ${publicCO2.toFixed(2)} kg CO₂</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary">Select</button>
                </div>
            </div>
        `;
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
        
        // Add close button functionality
        const closeBtn = modalContainer.querySelector('.modal-close');
        closeBtn.addEventListener('click', function() {
            closeModal(modalContainer);
        });
        
        // Add route selection functionality
        const routeSelectBtns = modalContainer.querySelectorAll('.route-item .btn');
        routeSelectBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const routeItem = this.closest('.route-item');
                const routeMode = routeItem.querySelector('.route-mode').classList.contains('walking') ? 'walking' : 
                                 routeItem.querySelector('.route-mode').classList.contains('cycling') ? 'cycling' : 'public_transport';
                const routeDistance = parseFloat(routeItem.querySelector('p').textContent.split(' ')[0]);
                const routeDuration = parseInt(routeItem.querySelector('p').textContent.match(/\(approx\. (\d+) minutes\)/)[1]);
                
                // Update the form's selected transport mode
                document.querySelector(`input[name="transport"][value="${routeMode}"]`).checked = true;
                
                closeModal(modalContainer);
                
                showNotification(`Route selected! Starting navigation for your ${routeMode} journey.`, 'success');
            });
        });
        
        // Close modal when clicking outside
        modalContainer.addEventListener('click', function(e) {
            if (e.target === modalContainer) {
                closeModal(modalContainer);
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modalContainer.classList.add('active');
        }, 10);
    }

    function closeModal(modalContainer) {
        modalContainer.classList.remove('active');
        
        setTimeout(() => {
            document.body.removeChild(modalContainer);
        }, 300);
    }

    // ===== REWARDS FUNCTIONALITY =====
    // ===== GEOLOCATION-BASED REWARDS REDIRECT =====
const rewardsNav = [...document.querySelectorAll(".sidebar-menu li a")].find(
    a => a.textContent.trim().toLowerCase().includes("rewards")
);

if (rewardsNav) {
    rewardsNav.addEventListener("click", (e) => {
        e.preventDefault();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                if (lat >= 46.7 && lat <= 46.9 && lon >= 23.5 && lon <= 23.7) {
                    window.location.href = "cluj.html";
                } else if (lat >= 45.7 && lat <= 45.8 && lon >= 21.1 && lon <= 21.3) {
                    window.location.href = "timisoara.html";
                } else {
                    alert("No local rewards available in your city yet.");
                }
            }, () => {
                alert("Location permission denied.");
            });
        } else {
            alert("Geolocation is not supported in your browser.");
        }
    });
}


    // ===== HEALTH CONNECTION =====
    const connectHealthBtn = document.querySelector('.connect-health-btn .btn');
    
    if (connectHealthBtn) {
        connectHealthBtn.addEventListener('click', function() {
            // Show connecting notification
            showNotification('Connecting to health app...', 'info');
            
            // Simulate connection delay
            setTimeout(() => {
                // Update UI
                connectHealthBtn.textContent = 'Health App Connected';
                connectHealthBtn.classList.add('connected');
                
                // Update user data
                userData.healthData.connected = true;
                
                // Show success notification
                showNotification('Successfully connected to your health app!', 'success');
            }, 2000);
        });
    }

    // ===== UTILITY FUNCTIONS =====
    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            container.removeChild(notification);
        });
        
        notification.appendChild(closeBtn);
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode === container) {
                container.removeChild(notification);
            }
        }, 5000);
        
        // Add animation styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'notification-styles';
            styleElement.textContent = `
                .notification-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 320px;
                }
                
                .notification {
                    background-color: white;
                    color: #333;
                    border-radius: 8px;
                    padding: 15px 40px 15px 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    position: relative;
                    animation: slide-in 0.3s ease forwards;
                    border-left: 4px solid #ccc;
                }
                
                .notification.info {
                    border-left-color: #7cd5fa;
                }
                
                .notification.success {
                    border-left-color: #88d8b0;
                }
                
                .notification.error {
                    border-left-color: #ff8a8a;
                }
                
                .notification-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #666;
                }
                
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .route-alternatives .route-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .route-alternatives .route-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    border-radius: 8px;
                    background-color: #f8fffa;
                    transition: all 0.2s ease;
                }
                
                .route-alternatives .route-item:hover {
                    background-color: #eaf8f1;
                }
                
                .route-alternatives .route-mode {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
                
                .route-alternatives .route-mode.walking {
                    background-color: rgba(152, 216, 200, 0.2);
                    color: #98d8c8;
                }
                
                .route-alternatives .route-mode.cycling {
                    background-color: rgba(123, 201, 224, 0.2);
                    color: #7bc9e0;
                }
                
                .route-alternatives .route-mode.public-transport {
                    background-color: rgba(181, 160, 220, 0.2);
                    color: #b5a0dc;
                }
                
                .route-alternatives .route-details {
                    flex: 1;
                }
                
                .route-alternatives .route-details h4 {
                    margin-bottom: 5px;
                }
                
                .route-alternatives .route-details p {
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }
                
                .route-alternatives .route-meta {
                    display: flex;
                    gap: 15px;
                }
                
                .route-alternatives .route-meta span {
                    font-size: 0.8rem;
                    color: #8b8b8b;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .btn-disabled {
                    background-color: #e0e0e0 !important;
                    color: #8b8b8b !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                    box-shadow: none !important;
                }
                
                .connected {
                    background-color: #88d8b0 !important;
                }
            `;
            
            document.head.appendChild(styleElement);
        }
    }
    
    // Calculate points based on transport mode and distance
    function calculatePoints(mode, distance) {
        switch (mode) {
            case 'walking':
                return Math.round(distance * 10);
            case 'cycling':
                return Math.round(distance * 6);
            case 'public_transport':
                return Math.round(distance * 2);
            default:
                return 0;
        }
    }
    
    // Calculate CO2 saved based on transport mode and distance
    function calculateCO2Saved(mode, distance) {
        // Average car emits 120g CO2 per km
        // Walking and cycling are carbon neutral
        // Public transport emits around 30g CO2 per km per person
        const carEmission = 0.12; // kg per km
        
        switch (mode) {
            case 'walking':
            case 'cycling':
                return distance * carEmission;
            case 'public_transport':
                return distance * (carEmission - 0.03);
            default:
                return 0;
        }
    }
    
    // Format date for display
    function formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date >= today) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date >= yesterday) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
                   `, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    // Initialize circular progress for health metrics
    const initializeCircularProgress = () => {
        const circles = document.querySelectorAll('.metric-circle');
        
        circles.forEach(circle => {
            const value = parseInt(circle.getAttribute('data-value'));
            const circumference = 2 * Math.PI * 40; // r = 40
            const offset = circumference - (circumference * value) / 100;
            
            const progressCircle = circle.querySelector('.progress');
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = offset;
        });
    };
    
    initializeCircularProgress();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            let cityScript;
    
            if (lat >= 46.7 && lat <= 46.9 && lon >= 23.5 && lon <= 23.7) {
                cityScript = 'cluj.js';
            } else if (lat >= 45.7 && lat <= 45.8 && lon >= 21.1 && lon <= 21.3) {
                cityScript = 'timisoara.js';
            }
    
            if (cityScript) {
                const script = document.createElement('script');
                script.src = `./src/${cityScript}`;
                script.onload = () => {
                    if (typeof businesses !== 'undefined') {
                        renderCityRewards(businesses);
                    }
                };
                document.head.appendChild(script);
            } else {
                document.querySelector('.rewards-list').innerHTML = '<p>No rewards available in your city yet.</p>';
            }
        }, () => {
            document.querySelector('.rewards-list').innerHTML = '<p>Location access denied. Cannot load local rewards.</p>';
        });
    } else {
        document.querySelector('.rewards-list').innerHTML = '<p>Geolocation is not supported.</p>';
    }
    function renderCityRewards(businesses) {
        const rewardsList = document.querySelector('.rewards-list');
        rewardsList.innerHTML = '';
    
        const affordable = [];
        const locked = [];
    
        businesses.forEach(biz => {
            biz.offers.forEach(offer => {
                const offerData = { ...offer, provider: biz.name };
                if (userData.points >= offer.points) {
                    affordable.push(offerData);
                } else {
                    locked.push(offerData);
                }
            });
        });
    
        if (affordable.length > 0) {
            const title = document.createElement('h4');
            rewardsList.appendChild(title);
            affordable.forEach(offer => rewardsList.appendChild(createRewardCard(offer, true)));
        }
    
        if (locked.length > 0) {
            const title = document.createElement('h4');
            title.textContent = 'More Rewards (Keep Going!)';
            title.style.marginTop = '20px';
            rewardsList.appendChild(title);
            locked.forEach(offer => {
                const card = createRewardCard(offer, false);
                const message = document.createElement('p');
                message.textContent = `You need ${offer.points - userData.points} more points.`;
                message.style.fontSize = '0.85rem';
                message.style.color = '#777';
                card.querySelector('.reward-info').appendChild(message);
                rewardsList.appendChild(card);
            });
        }
    
        // Optional: re-add static userData rewards if needed
        // renderAvailableRewardsFromUserData();
    }
    
    function createRewardCard(reward, canRedeem) {
        const card = document.createElement('div');
        card.className = 'reward-item';
    
        card.innerHTML = `
            <img src="${reward.image}" alt="${reward.title}">
            <div class="reward-info">
                <h4>${reward.title}</h4>
                <p class="reward-provider">${reward.provider}</p>
                <p class="reward-points">${reward.points} points</p>
            </div>
            <button class="btn ${canRedeem ? 'btn-outline' : 'btn-disabled'}" ${canRedeem ? '' : 'disabled'}>
                ${canRedeem ? 'Redeem' : 'Locked'}
            </button>
        `;
    
        if (canRedeem) {
            card.querySelector('button').addEventListener('click', function () {
                if (userData.points >= reward.points) {
                    userData.points -= reward.points;
                    this.textContent = 'Redeemed';
                    this.disabled = true;
                    this.classList.remove('btn-outline');
                    this.classList.add('btn-disabled');
    
                    const pointsDisplay = document.querySelector('.stat-card .stat-details h3');
                    if (pointsDisplay) {
                        pointsDisplay.textContent = userData.points.toLocaleString();
                    }
    
                    showNotification(`You've redeemed ${reward.title} for ${reward.points} points!`, 'success');
                }
            });
        }
    
        return card;
    }
    
    
});
