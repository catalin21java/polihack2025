document.getElementById("steps").textContent = "7,820";
document.getElementById("calories").textContent = "340 kcal";
document.getElementById("rides").textContent = "4";
document.getElementById("co2").textContent = "2.3 kg";
document.getElementById("user-points").textContent = "430";

const usedOffers = [
  "☕ Meron – 2-for-1 Coffee",
  "🏃‍♀️ Wizz Marathon – 20% Entry",
  "🥗 Samsara – Free Smoothie"
];

const suggestions = [
  "🍝 Cimbru – Free Dessert",
  "🧗 Escalada – 10% Off Gear",
  "🏋️ 18GYM – Free Workout"
];

usedOffers.forEach(item => {
  const li = document.createElement("li");
  li.textContent = item;
  document.getElementById("used-offers").appendChild(li);
});

suggestions.forEach(item => {
  const li = document.createElement("li");
  li.textContent = item;
  document.getElementById("suggested-offers").appendChild(li);
});
