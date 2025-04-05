const businesses = [
  {
    name: "Velotm",
    description: "15% discount for cyclists stopping by.",
    logo: "🚲",
    offer: "15% off accessories"
  },
  {
    name: "Timisoara Beans",
    description: "Free Americano for tram riders!",
    logo: "☕",
    offer: "1 Free Americano"
  },
  {
    name: "GreenPrint TM",
    description: "Print sustainably – and save money too!",
    logo: "🖨️",
    offer: "15% off sustainable printing"
  },
  {
    name: "Fresh Garden",
    description: "Eco-travelers get a free lemonade.",
    logo: "🍋",
    offer: "Free Lemonade"
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
