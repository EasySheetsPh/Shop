/* ==============================
   EASY SHEETS WEBSITE INTERACTIONS
============================== */

//  CAROUSEL FUNCTIONALITY
const slideIndexes = {};

function slideNext(id) {
  const carousel = document.querySelector(`[data-id="${id}"] .slides`);
  const slides = carousel.children.length;

  if (!slideIndexes[id]) slideIndexes[id] = 0;
  slideIndexes[id] = (slideIndexes[id] + 1) % slides;

  carousel.style.transform = `translateX(-${slideIndexes[id] * 100}%)`;
}

function slidePrev(id) {
  const carousel = document.querySelector(`[data-id="${id}"] .slides`);
  const slides = carousel.children.length;

  if (!slideIndexes[id]) slideIndexes[id] = 0;
  slideIndexes[id] = (slideIndexes[id] - 1 + slides) % slides;

  carousel.style.transform = `translateX(-${slideIndexes[id] * 100}%)`;
}

// CHAT BOX TOGGLE
const chatToggle = document.getElementById("chatToggle");
const chatBox = document.getElementById("chatBox");
const chatClose = document.getElementById("chatClose");

if (chatToggle && chatBox && chatClose) {
  chatToggle.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
  });

  chatClose.addEventListener("click", () => {
    chatBox.style.display = "none";
  });
}

// CHAT FORM HANDLER
function submitChat(event) {
  event.preventDefault();

  const name = document.querySelector("#chatName, #chatNameWidget").value?.trim();
  const email = document.querySelector("#chatEmail, #chatEmailWidget").value?.trim();
  const message = document.querySelector("#chatMessage, #chatMessageWidget").value?.trim();

  if (!name || !email || !message) {
    alert("Please fill out all fields before sending.");
    return false;
  }

  alert(`Thanks, ${name}! Your message has been sent successfully. We'll reply soon at ${email}.`);

  document.getElementById("contactForm")?.reset();
  document.getElementById("chatWidgetForm")?.reset();
  chatBox.style.display = "none";

  return false;
}

// SMOOTH SCROLLING
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});
