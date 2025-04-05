// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    const body = document.body;
    
    // Testimonials Slider
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    // Reward Cards
    const redeemButtons = document.querySelectorAll('.reward-card .btn');
    
    // Tracking Data (simulate user data)
    let userData = {
        points: 750,
        totalDistance: 235.8, // km
        co2Saved: 47.2, // kg
        tripHistory: [
            { date: '2023-11-10', type: 'walking', distance: 2.5, points: 25 },
            { date: '2023-11-09', type: 'biking', distance: 8.3, points: 50 },
            { date: '2023-11-08', type: 'public_transport', distance: 15.7, points: 30 },
            { date: '2023-11-07', type: 'walking', distance: 3.1, points: 30 },
            { date: '2023-11-06', type: 'biking', distance: 7.5, points: 45 },
        ]
    };
    
    // Track user session
    let currentUserSession = {
        isLoggedIn: false,
        currentTrip: null,
        isTracking: false
    };

    // ===== MOBILE NAVIGATION =====
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            toggleMobileNav();
        });
    }

    function toggleMobileNav() {
        // Create mobile nav if it doesn't exist
        if (!document.querySelector('.mobile-nav')) {
            const mobileNav = document.createElement('div');
            mobileNav.className = 'mobile-nav';
            
            const mobileNavContent = document.createElement('div');
            mobileNavContent.className = 'mobile-nav-content';
            
            // Clone navigation links
            const navLinksClone = navLinks.cloneNode(true);
            
            // Clone auth buttons
            const authButtonsClone = authButtons.cloneNode(true);
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', toggleMobileNav);
            
            mobileNavContent.appendChild(closeBtn);
            mobileNavContent.appendChild(navLinksClone);
            mobileNavContent.appendChild(authButtonsClone);
            
            mobileNav.appendChild(mobileNavContent);
            body.appendChild(mobileNav);
            
            // Add event listeners to mobile nav links
            const mobileNavLinks = mobileNav.querySelectorAll('a');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    toggleMobileNav();
                });
            });
            
            // Prevent body scroll when mobile nav is open
            setTimeout(() => {
                mobileNav.classList.add('open');
                body.style.overflow = 'hidden';
            }, 10);
        } else {
            const mobileNav = document.querySelector('.mobile-nav');
            mobileNav.classList.toggle('open');
            
            if (!mobileNav.classList.contains('open')) {
                setTimeout(() => {
                    body.removeChild(mobileNav);
                    body.style.overflow = '';
                }, 300);
            } else {
                body.style.overflow = 'hidden';
            }
        }
    }

    // ===== TESTIMONIALS SLIDER =====
    let currentSlide = 0;
    
    // Set up slider initially
    function setupSlider() {
        if (testimonialsSlider && testimonials.length > 0) {
            testimonials.forEach((testimonial, index) => {
                testimonial.style.transform = `translateX(${index * 100}%)`;
            });
            
            updateDots();
        }
    }
    
    // Update dots based on current slide
    function updateDots() {
        if (dots) {
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }
    
    // Go to a specific slide
    function goToSlide(slideIndex) {
        if (testimonials.length === 0) return;
        
        if (slideIndex < 0) {
            slideIndex = testimonials.length - 1;
        } else if (slideIndex >= testimonials.length) {
            slideIndex = 0;
        }
        
        testimonials.forEach((testimonial, index) => {
            testimonial.style.transform = `translateX(${(index - slideIndex) * 100}%)`;
        });
        
        currentSlide = slideIndex;
        updateDots();
    }
    
    // Set up event listeners for slider
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            goToSlide(currentSlide - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            goToSlide(currentSlide + 1);
        });
    }
    
    // Add event listeners to dots
    if (dots) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                goToSlide(index);
            });
        });
    }
    
    // Auto-advance slider every 5 seconds
    let sliderInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 5000);
    
    // Pause auto-advance on hover
    if (testimonialsSlider) {
        testimonialsSlider.addEventListener('mouseenter', () => {
            clearInterval(sliderInterval);
        });
        
        testimonialsSlider.addEventListener('mouseleave', () => {
            sliderInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        });
    }
    
    // Initialize slider
    setupSlider();

    // ===== REWARD REDEMPTION =====
    if (redeemButtons) {
        redeemButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const rewardCard = e.target.closest('.reward-card');
                const pointsElement = rewardCard.querySelector('.points-badge');
                const rewardTitle = rewardCard.querySelector('h3').textContent;
                const pointsRequired = parseInt(pointsElement.textContent);
                
                if (currentUserSession.isLoggedIn) {
                    if (userData.points >= pointsRequired) {
                        userData.points -= pointsRequired;
                        showNotification(`You've redeemed ${rewardTitle} for ${pointsRequired} points!`, 'success');
                        
                        // Update button to show redeemed status
                        button.textContent = 'Redeemed';
                        button.disabled = true;
                        button.classList.add('redeemed');
                    } else {
                        showNotification(`You need ${pointsRequired - userData.points} more points to redeem this reward.`, 'error');
                    }
                } else {
                    // Show login modal
                    showLoginModal('Please log in to redeem rewards');
                }
            });
        });
    }
    
    // ===== TRIP TRACKING SIMULATION =====
    // Get trip tracking buttons
    const startTrackingBtn = document.querySelector('.btn-primary');
    
    if (startTrackingBtn) {
        startTrackingBtn.addEventListener('click', function() {
            if (!currentUserSession.isLoggedIn) {
                showLoginModal('Please log in to start tracking your eco-trips');
            } else if (!currentUserSession.isTracking) {
                startTracking();
            } else {
                stopTracking();
            }
        });
    }
    
    function startTracking() {
        if (currentUserSession.isTracking) return;
        
        currentUserSession.isTracking = true;
        currentUserSession.currentTrip = {
            startTime: new Date(),
            type: getRandomTripType(),
            distance: 0
        };
        
        // Update button text
        if (startTrackingBtn) {
            startTrackingBtn.textContent = 'Stop Tracking';
            startTrackingBtn.classList.add('tracking');
        }
        
        showNotification('Trip tracking started! We\'re now recording your eco-friendly journey.', 'success');
        
        // Simulate trip progress
        simulateTripProgress();
    }
    
    function stopTracking() {
        if (!currentUserSession.isTracking) return;
        
        const trip = currentUserSession.currentTrip;
        const duration = (new Date() - trip.startTime) / 1000 / 60; // in minutes
        const earnedPoints = calculatePoints(trip.type, trip.distance);
        
        // Update user data
        userData.points += earnedPoints;
        userData.totalDistance += trip.distance;
        userData.co2Saved += calculateCO2Saved(trip.type, trip.distance);
        
        userData.tripHistory.unshift({
            date: formatDate(new Date()),
            type: trip.type,
            distance: trip.distance,
            points: earnedPoints
        });
        
        // Reset tracking state
        currentUserSession.isTracking = false;
        currentUserSession.currentTrip = null;
        
        // Update button text
        if (startTrackingBtn) {
            startTrackingBtn.textContent = 'Start Tracking';
            startTrackingBtn.classList.remove('tracking');
        }
        
        showNotification(`Trip completed! You earned ${earnedPoints} points for traveling ${trip.distance.toFixed(1)} km by ${formatTripType(trip.type)}.`, 'success');
    }
    
    function simulateTripProgress() {
        if (!currentUserSession.isTracking) return;
        
        // Simulate distance traveled (0.1 to 0.5 km per interval)
        const distanceInterval = Math.random() * 0.4 + 0.1;
        currentUserSession.currentTrip.distance += distanceInterval;
        
        // Continue simulation
        setTimeout(simulateTripProgress, 3000);
    }
    
    function getRandomTripType() {
        const types = ['walking', 'biking', 'public_transport'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    function formatTripType(type) {
        switch (type) {
            case 'walking': return 'walking';
            case 'biking': return 'biking';
            case 'public_transport': return 'public transport';
            default: return type;
        }
    }
    
    function calculatePoints(type, distance) {
        switch (type) {
            case 'walking': return Math.round(distance * 10);
            case 'biking': return Math.round(distance * 6);
            case 'public_transport': return Math.round(distance * 2);
            default: return 0;
        }
    }
    
    function calculateCO2Saved(type, distance) {
        // Average car emits 120g CO2 per km
        // Return kg of CO2 saved
        return distance * 0.12;
    }
    
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // ===== UI HELPERS =====
    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            body.appendChild(container);
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
    }
    
    // Show login modal
    function showLoginModal(message) {
        // Create modal if it doesn't exist
        if (!document.querySelector('.modal-container')) {
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            modalHeader.innerHTML = `
                <h3>Sign In</h3>
                <button class="modal-close">&times;</button>
            `;
            
            const modalBody = document.createElement('div');
            modalBody.className = 'modal-body';
            modalBody.innerHTML = `
                <p class="modal-message">${message}</p>
                <form class="login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Your email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Your password" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Sign In</button>
                        <button type="button" class="btn btn-outline">Create Account</button>
                    </div>
                </form>
                <div class="social-login">
                    <p>Or sign in with</p>
                    <div class="social-buttons">
                        <button class="social-btn google"><i class="fab fa-google"></i> Google</button>
                        <button class="social-btn facebook"><i class="fab fa-facebook-f"></i> Facebook</button>
                    </div>
                </div>
            `;
            
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalContainer.appendChild(modalContent);
            body.appendChild(modalContainer);
            
            // Add event listeners for modal
            const closeBtn = modalContainer.querySelector('.modal-close');
            closeBtn.addEventListener('click', function() {
                closeModal(modalContainer);
            });
            
            const loginForm = modalContainer.querySelector('.login-form');
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simulate login
                currentUserSession.isLoggedIn = true;
                closeModal(modalContainer);
                showNotification('You have successfully logged in. Happy eco-traveling!', 'success');
            });
            
            // Close modal when clicking outside the content
            modalContainer.addEventListener('click', function(e) {
                if (e.target === modalContainer) {
                    closeModal(modalContainer);
                }
            });
            
            // Simulate social login
            const socialButtons = modalContainer.querySelectorAll('.social-btn');
            socialButtons.forEach(button => {
                button.addEventListener('click', function() {
                    currentUserSession.isLoggedIn = true;
                    closeModal(modalContainer);
                    showNotification('You have successfully logged in. Happy eco-traveling!', 'success');
                });
            });
            
            // Prevent scrolling when modal is open
            body.style.overflow = 'hidden';
            
            // Show modal with animation
            setTimeout(() => {
                modalContainer.classList.add('active');
            }, 10);
        }
    }
    
    function closeModal(modalContainer) {
        modalContainer.classList.remove('active');
        
        setTimeout(() => {
            body.removeChild(modalContainer);
            body.style.overflow = '';
        }, 300);
    }
    
    // ===== NEWSLETTER SUBSCRIPTION =====
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // ===== SMOOTH SCROLLING =====
    const navbarLinks = document.querySelectorAll('.navbar a, .footer a');
    
    navbarLinks.forEach(link => {
        if (link.hash) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId.startsWith('#') && targetId.length > 1) {
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        
                        const navbarHeight = document.querySelector('.navbar').offsetHeight;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });
    
    // ===== SCROLL ANIMATIONS =====
    // Add CSS class to elements as they scroll into view
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .step, .reward-card, .testimonial');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('animate');
            }
        });
    }
    
    // Initial check on page load
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);

    // ===== INITIALIZE DYNAMIC CSS =====
    function addDynamicStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Mobile Navigation Styles */
            .mobile-nav {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 2000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .mobile-nav.open {
                opacity: 1;
                visibility: visible;
            }
            
            .mobile-nav-content {
                position: absolute;
                top: 0;
                right: 0;
                width: 80%;
                max-width: 320px;
                height: 100%;
                background-color: var(--card-bg);
                padding: var(--spacing-lg);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xl);
            }
            
            .mobile-nav.open .mobile-nav-content {
                transform: translateX(0);
            }
            
            .close-btn {
                position: absolute;
                top: var(--spacing-md);
                right: var(--spacing-md);
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--dark);
            }
            
            .mobile-nav .nav-links ul {
                flex-direction: column;
                gap: var(--spacing-md);
            }
            
            .mobile-nav .auth-buttons {
                flex-direction: column;
                gap: var(--spacing-md);
            }

            /* Notification Styles */
            .notification-container {
                position: fixed;
                bottom: var(--spacing-lg);
                right: var(--spacing-lg);
                z-index: 1500;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-sm);
                max-width: 320px;
            }
            
            .notification {
                padding: var(--spacing-md);
                border-radius: var(--border-radius-md);
                background-color: var(--card-bg);
                box-shadow: var(--shadow-md);
                position: relative;
                padding-right: var(--spacing-xl);
                animation: slideIn 0.3s ease forwards;
            }
            
            .notification.info {
                border-left: 4px solid var(--primary);
            }
            
            .notification.success {
                border-left: 4px solid #72cc50;
            }
            
            .notification.error {
                border-left: 4px solid var(--secondary);
            }
            
            .notification-close {
                position: absolute;
                top: var(--spacing-xs);
                right: var(--spacing-xs);
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: var(--muted);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            /* Modal Styles */
            .modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .modal-container.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background-color: var(--card-bg);
                border-radius: var(--border-radius-md);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .modal-container.active .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                padding: var(--spacing-md) var(--spacing-lg);
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin-bottom: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--muted);
            }
            
            .modal-body {
                padding: var(--spacing-lg);
            }
            
            .modal-message {
                color: var(--dark);
                margin-bottom: var(--spacing-lg);
            }
            
            .form-group {
                margin-bottom: var(--spacing-md);
            }
            
            .form-group label {
                display: block;
                margin-bottom: var(--spacing-xs);
                color: var(--dark);
                font-weight: 500;
            }
            
            .form-group input {
                width: 100%;
                padding: var(--spacing-md);
                border: 1px solid var(--border);
                border-radius: var(--border-radius-md);
                font-family: var(--body-font);
                font-size: 1rem;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            .form-actions {
                display: flex;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-lg);
            }
            
            .form-actions .btn {
                flex: 1;
            }
            
            .social-login {
                text-align: center;
                border-top: 1px solid var(--border);
                padding-top: var(--spacing-lg);
            }
            
            .social-login p {
                margin-bottom: var(--spacing-md);
                color: var(--muted);
            }
            
            .social-buttons {
                display: flex;
                gap: var(--spacing-md);
            }
            
            .social-btn {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-md);
                border: none;
                border-radius: var(--border-radius-md);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
                font-family: var(--body-font);
                font-weight: 500;
                transition: var(--transition-normal);
            }
            
            .social-btn.google {
                background-color: #f2f2f2;
                color: #757575;
            }
            
            .social-btn.facebook {
                background-color: #3b5998;
                color: white;
            }
            
            .social-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }

            /* Animation for elements on scroll */
            .feature-card, .step, .reward-card, .testimonial {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .feature-card.animate, .step.animate, .reward-card.animate, .testimonial.animate {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Tracking button styles */
            .btn.tracking {
                background-color: var(--accent);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 211, 182, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(255, 211, 182, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 211, 182, 0);
                }
            }
            
            /* Redeemed button style */
            .btn.redeemed {
                background-color: var(--muted);
                cursor: default;
                opacity: 0.7;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Add dynamic styles to the page
    addDynamicStyles();
});
