import * as THREE from 'https://cdn.skypack.dev/three@0.131.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.131.1/examples/jsm/controls/OrbitControls';

// Add event listener for the explore button
document.addEventListener('DOMContentLoaded', function() {
    const exploreBtn = document.getElementById('explore-btn');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            // Scroll to the absolute bottom of the page
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
});

// Disable mouse wheel scrolling
document.addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

// Scene
const scene = new THREE.Scene();

// Load background texture
const backgroundTexture = new THREE.TextureLoader().load('images/sky-background.jpeg');
scene.background = backgroundTexture;

// Camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
scene.add( camera );

// Canvas
const canvas = document.querySelector('#canvas');

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});

function setDimentions() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", () => setDimentions());
setDimentions();
document.body.appendChild( renderer.domElement );

// Texture, material
var src0 = 'images/earth-small.jpg';

const texture = new THREE.TextureLoader().load(src0);
const material = new THREE.MeshBasicMaterial({ map: texture });

// Geometry
const geometry = new THREE.SphereBufferGeometry(10, 100, 100);

// Mesh
var globe = new THREE.Mesh( geometry, material );
scene.add( globe );

// City data
const cities = [
  // Existing cities
  {
    name: "New York",
    lat: 40.7128,
    lng: -74.0060,
    info: "New York City is the most populous city in the United States. It is known for its iconic skyline, diverse culture, and as a global hub for finance, art, fashion, and entertainment.",
    url: "https://en.wikipedia.org/wiki/New_York_City"
  },
  {
    name: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    info: "Tokyo is the capital and most populous prefecture of Japan. It has the world's largest metropolitan economy and is a global center of technology, finance, and culture.",
    url: "https://en.wikipedia.org/wiki/Tokyo"
  },
  {
    name: "London",
    lat: 51.5074,
    lng: -0.1278,
    info: "London is the capital and largest city of England and the United Kingdom. It is a leading global city in arts, commerce, education, entertainment, fashion, finance, healthcare, and tourism.",
    url: "https://en.wikipedia.org/wiki/London"
  },
  {
    name: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    info: "Paris is the capital and most populous city of France. It is known for its art, cuisine, fashion, and landmarks such as the Eiffel Tower, the Louvre, and Notre-Dame Cathedral.",
    url: "https://en.wikipedia.org/wiki/Paris"
  },
  {
    name: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    info: "Sydney is the capital city of New South Wales and the most populous city in Australia. It is known for its harbourfront Sydney Opera House, with a distinctive sail-like design, iconic Harbour Bridge, and beautiful beaches.",
    url: "https://en.wikipedia.org/wiki/Sydney"
  },
  
  // Europe - 10 more cities
  {
    name: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    info: "Rome is the capital city of Italy and a special comune. It is the third most populous city in the European Union. Rome is known for its historic architecture, art, and ancient ruins including the Colosseum and Roman Forum.",
    url: "https://en.wikipedia.org/wiki/Rome"
  },
  {
    name: "Berlin",
    lat: 52.5200,
    lng: 13.4050,
    info: "Berlin is the capital and largest city of Germany. Known for its art scene, modern architecture, and historical significance, Berlin played a major role in 20th-century history, particularly during WWII and the Cold War.",
    url: "https://en.wikipedia.org/wiki/Berlin"
  },
  {
    name: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    info: "Madrid is the capital and most populous city of Spain. It is known for its elegant boulevards, expansive parks, and rich European art housed in museums like the Prado.",
    url: "https://en.wikipedia.org/wiki/Madrid"
  },
  {
    name: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    info: "Amsterdam is the capital and most populous city of the Netherlands. Known for its artistic heritage, elaborate canal system, and narrow houses, Amsterdam is a cultural hub with famous museums and historic sites.",
    url: "https://en.wikipedia.org/wiki/Amsterdam"
  },
  {
    name: "Athens",
    lat: 37.9838,
    lng: 23.7275,
    info: "Athens is the capital and largest city of Greece. With a history spanning over 3,400 years, it's considered the cradle of Western civilization and the birthplace of democracy, home to landmarks like the Acropolis.",
    url: "https://en.wikipedia.org/wiki/Athens"
  },
  {
    name: "Vienna",
    lat: 48.2082,
    lng: 16.3738,
    info: "Vienna is the capital and most populous city of Austria. Known for its imperial palaces, classical music heritage, and vibrant cultural scene, Vienna consistently ranks as one of the world's most livable cities.",
    url: "https://en.wikipedia.org/wiki/Vienna"
  },
  {
    name: "Stockholm",
    lat: 59.3293,
    lng: 18.0686,
    info: "Stockholm is the capital and most populous city of Sweden. Built on 14 islands connected by 57 bridges, Stockholm combines modern architecture with historic buildings across its unique archipelago setting.",
    url: "https://en.wikipedia.org/wiki/Stockholm"
  },
  {
    name: "Istanbul",
    lat: 41.0082,
    lng: 28.9784,
    info: "Istanbul is Turkey's economic, cultural, and historic center. Straddling Europe and Asia across the Bosphorus Strait, this transcontinental city blends ancient history with modern development.",
    url: "https://en.wikipedia.org/wiki/Istanbul"
  },
  {
    name: "Moscow",
    lat: 55.7558,
    lng: 37.6173,
    info: "Moscow is the capital and largest city of Russia. Known for its historic buildings like the Kremlin and Red Square, Moscow is a political, economic, and cultural center with a rich artistic tradition.",
    url: "https://en.wikipedia.org/wiki/Moscow"
  },
  {
    name: "Lisbon",
    lat: 38.7223,
    lng: -9.1393,
    info: "Lisbon is the capital and largest city of Portugal. Known for its warm climate, coastal location, colorful buildings, and historic tram networks, Lisbon offers rich culture and scenic beauty.",
    url: "https://en.wikipedia.org/wiki/Lisbon"
  },
  {
    name: "Timisoara",
    lat: 45.760696,
    lng: 21.226788,
    info: "Timisoara is a vibrant city in Romania, known for its student life.",
    url: "timisoara.html"
  },

  {
    name: "Cluj-Napoca",
    lat: 46.770439,
    lng: 23.591423,
    info: "Cluj-Napoca is a vibrant city in Romania, known for its Central Park and student life.",
    url: "businessOffersCluj.html"
  },
  
  
  // North and South America - 10 cities
  {
    name: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437,
    info: "Los Angeles is the largest city in California and the second most populous city in the United States. Known for its Mediterranean climate, ethnic diversity, Hollywood entertainment industry, and sprawling metropolitan area.",
    url: "https://en.wikipedia.org/wiki/Los_Angeles"
  },
  {
    name: "Chicago",
    lat: 41.8781,
    lng: -87.6298,
    info: "Chicago is the third most populous city in the United States. Known for its bold architecture, skyline punctuated by skyscrapers, and its positioning along Lake Michigan, Chicago is a global architectural and cultural hub.",
    url: "https://en.wikipedia.org/wiki/Chicago"
  },
  {
    name: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    info: "Toronto is the capital city of the Canadian province of Ontario and the most populous city in Canada. A dynamic metropolis with a core of soaring skyscrapers, it's known for its cultural diversity and vibrant neighborhoods.",
    url: "https://en.wikipedia.org/wiki/Toronto"
  },
  {
    name: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    info: "Mexico City is the capital and largest city of Mexico. One of the most populous cities in the world, it blends modern cosmopolitan development with historic colonial architecture and pre-Columbian sites.",
    url: "https://en.wikipedia.org/wiki/Mexico_City"
  },
  {
    name: "Rio de Janeiro",
    lat: -22.9068,
    lng: -43.1729,
    info: "Rio de Janeiro is the second-most populous city in Brazil. Known for its iconic Christ the Redeemer statue, Copacabana and Ipanema beaches, Sugarloaf Mountain, and annual Carnival festival.",
    url: "https://en.wikipedia.org/wiki/Rio_de_Janeiro"
  },
  {
    name: "Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
    info: "Buenos Aires is the capital and largest city of Argentina. A city of passionate tango, European architectural influences, vibrant cultural life, and distinct neighborhoods known as 'barrios'.",
    url: "https://en.wikipedia.org/wiki/Buenos_Aires"
  },
  {
    name: "Lima",
    lat: -12.0464,
    lng: -77.0428,
    info: "Lima is the capital and largest city of Peru. A historic city founded in 1535, Lima is known for its food scene, colonial architecture, museums, and location overlooking the Pacific Ocean.",
    url: "https://en.wikipedia.org/wiki/Lima"
  },
  {
    name: "Santiago",
    lat: -33.4489,
    lng: -70.6693,
    info: "Santiago is the capital and largest city of Chile. Surrounded by the snow-capped Andes Mountains and the Chilean Coast Range, Santiago is a city of modern infrastructure, historic neighborhoods, and cultural institutions.",
    url: "https://en.wikipedia.org/wiki/Santiago"
  },
  {
    name: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    info: "São Paulo is the largest city in Brazil and the largest in the Americas by population. A vibrant financial center known for its skyscrapers, cultural institutions, and diverse population with many ethnic influences.",
    url: "https://en.wikipedia.org/wiki/S%C3%A3o_Paulo"
  },
  {
    name: "Bogotá",
    lat: 4.7110,
    lng: -74.0721,
    info: "Bogotá is the capital and largest city of Colombia. Located high in the Andes mountains, Bogotá is known for its colonial architecture, museums, universities, and vibrant urban culture.",
    url: "https://en.wikipedia.org/wiki/Bogot%C3%A1"
  },
  
  // Africa - 5 cities
  {
    name: "Cairo",
    lat: 30.0444,
    lng: 31.2357,
    info: "Cairo is the capital of Egypt and the largest city in the Arab world. Known for its ancient connections through the nearby Giza Pyramids and Egyptian Museum, Cairo blends ancient history with modern urban life.",
    url: "https://en.wikipedia.org/wiki/Cairo"
  },
  {
    name: "Cape Town",
    lat: -33.9249,
    lng: 18.4241,
    info: "Cape Town is a legislative capital of South Africa. Known for its harbor, natural surroundings including Table Mountain, and landmarks from its colonial heritage, Cape Town is a major tourist destination.",
    url: "https://en.wikipedia.org/wiki/Cape_Town"
  },
  {
    name: "Nairobi",
    lat: -1.2921,
    lng: 36.8219,
    info: "Nairobi is the capital and largest city of Kenya. Known as the 'Green City in the Sun', Nairobi is a regional commercial hub with Nairobi National Park being the only game reserve located within a major city.",
    url: "https://en.wikipedia.org/wiki/Nairobi"
  },
  {
    name: "Lagos",
    lat: 6.5244,
    lng: 3.3792,
    info: "Lagos is the largest city in Nigeria and the second largest metropolitan area in Africa. A major financial center and megacity, Lagos is known for its beach resorts, nightlife, and cultural heritage.",
    url: "https://en.wikipedia.org/wiki/Lagos"
  },
  {
    name: "Casablanca",
    lat: 33.5731,
    lng: -7.5898,
    info: "Casablanca is the largest city of Morocco. A major economic and business center of Africa, Casablanca features the Hassan II Mosque, one of the largest mosques in the world, and a blend of Moorish architecture with European influences.",
    url: "https://en.wikipedia.org/wiki/Casablanca"
  },
  
  // Asia - 10 more cities
  {
    name: "Beijing",
    lat: 39.9042,
    lng: 116.4074,
    info: "Beijing is the capital of China and one of the world's most populous cities. Known for its ancient sites such as the Forbidden City palace complex and the Great Wall of China, Beijing blends imperial history with modern development.",
    url: "https://en.wikipedia.org/wiki/Beijing"
  },
  {
    name: "Shanghai",
    lat: 31.2304,
    lng: 121.4737,
    info: "Shanghai is the most populous urban area in China and a global financial hub. Known for its Lujiazui skyline, historic Bund waterfront, and blend of Western and Eastern influences in architecture and culture.",
    url: "https://en.wikipedia.org/wiki/Shanghai"
  },
  {
    name: "Mumbai",
    lat: 19.0760,
    lng: 72.8777,
    info: "Mumbai is the capital city of the Indian state of Maharashtra and the financial capital of India. A densely populated metropolis known for its iconic Gateway of India, Bollywood film industry, and vibrant cultural scene.",
    url: "https://en.wikipedia.org/wiki/Mumbai"
  },
  {
    name: "Delhi",
    lat: 28.6139,
    lng: 77.2090,
    info: "Delhi is the capital territory of India. A city with ancient history and modern development, Delhi features numerous historic sites including the Red Fort, Qutub Minar, and Humayun's Tomb alongside bustling markets and commercial centers.",
    url: "https://en.wikipedia.org/wiki/Delhi"
  },
  {
    name: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    info: "Singapore is a sovereign island city-state in Southeast Asia. Known for its ultramodern skyline, clean streets, diverse population, tropical climate, and position as a global financial center.",
    url: "https://en.wikipedia.org/wiki/Singapore"
  },
  {
    name: "Seoul",
    lat: 37.5665,
    lng: 126.9780,
    info: "Seoul is the capital and largest metropolis of South Korea. A leading global technology hub and cultural center, Seoul blends skyscrapers and modern architecture with Buddhist temples, palaces, and street markets.",
    url: "https://en.wikipedia.org/wiki/Seoul"
  },
  {
    name: "Bangkok",
    lat: 13.7563,
    lng: 100.5018,
    info: "Bangkok is the capital and most populous city of Thailand. Known for its ornate shrines, vibrant street life, elaborate temples, and status as a major regional force in finance and business.",
    url: "https://en.wikipedia.org/wiki/Bangkok"
  },
  {
    name: "Hong Kong",
    lat: 22.3193,
    lng: 114.1694,
    info: "Hong Kong is a special administrative region of China. Known for its skyline, deep natural harbor, and position as a major shopping and financial center with a high degree of autonomy.",
    url: "https://en.wikipedia.org/wiki/Hong_Kong"
  },
  {
    name: "Dubai",
    lat: 25.2048,
    lng: 55.2708,
    info: "Dubai is the most populous city in the United Arab Emirates. Known for its ultramodern architecture, luxury shopping, and lively nightlife, including the Burj Khalifa, the tallest building in the world.",
    url: "https://en.wikipedia.org/wiki/Dubai"
  },
  {
    name: "Kuala Lumpur",
    lat: 3.1390,
    lng: 101.6869,
    info: "Kuala Lumpur is the capital of Malaysia. Known for its iconic Petronas Twin Towers, colonial architecture, distinctive streetscapes, and blend of Malay, Chinese, and Indian cultural influences.",
    url: "https://en.wikipedia.org/wiki/Kuala_Lumpur"
  }
];

