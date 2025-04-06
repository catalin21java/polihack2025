const businesses = [
  {
    name: "18GYM",
    logo: "images/18_gym_logo.png",
    offers: [
      {
        title: "Free Workout Pass",
        description: "Free first workout if you biked to the gym.",
        points: 150,
        image: "images/18_gym_offert1.webp" // ← you'll add the image filename here later
      },
      {
        title: "10% Off Membership",
        description: "Get 10% off if you walked to your last 5 sessions.",
        points: 300,
        image: "images/18_gym_offert2.jpeg"
      }
    ]
  },
  {
    name: "Centrala de Escaladă",
    logo: "images/centrala de escalada.jpeg",
    offers: [
      {
        title: "10% Off Gear",
        description: "Discount on climbing shoes for eco-travelers.",
        points: 150,
        image: "images/centrala_de_escalada_offer3.jpg"
      },
      {
        title: "Free Entry",
        description: "Redeem a free session with 400 eco points.",
        points: 400,
        image: "images/centrala_de_escalada_offer1.jpg"      }
    ]
  },
  {
    name: "Cimbru",
    logo: "images/cimbru_logo.png",
    offers: [
      {
        title: "Free Dessert",
        description: "Get a free dessert if you walked or biked to the restaurant.",
        points: 120,
        image: "images/cimbru_offer1.webp"
      },
      {
        title: "Meal Deal",
        description: "Eco-travelers get 15% off lunch menus.",
        points: 200,
        image: "images/cimbru_offer2.jpeg"
      }
    ]
  },
  {
    name: "Meron",
    logo: "images/meron_coffee.png",
    offers: [
      {
        title: "Free Ethiopia Coffee Pack",
        description: "Get a free coffee pack after walking 3km.",
        points: 170,
        image: "images/meron_coffee_offer1.jpeg"
      }
    ]
  },
  {
    name: "Runners Club",
    logo: "images/runners_club_logo.png",
    offers: [
      {
        title: "10% Off Coffee at LET'S COFFEE",
        description: "Get 10% off your next coffee.",
        points: 150,
        image: "images/runners_club_offer.jpg"
      }
    ]
  },
  {
    name: "Samsara",
    logo: "images/samsara_logo.jpeg",
    offers: [
      {
        title: "Free Smoothie",
        description: "Enjoy a free smoothie with your vegan meal.",
        points: 100,
        image: "images/samsara_offer3.jpeg"
      },
      {
        title: "15% Off Earth Bowl",
        description: "Eco-travelers get a healthy discount.",
        points: 160,
        image: "images/samsara_offer2.jpeg"
      }
    ]
  },
  {
    name: "Ted's Coffee",
    logo: "images/teds_logo.png",
    offers: [
      {
        title: "Free Refill",
        description: "Bring your own cup, walk or bike to claim.",
        points: 80,
        image: "images/teds_offer.jpg"
      }
    ]
  },
  {
    name: "Wizz Marathon",
    logo: "images/wizz_marathon.png",
    offers: [
      {
        title: "20% Off Entry",
        description: "Join the marathon with a green discount.",
        points: 250,
        image: "images/wizz_offer1.jpeg"
      },
      {
        title: "VIP Runner Kit",
        description: "Redeem a starter pack with 500 points.",
        points: 500,
        image: "images/wizz_offer2.jpeg"
      }
    ]
  },
  {
    name: "Decathlon",
    logo: "images/decathlon_logo.png",
    offers: [
      {
        title: "10% Off Gear",
        description: "Discount on biking and hiking gear.",
        points: 200,
        image: "images/decathlon_offer1.jpeg"
      },
      {
        title: "Free Sports Socks",
        description: "Redeem a free pair with 100 points.",
        points: 100,
        image: "images/decathlon_offer2.jpg"
      }
    ]
  }
];

const grid = document.getElementById("business-grid");
const modal = document.getElementById("offer-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalOffer = document.getElementById("modal-offer");
const modalClose = document.getElementById("modal-close");
const modalImage = document.getElementById("modal-image");
const modalPoints = document.getElementById("modal-points");
const modalOffersCarousel = document.getElementById("modal-offers-carousel");

// QR code popup elements
const qrPopup = document.getElementById("qr-popup");
const qrClose = document.getElementById("qr-close");
const qrOfferTitle = document.getElementById("qr-offer-title");
const qrImage = document.getElementById("qr-image");
const claimCode = document.getElementById("claim-code");

businesses.forEach(biz => {
  const card = document.createElement("div");
  card.className = "business-card";
  card.innerHTML = `
    <img class="logo-img" src="${biz.logo}" alt="${biz.name} Logo">
    <h3>${biz.name}</h3>
  `;
  card.addEventListener("click", () => {
    modalTitle.textContent = biz.name;
    modalOffersCarousel.innerHTML = ""; // clear previous offers
  
    biz.offers.forEach((offer) => {
      const offerEl = document.createElement("div");
      offerEl.className = "offer-box";
      offerEl.innerHTML = `
        <img src="${offer.image || 'images/placeholder.png'}" alt="Offer Image">
        <h3>${offer.title}</h3>
        <p>${offer.description}</p>
        <p><strong>Available for:</strong> ${offer.points} EcoPoints</p>
        <button class="redeem-btn">REDEEM</button>
      `;
      
      // Add event listener to the redeem button
      const redeemBtn = offerEl.querySelector(".redeem-btn");
      redeemBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the modal from closing
        showQRCode(biz.name, offer.title);
      });
      
      modalOffersCarousel.appendChild(offerEl);
    });
  
    modal.classList.add("show");
  });
  
  
  grid.appendChild(card);
});

// Function to show QR code popup
function showQRCode(businessName, offerTitle) {
  qrOfferTitle.textContent = offerTitle;
  
  // Generate a random claim code
  const randomCode = generateRandomCode();
  claimCode.textContent = randomCode;
  
  // Set QR code image - using a placeholder or generate a real one
  // For a real implementation, you would generate a QR code with the claim code data
  // Using a placeholder QR code for now or a free QR code API
  const qrCodeData = encodeURIComponent(`${businessName} - ${offerTitle} - ${randomCode}`);
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`;
  
  // Show the QR popup
  qrPopup.classList.add("show");
}

// Function to generate a random claim code
function generateRandomCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

modalClose.addEventListener("click", () => {
  modal.classList.remove("show"); // 🔁 Changed from add("hidden")
});

// Close QR popup when clicking the close button
qrClose.addEventListener("click", () => {
  qrPopup.classList.remove("show");
});

// Also close QR popup when clicking outside the content
qrPopup.addEventListener("click", (e) => {
  if (e.target === qrPopup) {
    qrPopup.classList.remove("show");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("dropdownButton");
  const dropdownOptions = document.getElementById("dropdownOptions");

  // Add dropdown functionality if elements exist
  if (dropdownBtn && dropdownOptions) {
    dropdownBtn.addEventListener("click", () => {
      dropdownOptions.style.display =
        dropdownOptions.style.display === "block" ? "none" : "block";
    });
  }

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownOptions.contains(e.target)) {
      dropdownOptions.style.display = "none";
    }
  });
});

// Function to handle city change in dropdown
function handleCityChange() {
  const dropdown = document.getElementById("cityDropdown");
  if (dropdown && dropdown.value) {
    window.location.href = dropdown.value;
  }
}

window.businesses = businesses;

