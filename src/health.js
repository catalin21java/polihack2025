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

    // ===== GOOGLE FIT INTEGRATION =====
    // Initialize the health device connection button
    initializeHealthConnect();

    function initializeHealthConnect() {
        const connectBtn = document.querySelector('.connect-health-btn .btn');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                showNotification('Connecting to Google Fit...', 'info');
                connectToGoogleFit();
            });
        }
    }

    // Google Fit connection
    function connectToGoogleFit() {
        try {
            // Client configuration from the JSON provided
            const clientConfig = {
                client_id: "969352522616-cl4frjavmmo7bufifaraae5j7fmqpqhu.apps.googleusercontent.com",
                project_id: "home-ixa1vw",
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_secret: "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",
                redirect_uris: ["http://127.0.0.1:5500/callback.html"]
            };
            
            // Google Fit OAuth scopes - using only the most basic ones that don't require verification
            const scopes = [
                'https://www.googleapis.com/auth/fitness.activity.read',
                'https://www.googleapis.com/auth/fitness.body.read'
            ];
            
            // Use the exact redirect URI from the client configuration
            const redirectUri = clientConfig.redirect_uris[0];
            
            console.log('[GoogleFit] Using redirect URI:', redirectUri);
            
            // Generate a random state parameter for security
            const state = Math.random().toString(36).substring(2);
            localStorage.setItem('oauthState', state);
            console.log('[GoogleFit] Generated state parameter:', state);
            
            // Build the authorization URL using the auth_uri from the config
            const authUrl = clientConfig.auth_uri + '?' +
                'client_id=' + encodeURIComponent(clientConfig.client_id) +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&response_type=code' +
                '&state=' + encodeURIComponent(state) +
                '&scope=' + encodeURIComponent(scopes.join(' ')) +
                '&access_type=offline' +
                '&prompt=consent';
            
            console.log('[GoogleFit] Opening authorization URL:', authUrl);
            
            // Open in a new window
            const authWindow = window.open(authUrl, 'googleFitAuth', 'width=600,height=600');
            if (!authWindow) {
                showNotification('Popup blocked! Please allow popups and try again.', 'error');
                console.error('[GoogleFit] Popup was blocked');
                return;
            }
            
            // Set up message listener to receive OAuth response
            const messageListener = function(event) {
                if (event.origin !== window.location.origin) {
                    console.log('[GoogleFit] Ignored message from origin:', event.origin);
                    return;
                }
                
                console.log('[GoogleFit] Received message:', event.data);
                
                if (event.data.type === 'google_fit_auth') {
                    // Remove the event listener to avoid duplicates
                    window.removeEventListener('message', messageListener);
                    
                    authWindow.close();
                    
                    if (event.data.error) {
                        showNotification('Authentication error: ' + event.data.error, 'error');
                        console.error('[GoogleFit] Auth error:', event.data.error);
                        return;
                    }
                    
                    if (event.data.code) {
                        showNotification('Authorization successful, exchanging code for token...', 'info');
                        console.log('[GoogleFit] Got authorization code, exchanging for token');
                        
                        // Exchange code for token
                        exchangeCodeForToken(event.data.code, redirectUri)
                            .then(token => {
                                // Save token in localStorage for future requests
                                localStorage.setItem('googleFitToken', token);
                                console.log('[GoogleFit] Token saved successfully');
                                
                                // Fetch user's health data
                                fetchGoogleFitData(token);
                            })
                            .catch(error => {
                                showNotification('Failed to authenticate with Google Fit: ' + error.message, 'error');
                                console.error('[GoogleFit] Token exchange error:', error);
                            });
                    } else {
                        showNotification('Google Fit authorization was denied', 'error');
                        console.error('[GoogleFit] No code received in callback');
                    }
                }
            };
            
            window.addEventListener('message', messageListener, false);
            console.log('[GoogleFit] Message listener set up');
        } catch (error) {
            console.error('[GoogleFit] Error initiating OAuth flow:', error);
            showNotification('Error connecting to Google Fit: ' + error.message, 'error');
        }
    }

    // Exchange authorization code for token
    async function exchangeCodeForToken(code, redirectUri) {
        console.log('[GoogleFit] Exchanging code for token');
        
        // Client configuration from the JSON
        const clientConfig = {
            client_id: "969352522616-cl4frjavmmo7bufifaraae5j7fmqpqhu.apps.googleusercontent.com",
            project_id: "home-ixa1vw",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_secret: "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",
            redirect_uris: ["http://127.0.0.1:5500/callback.html"]
        };
        
        try {
            console.log('[GoogleFit] Preparing to make token exchange request');
            
            // Try direct token exchange first if the app is running on a secure origin (HTTPS or localhost)
            if (window.location.protocol === 'https:' || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1') {
                
                console.log('[GoogleFit] Attempting direct token exchange');
                
                try {
                    const tokenResponse = await fetch(clientConfig.token_uri, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            'code': code,
                            'client_id': clientConfig.client_id,
                            'client_secret': clientConfig.client_secret,
                            'redirect_uri': redirectUri,
                            'grant_type': 'authorization_code'
                        })
                    });
                    
                    if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json();
                        console.log('[GoogleFit] Direct token exchange successful');
                        return tokenData.access_token;
                    } else {
                        const errorText = await tokenResponse.text();
                        console.error('[GoogleFit] Direct token exchange failed:', errorText);
                        // Fall through to backend exchange
                    }
                } catch (directError) {
                    console.error('[GoogleFit] Direct token exchange error:', directError);
                    // Fall through to backend exchange
                }
            }
            
            // Fallback to backend token exchange
            console.log('[GoogleFit] Attempting token exchange via backend');
            
            const response = await fetch('token-exchange.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'code': code,
                    'redirect_uri': redirectUri,
                    'grant_type': 'authorization_code',
                    'client_id': clientConfig.client_id,
                    'client_secret': clientConfig.client_secret
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[GoogleFit] Backend token exchange failed:', errorText);
                throw new Error('Token exchange failed: ' + response.status);
            }
            
            const data = await response.json();
            console.log('[GoogleFit] Token exchange successful via backend');
            return data.access_token;
        } catch (error) {
            console.error('[GoogleFit] Token exchange error:', error);
            
            // For demo/testing purposes, return a simulated token
            console.log('[GoogleFit] Using simulated token for demo purposes');
            showNotification('Using simulated token for demo purposes', 'info');
            return 'simulated_google_fit_token';
        }
    }

    // Fetch health data from Google Fit API
    async function fetchGoogleFitData(token) {
        showNotification('Fetching your health data from Google Fit...', 'info');
        
        try {
            // Set up date ranges
            const now = new Date();
            const endTimeMillis = now.getTime();
            const startTimeMillis = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime(); // Last 7 days
            const dayMillis = 24 * 60 * 60 * 1000;
            
            console.log('[GoogleFit] Fetching data from', new Date(startTimeMillis).toISOString(), 'to', new Date(endTimeMillis).toISOString());
            
            // Fetch step count data
            const stepsResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aggregateBy: [{
                        dataTypeName: 'com.google.step_count.delta',
                        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
                    }],
                    bucketByTime: { durationMillis: dayMillis },
                    startTimeMillis: startTimeMillis,
                    endTimeMillis: endTimeMillis
                })
            });
            
            if (!stepsResponse.ok) {
                throw new Error(`Failed to fetch step data: ${stepsResponse.status} ${stepsResponse.statusText}`);
            }
            
            const stepsData = await stepsResponse.json();
            console.log('[GoogleFit] Steps data:', stepsData);
            
            // Fetch calories data
            const caloriesResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aggregateBy: [{
                        dataTypeName: 'com.google.calories.expended',
                        dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
                    }],
                    bucketByTime: { durationMillis: dayMillis },
                    startTimeMillis: startTimeMillis,
                    endTimeMillis: endTimeMillis
                })
            });
            
            if (!caloriesResponse.ok) {
                throw new Error(`Failed to fetch calories data: ${caloriesResponse.status} ${caloriesResponse.statusText}`);
            }
            
            const caloriesData = await caloriesResponse.json();
            console.log('[GoogleFit] Calories data:', caloriesData);
            
            // Fetch active minutes data (activity segments)
            const activityResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aggregateBy: [{
                        dataTypeName: 'com.google.activity.segment'
                    }],
                    bucketByTime: { durationMillis: dayMillis },
                    startTimeMillis: startTimeMillis,
                    endTimeMillis: endTimeMillis
                })
            });
            
            if (!activityResponse.ok) {
                throw new Error(`Failed to fetch activity data: ${activityResponse.status} ${activityResponse.statusText}`);
            }
            
            const activityData = await activityResponse.json();
            console.log('[GoogleFit] Activity data:', activityData);
            
            // Parse the response data
            const parsedData = parseGoogleFitData(stepsData, caloriesData, activityData);
            
            // Update UI with fetched data
            updateHealthMetrics(parsedData);
            
            // Update the connect button to show connected state
            const connectBtn = document.querySelector('.connect-health-btn .btn');
            if (connectBtn) {
                connectBtn.textContent = 'Connected to Google Fit';
                connectBtn.classList.add('connected');
            }
            
            showNotification('Successfully connected to Google Fit!', 'success');
        } catch (error) {
            console.error('[GoogleFit] Error fetching Google Fit data:', error);
            showNotification('Failed to fetch health data: ' + error.message, 'error');
            
            // Fallback to simulated data
            console.log('[GoogleFit] Using simulated data as fallback');
            const simulatedData = getSimulatedHealthData();
            updateHealthMetrics(simulatedData);
        }
    }

    // Parse Google Fit API response data
    function parseGoogleFitData(stepsData, caloriesData, activityData) {
        try {
            // Initialize the result data structure
            const result = {
                steps: 0,
                activeMinutes: 0,
                caloriesBurned: 0,
                dailyActivity: {
                    days: [],
                    steps: [],
                    activeMinutes: [],
                    calories: []
                }
            };
            
            // Parse daily data
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Process steps data
            let totalSteps = 0;
            if (stepsData && stepsData.bucket) {
                stepsData.bucket.forEach(bucket => {
                    const bucketDate = new Date(parseInt(bucket.startTimeMillis));
                    const formattedDate = bucketDate.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    let dailySteps = 0;
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            if (point.value && point.value.length > 0) {
                                dailySteps += point.value[0].intVal || 0;
                            }
                        });
                    }
                    
                    // Add to total if today
                    const isToday = bucketDate.getDate() === today.getDate() && 
                                   bucketDate.getMonth() === today.getMonth() && 
                                   bucketDate.getFullYear() === today.getFullYear();
                    
                    if (isToday) {
                        totalSteps = dailySteps;
                    }
                    
                    // Add to daily activity
                    result.dailyActivity.days.push(formattedDate);
                    result.dailyActivity.steps.push(dailySteps);
                });
            }
            
            // Set total steps
            result.steps = totalSteps;
            
            // Process calories data
            let totalCalories = 0;
            if (caloriesData && caloriesData.bucket) {
                caloriesData.bucket.forEach((bucket, index) => {
                    let dailyCalories = 0;
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            if (point.value && point.value.length > 0) {
                                dailyCalories += Math.round(point.value[0].fpVal || 0);
                            }
                        });
                    }
                    
                    // Add to total if today
                    const bucketDate = new Date(parseInt(bucket.startTimeMillis));
                    const isToday = bucketDate.getDate() === today.getDate() && 
                                   bucketDate.getMonth() === today.getMonth() && 
                                   bucketDate.getFullYear() === today.getFullYear();
                    
                    if (isToday) {
                        totalCalories = dailyCalories;
                    }
                    
                    // Add to daily activity
                    if (result.dailyActivity.calories.length <= index) {
                        result.dailyActivity.calories.push(dailyCalories);
                    } else {
                        result.dailyActivity.calories[index] = dailyCalories;
                    }
                });
            }
            
            // Set total calories
            result.caloriesBurned = totalCalories;
            
            // Process activity data to calculate active minutes
            let totalActiveMinutes = 0;
            if (activityData && activityData.bucket) {
                // Initialize activeMinutes array if needed
                while (result.dailyActivity.activeMinutes.length < result.dailyActivity.days.length) {
                    result.dailyActivity.activeMinutes.push(0);
                }
                
                activityData.bucket.forEach((bucket, index) => {
                    let dailyActiveMinutes = 0;
                    
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            // Exclude inactive activities like still (3) and unknown (4)
                            const activityType = point.value && point.value.length > 0 ? point.value[0].intVal : 0;
                            if (activityType !== 3 && activityType !== 4 && point.startTimeNanos && point.endTimeNanos) {
                                // Calculate duration in minutes
                                const durationMillis = (parseInt(point.endTimeNanos) - parseInt(point.startTimeNanos)) / 1000000;
                                const durationMinutes = Math.round(durationMillis / 60000);
                                dailyActiveMinutes += durationMinutes;
                            }
                        });
                    }
                    
                    // Add to total if today
                    const bucketDate = new Date(parseInt(bucket.startTimeMillis));
                    const isToday = bucketDate.getDate() === today.getDate() && 
                                   bucketDate.getMonth() === today.getMonth() && 
                                   bucketDate.getFullYear() === today.getFullYear();
                    
                    if (isToday) {
                        totalActiveMinutes = dailyActiveMinutes;
                    }
                    
                    // Add to daily activity
                    if (index < result.dailyActivity.activeMinutes.length) {
                        result.dailyActivity.activeMinutes[index] = dailyActiveMinutes;
                    }
                });
            }
            
            // Set total active minutes
            result.activeMinutes = totalActiveMinutes;
            
            // Fill in simulated health data for properties we couldn't fetch
            const simulatedData = getSimulatedHealthData();
            result.heartRate = simulatedData.heartRate;
            result.sleepDuration = simulatedData.sleepDuration;
            
            console.log('[GoogleFit] Parsed data:', result);
            return result;
        } catch (error) {
            console.error('[GoogleFit] Error parsing Google Fit data:', error);
            return getSimulatedHealthData();
        }
    }

    // Get simulated health data (fallback)
    function getSimulatedHealthData() {
        return {
            steps: 12478,
            activeMinutes: 65,
            caloriesBurned: 2134,
            sleepDuration: {
                hours: 6,
                minutes: 45
            },
            heartRate: {
                current: 72,
                resting: 64,
                values: [62, 64, 68, 70, 74, 78, 72, 68, 66, 64]
            },
            dailyActivity: {
                days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                steps: [8542, 9321, 10458, 12478, 9876, 7542, 11245],
                activeMinutes: [45, 52, 58, 65, 48, 40, 62],
                calories: [1890, 1950, 2050, 2134, 1920, 1760, 2080]
            }
        };
    }

    // Update UI with health data
    function updateHealthMetrics(data) {
        // Update steps
        const stepsElement = document.querySelector('.health-card:nth-child(1) .health-details h3');
        if (stepsElement && data.steps) {
            stepsElement.textContent = data.steps.toLocaleString();
        }
        
        // Update active minutes
        const activeMinElement = document.querySelector('.health-card:nth-child(2) .health-details h3');
        if (activeMinElement && data.activeMinutes) {
            activeMinElement.textContent = data.activeMinutes + ' min';
        }
        
        // Update calories burned
        const caloriesElement = document.querySelector('.health-card:nth-child(3) .health-details h3');
        if (caloriesElement && data.caloriesBurned) {
            caloriesElement.textContent = data.caloriesBurned.toLocaleString();
        }
        
        // Update sleep duration
        const sleepElement = document.querySelector('.health-card:nth-child(4) .health-details h3');
        if (sleepElement && data.sleepDuration) {
            sleepElement.textContent = `${data.sleepDuration.hours}h ${data.sleepDuration.minutes}m`;
        }
        
        // Update heart rate
        const hrElement = document.querySelector('.current-hr');
        if (hrElement && data.heartRate && data.heartRate.current) {
            hrElement.innerHTML = `<i class="fas fa-heart"></i> ${data.heartRate.current} bpm`;
        }
        
        // Update activity chart if it exists
        if (activityChart && data.dailyActivity) {
            activityChart.data.labels = data.dailyActivity.days;
            activityChart.data.datasets[0].data = data.dailyActivity.steps;
            activityChart.data.datasets[1].data = data.dailyActivity.activeMinutes;
            activityChart.data.datasets[2].data = data.dailyActivity.calories.map(cal => cal / 25);
            activityChart.update();
        }
        
        // Update goal progress
        const stepsGoalElement = document.querySelector('.goal-item:nth-child(1) .goal-stats span:first-child');
        if (stepsGoalElement && data.steps) {
            const stepsGoal = 10000; // Default goal
            const percentage = Math.min(Math.round((data.steps / stepsGoal) * 100), 100);
            
            stepsGoalElement.textContent = `${data.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} steps`;
            
            // Update progress bar
            const progressBar = document.querySelector('.goal-item:nth-child(1) .progress-fill');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            
            // Update percentage text
            const percentText = document.querySelector('.goal-item:nth-child(1) .goal-stats span:last-child');
            if (percentText) {
                percentText.textContent = `${percentage}%`;
            }
        }
    }

    // ===== HEALTH DATA =====
    // Simulated user health data
    const healthData = {
        userInfo: {
            name: "John Packer",
            age: 34,
            gender: "Male",
            height: 175, // cm
            weight: 68.5, // kg
            bmi: 22.4,
            bodyFat: 18.2, // percentage
        },
        activitySummary: {
            dailySteps: 8241,
            stepsGoal: 10000,
            stepsChange: 12, // percentage
            activeMinutes: 47,
            activeMinutesGoal: 50,
            activeMinutesChange: 8, // percentage
            caloriesBurned: 1876,
            caloriesBurnedGoal: 2000,
            caloriesBurnedChange: 2, // percentage
            sleepDuration: "7h 15m",
            sleepGoal: "8h 00m",
            sleepChange: -5, // percentage
        },
        bodyComposition: {
            muscle: 48.3, // percentage
            fat: 18.2, // percentage
            bone: 12.5, // percentage
            water: 21.0, // percentage
        },
        activityData: {
            // Last 7 days of activity data
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            steps: [6520, 7843, 5932, 8102, 9678, 10432, 8241],
            activeMinutes: [32, 45, 28, 52, 63, 58, 47],
            calories: [1450, 1675, 1320, 1780, 2150, 2300, 1876],
        },
        heartRateData: {
            current: 68,
            resting: 62,
            // Heart rate data throughout the day (hourly)
            hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            values: [63, 61, 59, 58, 60, 62, 70, 84, 90, 88, 86, 92, 97, 94, 90, 88, 96, 102, 88, 76, 72, 68, 65, 64],
            zones: {
                resting: { min: 60, max: 65 },
                fatBurn: { min: 98, max: 117 },
                cardio: { min: 118, max: 137 },
                peak: { min: 138, max: 157 }
            }
        },
        sleepData: {
            score: 82,
            durationTotal: "7h 15m",
            // Sleep stages in minutes
            stages: {
                deep: 105, // 1h 45m
                light: 245, // 4h 05m
                rem: 85,   // 1h 25m
                awake: 20  // 0h 20m
            },
            // Sleep data for the last 7 days (hours)
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            hours: [7.5, 6.8, 7.2, 8.1, 7.8, 8.5, 7.25]
        },
        nutritionData: {
            caloriesConsumed: 1840,
            caloriesGoal: 2300,
            caloriesRemaining: 460,
            macros: {
                protein: 96, // grams
                carbs: 215, // grams
                fats: 64, // grams
            },
            // Nutrition data for the last 7 days (calories)
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            calories: [1920, 2140, 1760, 1890, 2210, 2320, 1840]
        },
        waterIntake: {
            current: 1.4, // liters
            goal: 2.0, // liters
            percentage: 70,
            entries: [
                { time: "8:30 AM", amount: 250 }, // ml
                { time: "10:45 AM", amount: 330 },
                { time: "1:15 PM", amount: 500 },
                { time: "4:00 PM", amount: 330 }
            ]
        }
    };

    // ===== INITIALIZE CHARTS =====
    
    // Body Composition Chart
    const bodyCompositionChartEl = document.getElementById('bodyCompositionChart');
    let bodyCompositionChart;
    
    if (bodyCompositionChartEl) {
        const ctx = bodyCompositionChartEl.getContext('2d');
        
        bodyCompositionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Muscle', 'Fat', 'Bone', 'Water'],
                datasets: [{
                    data: [
                        healthData.bodyComposition.muscle,
                        healthData.bodyComposition.fat,
                        healthData.bodyComposition.bone,
                        healthData.bodyComposition.water
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--primary-dark'),
                        getComputedStyle(document.documentElement).getPropertyValue('--secondary'),
                        getComputedStyle(document.documentElement).getPropertyValue('--accent'),
                        getComputedStyle(document.documentElement).getPropertyValue('--info')
                    ],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 10,
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Activity Chart
    const activityChartEl = document.getElementById('activityChart');
    let activityChart;
    
    if (activityChartEl) {
        const ctx = activityChartEl.getContext('2d');
        
        activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: healthData.activityData.days,
                datasets: [
                    {
                        label: 'Steps',
                        data: healthData.activityData.steps,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--steps'),
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--steps'),
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Active Minutes',
                        data: healthData.activityData.activeMinutes,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--active-mins'),
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--active-mins'),
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Calories',
                        data: healthData.activityData.calories.map(cal => cal / 25), // Scale down to fit on the same chart
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--calories'),
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--calories'),
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.raw;
                                
                                if (label === 'Calories') {
                                    return ` ${label}: ${value * 25} kcal`;
                                } else if (label === 'Steps') {
                                    return ` ${label}: ${value} steps`;
                                } else {
                                    return ` ${label}: ${value} min`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grace: '10%',
                        grid: {
                            borderDash: [2, 2]
                        },
                        ticks: {
                            callback: function(value) {
                                if (value === 0) return '0';
                                if (value === 100) return '10K steps';
                                if (value === 60) return '60 min';
                                return '';
                            }
                        }
                    }
                }
            }
        });
        
        // Period selector buttons
        const periodBtns = document.querySelectorAll('.activity-stats .card-actions .btn-sm');
        
        periodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                periodBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Future enhancement: Update chart data based on selected period
                // For now, we'll just show the same data
            });
        });
    }

    // Heart Rate Chart
    const heartRateChartEl = document.getElementById('heartRateChart');
    let heartRateChart;
    
    if (heartRateChartEl) {
        const ctx = heartRateChartEl.getContext('2d');
        
        heartRateChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: healthData.heartRateData.hours.map(hour => `${hour}:00`),
                datasets: [
                    {
                        label: 'Heart Rate',
                        data: healthData.heartRateData.values,
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--danger'),
                        backgroundColor: 'rgba(255, 138, 138, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` Heart Rate: ${context.raw} bpm`;
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
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        suggestedMin: 50,
                        suggestedMax: 160,
                        grid: {
                            borderDash: [2, 2]
                        }
                    }
                }
            }
        });
    }

    // Sleep Chart
    const sleepChartEl = document.getElementById('sleepChart');
    let sleepChart;
    
    if (sleepChartEl) {
        const ctx = sleepChartEl.getContext('2d');
        
        // Calculate percentage of each sleep stage
        const totalSleepMinutes = Object.values(healthData.sleepData.stages).reduce((a, b) => a + b, 0);
        const sleepStages = [
            (healthData.sleepData.stages.deep / totalSleepMinutes) * 100,
            (healthData.sleepData.stages.light / totalSleepMinutes) * 100,
            (healthData.sleepData.stages.rem / totalSleepMinutes) * 100,
            (healthData.sleepData.stages.awake / totalSleepMinutes) * 100
        ];
        
        sleepChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: healthData.sleepData.days,
                datasets: [
                    {
                        label: 'Sleep Duration',
                        data: healthData.sleepData.hours,
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--sleep'),
                        borderRadius: 6,
                        barThickness: 12
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const hours = Math.floor(context.raw);
                                const minutes = Math.round((context.raw - hours) * 60);
                                return ` Sleep Duration: ${hours}h ${minutes}m`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        suggestedMin: 0,
                        suggestedMax: 10,
                        grid: {
                            borderDash: [2, 2]
                        },
                        ticks: {
                            callback: function(value) {
                                return `${value}h`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Macros Chart (Nutrition)
    const macrosChartEl = document.getElementById('macrosChart');
    let macrosChart;
    
    if (macrosChartEl) {
        const ctx = macrosChartEl.getContext('2d');
        
        // Calculate percentage of each macro
        const totalMacros = Object.values(healthData.nutritionData.macros).reduce((a, b) => a + b, 0);
        
        macrosChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbs', 'Fats'],
                datasets: [{
                    data: [
                        healthData.nutritionData.macros.protein,
                        healthData.nutritionData.macros.carbs,
                        healthData.nutritionData.macros.fats
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--protein'),
                        getComputedStyle(document.documentElement).getPropertyValue('--carbs'),
                        getComputedStyle(document.documentElement).getPropertyValue('--fats')
                    ],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
                        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--dark'),
                        bodyColor: getComputedStyle(document.documentElement).getPropertyValue('--muted'),
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border'),
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const percentage = Math.round((value / totalMacros) * 100);
                                return ` ${context.label}: ${value}g (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== WATER INTAKE TRACKING =====
    const waterLevel = document.querySelector('.water-level');
    
    if (waterLevel) {
        // Set the height of the water level based on the percentage
        waterLevel.style.height = `${healthData.waterIntake.percentage}%`;
        
        // Add some animation for better UX
        setTimeout(() => {
            waterLevel.style.transition = 'height 1.5s cubic-bezier(0.2, 0.8, 0.2, 1.0)';
        }, 500);
    }

    // ===== ADD WATER BUTTON =====
    const addWaterBtn = document.querySelector('.water-intake .btn-sm');
    
    if (addWaterBtn) {
        addWaterBtn.addEventListener('click', function() {
            // For demo purposes, just increase water level by 10%
            const currentValue = parseFloat(waterLevel.style.height || healthData.waterIntake.percentage);
            const newValue = Math.min(currentValue + 10, 100);
            
            waterLevel.style.height = `${newValue}%`;
            
            // Update the displayed amount
            const waterGoalText = document.querySelector('.water-goal-text h3');
            if (waterGoalText) {
                const newAmount = (healthData.waterIntake.goal * newValue) / 100;
                waterGoalText.textContent = `${newAmount.toFixed(1)}L / ${healthData.waterIntake.goal.toFixed(1)}L`;
            }
            
            const waterPercentage = document.querySelector('.water-goal-text p');
            if (waterPercentage) {
                waterPercentage.textContent = `${newValue}% of daily goal`;
            }
            
            // Add a new entry to the water history
            const waterHistory = document.querySelector('.water-history');
            if (waterHistory) {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const timeString = `${hours}:${minutes}`;
                
                const entry = document.createElement('div');
                entry.className = 'water-time-entry';
                entry.innerHTML = `
                    <div class="entry-time">${timeString}</div>
                    <div class="entry-amount">250ml</div>
                `;
                
                waterHistory.prepend(entry);
                
                // Add animation
                entry.style.opacity = '0';
                entry.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    entry.style.transition = 'all 0.3s ease';
                    entry.style.opacity = '1';
                    entry.style.transform = 'translateY(0)';
                }, 10);
            }
            
            showNotification('Added 250ml of water to your daily intake!', 'info');
        });
    }

    // ===== UTILITY FUNCTIONS =====
    // Show notification
    function showNotification(message, type = 'success') {
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
                
                .connect-health-btn .btn.connected {
                    background-color: var(--success);
                    color: white;
                }
            `;
            
            document.head.appendChild(styleElement);
        }
    }
});
