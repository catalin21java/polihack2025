const businesses = [
  {
    name: "BikeNest",
    description: "10% off all biking gear for eco-travelers.",
    logo: "🚴‍♂️",
    offer: "10% off accessories"
  },
  {
    name: "Green Coffee",
    description: "Free espresso if you walked here!",
    logo: "☕",
    offer: "1 Free Espresso"
  },
  {
    name: "EcoPrint",
    description: "20% discount for public transport users.",
    logo: "🖨️",
    offer: "20% off printing services"
  },
  {
    name: "NatureBites",
    description: "Get a free smoothie if you biked over 3km.",
    logo: "🥤",
    offer: "Free Smoothie"
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
    <div class="logo">${biz.logo}</div>
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
