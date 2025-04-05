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

    // ===== INITIALIZE CHARTS =====
    // Initialize all charts first, to ensure they exist when we update them
    initializeAllCharts();
    
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
            
            // Fetch sleep data if available
            let sleepData = null;
            try {
                const sleepResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        aggregateBy: [{
                            dataTypeName: 'com.google.sleep.segment'
                        }],
                        bucketByTime: { durationMillis: dayMillis },
                        startTimeMillis: startTimeMillis,
                        endTimeMillis: endTimeMillis
                    })
                });
                
                if (sleepResponse.ok) {
                    sleepData = await sleepResponse.json();
                    console.log('[GoogleFit] Sleep data:', sleepData);
                }
            } catch (sleepError) {
                console.warn('[GoogleFit] Sleep data not available:', sleepError);
            }
            
            // Fetch heart rate data if available
            let heartRateData = null;
            try {
                const heartRateResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        aggregateBy: [{
                            dataTypeName: 'com.google.heart_rate.bpm'
                        }],
                        bucketByTime: { durationMillis: dayMillis },
                        startTimeMillis: startTimeMillis,
                        endTimeMillis: endTimeMillis
                    })
                });
                
                if (heartRateResponse.ok) {
                    heartRateData = await heartRateResponse.json();
                    console.log('[GoogleFit] Heart rate data:', heartRateData);
                }
            } catch (heartRateError) {
                console.warn('[GoogleFit] Heart rate data not available:', heartRateError);
            }
            
            // Fetch weight data if available
            let weightData = null;
            try {
                const weightResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        aggregateBy: [{
                            dataTypeName: 'com.google.weight'
                        }],
                        bucketByTime: { durationMillis: dayMillis },
                        startTimeMillis: startTimeMillis,
                        endTimeMillis: endTimeMillis
                    })
                });
                
                if (weightResponse.ok) {
                    weightData = await weightResponse.json();
                    console.log('[GoogleFit] Weight data:', weightData);
                }
            } catch (weightError) {
                console.warn('[GoogleFit] Weight data not available:', weightError);
            }
            
            // Parse the response data
            const parsedData = parseGoogleFitData(stepsData, caloriesData, activityData, sleepData, heartRateData, weightData);
            
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
    function parseGoogleFitData(stepsData, caloriesData, activityData, sleepData, heartRateData, weightData) {
        try {
            // Initialize the result data structure
            const result = {
                steps: 0,
                activeMinutes: 0,
                caloriesBurned: 0,
                sleepDuration: {
                    hours: 0,
                    minutes: 0
                },
                heartRate: {
                    current: 0,
                    resting: 0,
                    values: []
                },
                bodyStats: {
                    weight: 0,
                    height: 175, // Default height in cm (not usually provided by Google Fit)
                    bmi: 0,
                    bodyFat: 0
                },
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
            
            // Process sleep data
            if (sleepData && sleepData.bucket) {
                let totalSleepMillis = 0;
                
                sleepData.bucket.forEach(bucket => {
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            if (point.value && point.value.length > 0 && point.startTimeNanos && point.endTimeNanos) {
                                // Only count actual sleep stages (not awake)
                                const sleepStage = point.value[0].intVal;
                                if (sleepStage >= 1 && sleepStage <= 4) { // Sleep stages
                                    const durationMillis = (parseInt(point.endTimeNanos) - parseInt(point.startTimeNanos)) / 1000000;
                                    totalSleepMillis += durationMillis;
                                }
                            }
                        });
                    }
                });
                
                // Convert milliseconds to hours and minutes
                const totalSleepHours = totalSleepMillis / (60 * 60 * 1000);
                result.sleepDuration.hours = Math.floor(totalSleepHours);
                result.sleepDuration.minutes = Math.round((totalSleepHours - result.sleepDuration.hours) * 60);
            }
            
            // Process heart rate data
            if (heartRateData && heartRateData.bucket) {
                let heartRateValues = [];
                let heartRateSum = 0;
                let heartRateCount = 0;
                
                heartRateData.bucket.forEach(bucket => {
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            if (point.value && point.value.length > 0) {
                                const bpm = Math.round(point.value[0].fpVal);
                                heartRateValues.push(bpm);
                                heartRateSum += bpm;
                                heartRateCount++;
                            }
                        });
                    }
                });
                
                if (heartRateCount > 0) {
                    // Calculate average heart rate as current
                    result.heartRate.current = Math.round(heartRateSum / heartRateCount);
                    
                    // Estimate resting heart rate as the lowest 10% of readings
                    if (heartRateValues.length > 0) {
                        heartRateValues.sort((a, b) => a - b);
                        const lowerBound = Math.floor(heartRateValues.length * 0.1);
                        const lowerValues = heartRateValues.slice(0, Math.max(lowerBound, 1));
                        const restingHr = lowerValues.reduce((sum, val) => sum + val, 0) / lowerValues.length;
                        result.heartRate.resting = Math.round(restingHr);
                    }
                    
                    // Get the 10 most recent heart rate values for chart
                    result.heartRate.values = heartRateValues.slice(-10);
                }
            }
            
            // Process weight data
            if (weightData && weightData.bucket) {
                let latestWeight = 0;
                let latestTimestamp = 0;
                
                weightData.bucket.forEach(bucket => {
                    if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                        bucket.dataset[0].point.forEach(point => {
                            if (point.value && point.value.length > 0 && point.startTimeNanos) {
                                const timestamp = parseInt(point.startTimeNanos);
                                if (timestamp > latestTimestamp) {
                                    latestTimestamp = timestamp;
                                    latestWeight = point.value[0].fpVal;
                                }
                            }
                        });
                    }
                });
                
                if (latestWeight > 0) {
                    result.bodyStats.weight = parseFloat(latestWeight.toFixed(1));
                    
                    // Calculate BMI if we have height
                    if (result.bodyStats.height > 0) {
                        const heightInMeters = result.bodyStats.height / 100;
                        result.bodyStats.bmi = parseFloat((latestWeight / (heightInMeters * heightInMeters)).toFixed(1));
                    }
                }
            }
            
            console.log('[GoogleFit] Parsed data:', result);
            return result;
        } catch (error) {
            console.error('[GoogleFit] Error parsing Google Fit data:', error);
            return getSimulatedHealthData();
        }
    }

    // Update UI with health data
    function updateHealthMetrics(data) {
        try {
            console.log('[GoogleFit] Updating UI with health metrics:', data);
            
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
            
            // Update heart rate if available
            const hrElement = document.querySelector('.current-hr');
            if (hrElement && data.heartRate && data.heartRate.current) {
                hrElement.innerHTML = `<i class="fas fa-heart"></i> ${data.heartRate.current} bpm`;
            }
            
            // Update body stats if available
            if (data.bodyStats) {
                // Weight
                const weightElement = document.querySelector('.stat-item:nth-child(1) .stat-value');
                if (weightElement && data.bodyStats.weight) {
                    weightElement.textContent = `${data.bodyStats.weight} kg`;
                }
                
                // BMI
                const bmiElement = document.querySelector('.stat-item:nth-child(3) .stat-value');
                if (bmiElement && data.bodyStats.bmi) {
                    bmiElement.textContent = data.bodyStats.bmi.toString();
                }
            }
            
            // Update activity chart if it exists and we have daily activity data
            if (window.activityChart && data.dailyActivity) {
                console.log('[GoogleFit] Updating activity chart with data:', data.dailyActivity);
                window.activityChart.data.labels = data.dailyActivity.days;
                window.activityChart.data.datasets[0].data = data.dailyActivity.steps;
                window.activityChart.data.datasets[1].data = data.dailyActivity.activeMinutes;
                window.activityChart.data.datasets[2].data = data.dailyActivity.calories.map(cal => cal / 25); // Scale down calories for chart visibility
                window.activityChart.update();
            } else {
                console.warn('[GoogleFit] Cannot update activity chart: Chart or data not available', {
                    chartExists: !!window.activityChart,
                    dataExists: !!data.dailyActivity
                });
            }
            
            // Update heart rate chart if it exists
            if (window.heartRateChart && data.heartRate && data.heartRate.values.length > 0) {
                console.log('[GoogleFit] Updating heart rate chart with values:', data.heartRate.values);
                const timeLabels = Array.from({ length: data.heartRate.values.length }, (_, i) => 
                    `-${data.heartRate.values.length - i} min`
                );
                
                window.heartRateChart.data.labels = timeLabels;
                window.heartRateChart.data.datasets[0].data = data.heartRate.values;
                window.heartRateChart.update();
            }
            
            // Update goals progress
            updateGoalsProgress(data);
        } catch (err) {
            console.error('[GoogleFit] Error updating health metrics:', err);
            showNotification('Error updating health metrics: ' + err.message, 'error');
        }
    }

    // Update goals progress based on real data
    function updateGoalsProgress(data) {
        // Steps goal progress
        const stepsGoalElement = document.querySelector('.goal-item:nth-child(1)');
        if (stepsGoalElement && data.steps) {
            const stepsGoal = 10000; // Default goal
            const percentage = Math.min(Math.round((data.steps / stepsGoal) * 100), 100);
            
            const progressBar = stepsGoalElement.querySelector('.progress-fill');
            const statsText = stepsGoalElement.querySelector('.goal-stats span:first-child');
            const percentText = stepsGoalElement.querySelector('.goal-stats span:last-child');
            
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (statsText) statsText.textContent = `${data.steps.toLocaleString()} / ${stepsGoal.toLocaleString()} steps`;
            if (percentText) percentText.textContent = `${percentage}%`;
        }
        
        // Active minutes goal progress
        const activeMinGoalElement = document.querySelector('.goal-item:nth-child(3)');
        if (activeMinGoalElement && data.activeMinutes) {
            const activeMinGoal = 50; // Default goal
            const percentage = Math.min(Math.round((data.activeMinutes / activeMinGoal) * 100), 100);
            
            const progressBar = activeMinGoalElement.querySelector('.progress-fill');
            const statsText = activeMinGoalElement.querySelector('.goal-stats span:first-child');
            const percentText = activeMinGoalElement.querySelector('.goal-stats span:last-child');
            
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (statsText) statsText.textContent = `${data.activeMinutes} / ${activeMinGoal} minutes`;
            if (percentText) percentText.textContent = `${percentage}%`;
        }
        
        // Sleep goal progress
        const sleepGoalElement = document.querySelector('.goal-item:nth-child(4)');
        if (sleepGoalElement && data.sleepDuration) {
            const sleepGoalHours = 8; // Default goal in hours
            const sleepDurationHours = data.sleepDuration.hours + (data.sleepDuration.minutes / 60);
            const percentage = Math.min(Math.round((sleepDurationHours / sleepGoalHours) * 100), 100);
            
            const progressBar = sleepGoalElement.querySelector('.progress-fill');
            const statsText = sleepGoalElement.querySelector('.goal-stats span:first-child');
            const percentText = sleepGoalElement.querySelector('.goal-stats span:last-child');
            
            if (progressBar) progressBar.style.width = `${percentage}%`;
            if (statsText) statsText.textContent = `${data.sleepDuration.hours}h ${data.sleepDuration.minutes}m / ${sleepGoalHours}h 00m`;
            if (percentText) percentText.textContent = `${percentage}%`;
        }
    }

    // Get simulated health data (fallback)
    function getSimulatedHealthData() {
        return {
            steps: 8241,
            activeMinutes: 47,
            caloriesBurned: 1876,
            sleepDuration: {
                hours: 7,
                minutes: 15
            },
            heartRate: {
                current: 72,
                resting: 64,
                values: [62, 64, 68, 70, 74, 78, 72, 68, 66, 64]
            },
            bodyStats: {
                weight: 68.5,
                height: 175,
                bmi: 22.4,
                bodyFat: 18.2
            },
            dailyActivity: {
                days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                steps: [8542, 9321, 10458, 8241, 9876, 7542, 11245],
                activeMinutes: [45, 52, 58, 47, 48, 40, 62],
                calories: [1890, 1950, 2050, 1876, 1920, 1760, 2080]
            }
        };
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
    // Initialize all charts once at the beginning
    function initializeAllCharts() {
        console.log('[Charts] Initializing all charts');
        
        // Activity Chart
        const activityChartEl = document.getElementById('activityChart');
        if (activityChartEl) {
            const ctx = activityChartEl.getContext('2d');
            
            window.activityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: 'Steps',
                            data: [8542, 9321, 10458, 8241, 9876, 7542, 11245],
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--steps-color') || '#88d8b0',
                            borderWidth: 0,
                            borderRadius: 4,
                            order: 1
                        },
                        {
                            label: 'Active Minutes',
                            data: [45, 52, 58, 47, 48, 40, 62],
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--active-mins-color') || '#7cd5fa',
                            borderWidth: 0,
                            borderRadius: 4,
                            order: 2
                        },
                        {
                            label: 'Calories',
                            data: [1890/25, 1950/25, 2050/25, 1876/25, 1920/25, 1760/25, 2080/25],
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--calories-color') || '#ff8a8a',
                            borderWidth: 0,
                            borderRadius: 4,
                            order: 3
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
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw;
                                    
                                    if (label === 'Steps') {
                                        return ` Steps: ${Math.round(value).toLocaleString()}`;
                                    } else if (label === 'Active Minutes') {
                                        return ` Active Minutes: ${Math.round(value)} min`;
                                    } else if (label === 'Calories') {
                                        // Multiply back to get actual calories
                                        return ` Calories: ${Math.round(value * 25)} cal`;
                                    }
                                    return ` ${label}: ${value}`;
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
                            grid: {
                                borderDash: [2, 2]
                            },
                            ticks: {
                                callback: function(value, index, values) {
                                    // Show only some ticks to avoid crowding
                                    return value % 50 === 0 ? value : '';
                                }
                            }
                        }
                    }
                }
            });
            console.log('[Charts] Activity chart initialized', window.activityChart);
        }
        
        // Heart Rate Chart
        const heartRateChartEl = document.getElementById('heartRateChart');
        if (heartRateChartEl) {
            const ctx = heartRateChartEl.getContext('2d');
            
            window.heartRateChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['-10 min', '-9 min', '-8 min', '-7 min', '-6 min', '-5 min', '-4 min', '-3 min', '-2 min', '-1 min'],
                    datasets: [{
                        label: 'Heart Rate',
                        data: [62, 64, 68, 70, 74, 78, 72, 68, 66, 64],
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#ff6b6b',
                        pointBorderColor: '#fff',
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
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
                            }
                        },
                        y: {
                            beginAtZero: false,
                            min: 50,
                            max: 100,
                            grid: {
                                borderDash: [2, 2]
                            },
                            ticks: {
                                callback: function(value) {
                                    return `${value} bpm`;
                                }
                            }
                        }
                    }
                }
            });
            console.log('[Charts] Heart rate chart initialized', window.heartRateChart);
        }
        
        // Sleep Chart
        const sleepChartEl = document.getElementById('sleepChart');
        if (sleepChartEl) {
            const ctx = sleepChartEl.getContext('2d');
            
            window.sleepChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Sleep Duration',
                        data: [6.8, 7.2, 6.9, 7.25, 8.1, 7.9, 6.5],
                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#69d1b0',
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
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
        
        // Body Composition Chart
        const bodyCompositionChartEl = document.getElementById('bodyCompositionChart');
        if (bodyCompositionChartEl) {
            const ctx = bodyCompositionChartEl.getContext('2d');
            
            window.bodyCompositionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Muscle', 'Fat', 'Water', 'Other'],
                    datasets: [{
                        data: [36, 18.2, 40, 5.8],
                        backgroundColor: [
                            '#4a6fa5',
                            '#ff8a8a',
                            '#82c4fa',
                            '#ddd'
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
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
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
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
        
        // Macros Chart (Nutrition)
        const macrosChartEl = document.getElementById('macrosChart');
        if (macrosChartEl) {
            const ctx = macrosChartEl.getContext('2d');
            
            // Calculate total for percentage
            const proteinGrams = 96;
            const carbsGrams = 215;
            const fatsGrams = 64;
            const totalMacros = proteinGrams + carbsGrams + fatsGrams;
            
            // Use getPropertyValue or fallback to default colors
            const getColor = (varName, fallback) => {
                let color = getComputedStyle(document.documentElement).getPropertyValue(varName);
                return color ? color.trim() : fallback;
            };
            
            window.macrosChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Protein', 'Carbs', 'Fats'],
                    datasets: [{
                        data: [
                            proteinGrams,
                            carbsGrams,
                            fatsGrams
                        ],
                        backgroundColor: [
                            getColor('--protein', '#4a6fa5'),
                            getColor('--carbs', '#88d8b0'),
                            getColor('--fats', '#ff8a8a')
                        ],
                        borderColor: getColor('--card-bg', 'white'),
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
                            backgroundColor: getColor('--card-bg', 'white'),
                            titleColor: getColor('--text', '#333'),
                            bodyColor: getColor('--muted', '#666'),
                            borderColor: getColor('--border', '#ccc'),
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
