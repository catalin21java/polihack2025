const businesses = [
  {
    name: "18GYM",
    description: "Free first workout if you biked to the gym.",
    logo: "images/18_gym_logo.png",
    offer: "Free Workout Pass"
  },
  {
    name: "Centrala de Escaladă",
    description: "10% off climbing gear for eco-friendly travelers.",
    logo: "images/centrala de escalada.jpeg",
    offer: "10% Off Gear"
  },
  {
    name: "Cimbru",
    description: "Free dessert if you biked or walked to the restaurant.",
    logo: "images/cimbru_logo.png",
    offer: "Free Dessert"
  },
  {
    name: "Meron",
    description: "Buy 1 coffee, get 1 free with public transport proof.",
    logo: "images/meron_coffee.png",
    offer: "2-for-1 Coffee"
  },
  {
    name: "Runners Club",
    description: "Discounted entry to upcoming events for eco-travelers.",
    logo: "images/runners_club_logo.png",
    offer: "10% Off Entry"
  },
  {
    name: "Samsara",
    description: "Get a free smoothie with your plant-based meal.",
    logo: "images/samsara_logo.jpeg",
    offer: "Free Smoothie"
  },
  {
    name: "Ted’s Coffee",
    description: "Free refill if you bring your own cup and walk or bike.",
    logo: "images/teds_logo.png",
    offer: "Free Refill"
  },
  {
    name: "Wizz Marathon",
    description: "Join the marathon with 20% off if you train green.",
    logo: "images/wizz_marathon.png",
    offer: "20% Off Entry"
  },
  {
    name: "Decathlon",
    description: "Sport.",
    logo: "images/decathlon_logo.png",
    offer: "10% Off Gear"
  }
];

const grid = document.getElementById("business-grid");
const modal = document.getElementById("offer-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalOffer = document.getElementById("modal-offer");
const modalClose = document.getElementById("modal-close");

businesses.forEach(biz => {
  const card = document.createElement("div");
  card.className = "business-card";
  card.innerHTML = `
    <img class="logo-img" src="${biz.logo}" alt="${biz.name} Logo">
    <h3>${biz.name}</h3>
  `;
  card.addEventListener("click", () => {
    modalTitle.textContent = biz.name;
    modalDescription.textContent = biz.description;
    modalOffer.textContent = biz.offer;
    modal.classList.remove("hidden");
  });
  grid.appendChild(card);
});

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});
