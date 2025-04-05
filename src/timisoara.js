const businesses = [
  {
    name: "AquaSport",
    description: "10% off pool access for eco-commuters.",
    logo: "images/aquasport_tm.png",
    offer: "10% Off Entry"
  },
  {
    name: "BioFresh",
    description: "Free raw vegan dessert if you walked or biked here.",
    logo: "images/biofresh_tm.jfif",
    offer: "Free Dessert"
  },
  {
    name: "Decathlon",
    description: "Support eco-movement with discounts on gear.",
    logo: "images/decathlon_logo.png",
    offer: "10% Off Gear"
  },
  {
    name: "Gym One",
    description: "First training free if you used public transport.",
    logo: "images/gym_one_tm.jfif",
    offer: "Free Training Session"
  },
  {
    name: "Homemade",
    description: "Free drink with a plant-based meal if you biked.",
    logo: "images/homemade_tm.jpg",
    offer: "Free Drink"
  },
  {
    name: "Meron Coffee",
    description: "Bring your own cup & show a bus ticket – get a free refill!",
    logo: "images/meron_coffee.png",
    offer: "Free Refill"
  },
  {
    name: "Timisoara City Marathon",
    description: "20% off if you trained green!",
    logo: "images/timisoaraMaraton.jpg",
    offer: "20% Off Entry"
  },
  {
    name: "Stația de Cafea",
    description: "Show your tram ticket and get a free espresso refill.",
    logo: "images/statiadecafea_tm.png",
    offer: "Free Espresso Refill"
  },
  {
    name: "UVT Liberty Marathon",
    description: "Eco-runners get special discounts for registration.",
    logo: "images/uvt_liberty_tm.png",
    offer: "15% Off Registration"
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