// Convert lat,lng to 3D position
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Create 3D markers for cities
const cityObjects = [];
cities.forEach(city => {
  const position = latLngToVector3(city.lat, city.lng, 10.1);
  
  // Black center
  const markerGeometry = new THREE.SphereBufferGeometry(0.15, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  
  // White border
  const borderGeometry = new THREE.SphereBufferGeometry(0.18, 16, 16);
  const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const border = new THREE.Mesh(borderGeometry, borderMaterial);
  
  // Group for easier handling
  const markerGroup = new THREE.Group();
  markerGroup.add(border);
  markerGroup.add(marker);
  markerGroup.position.set(position.x, position.y, position.z);
  markerGroup.userData = { city };
  
  // Add the marker as a child of the globe so it rotates with it
  globe.add(markerGroup);
  cityObjects.push(markerGroup);
});

// City overlay elements
const cityOverlay = document.getElementById('city-overlay');
const cityTitle = document.getElementById('city-title');
const cityInfo = document.getElementById('city-info');
const learnMoreBtn = document.getElementById('learn-more-btn');
const overlayClose = document.getElementById('overlay-close');

// Variables for globe control
let currentCityUrl = '';
let isHoveringMarker = false;
let isOverlayOpen = false;

// Close overlay and resume rotation
overlayClose.addEventListener('click', () => {
  cityOverlay.classList.remove('active');
  isOverlayOpen = false;
});

// Learn more button
learnMoreBtn.addEventListener('click', () => {
  if (currentCityUrl) {
    window.open(currentCityUrl, '_blank');
  }
});

// Raycaster for city selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add hover detection
document.addEventListener('mousemove', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with city markers
  const intersects = raycaster.intersectObjects(cityObjects, true);
  
  if (intersects.length > 0) {
    isHoveringMarker = true;
    document.body.style.cursor = 'pointer';
  } else {
    isHoveringMarker = false;
    document.body.style.cursor = 'default';
  }
});

// Handle click events for city selection
canvas.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with city markers
  const intersects = raycaster.intersectObjects(cityObjects, true);
  
  if (intersects.length > 0) {
    let markerObj = intersects[0].object;
    // Get the parent group if we clicked on a child mesh
    while (markerObj && !markerObj.userData.city) {
      markerObj = markerObj.parent;
    }
    
    if (markerObj && markerObj.userData.city) {
      const selectedCity = markerObj.userData.city;
      
      // Update overlay content
      cityTitle.textContent = selectedCity.name;
      cityInfo.textContent = selectedCity.info;
      currentCityUrl = selectedCity.url;
      
      // Show overlay and stop rotation
      cityOverlay.classList.add('active');
      isOverlayOpen = true;
    }
  }
});

// Orbit Controls
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 30;

// Set up smooth controls with proper cursor
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.enableDamping = true;  // Enable damping for smooth movement
controls.dampingFactor = 0.1;   // Add damping factor for more smoothness
controls.update();

// Add cursor styles for dragging
let isDragging = false;

// Set initial cursor style when hovering over canvas
canvas.addEventListener('mouseenter', () => {
  if (!isHoveringMarker) {
    document.body.style.cursor = 'grab';
  }
});

canvas.addEventListener('mouseleave', () => {
  if (!isDragging) {
    document.body.style.cursor = 'default';
  }
});

// Change cursor when dragging begins
canvas.addEventListener('mousedown', () => {
  if (!isHoveringMarker) {
    isDragging = true;
    document.body.style.cursor = 'grabbing';
  }
});

// Reset cursor when dragging ends
window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = isHoveringMarker ? 'pointer' : 'grab';
  }
});

// Animation
let cursor = {
  x: 0,
  y: 0
}

document.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  
  // Don't update cursor style during drag operations
  if (!isDragging && !isHoveringMarker) {
    document.body.style.cursor = 'grab';
  }
})

const clock = new THREE.Clock();

function animate() {
  // Only rotate if not hovering over a marker and overlay is closed
  if (!isHoveringMarker && !isOverlayOpen && !isDragging) {
    let elapsedTime = clock.getElapsedTime();
    // Reduced rotation speed from 0.2 to 0.05
    globe.rotation.y = 0.05 * elapsedTime;
  }
  
  // Remove mouse control that happens without clicking
  // globe.rotation.x += 0.5 * (cursor.y*0.0015 - globe.rotation.x);
  // globe.rotation.y += 0.5 * (cursor.x*0.0015 - globe.rotation.y);
  // globe.position.z += 0.5 * (cursor.y*0.0015 - globe.rotation.x);
  
  controls.update();  // Required for damping to work
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}
animate();