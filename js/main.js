// Main JavaScript file
console.log("Elkayslense Portfolio Loaded Successfully");
const images = document.querySelectorAll(".portfolio-img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".close");

images.forEach(image => {
    image.addEventListener("click", () => {
        lightbox.style.display = "flex";
        lightboxImg.src = image.src;
    });
});

closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
});

lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) {
        lightbox.style.display = "none";
    }
});

// Contact Form Success Message
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const successMsg = contactForm.querySelector(".success-message");
        successMsg.style.display = "block";

        contactForm.reset();

        setTimeout(() => {
            successMsg.style.display = "none";
        }, 4000);
    });
}

// PORTFOLIO FILTERING
// Portfolio Filtering with Fade
const filterButtons = document.querySelectorAll(".filter-btn");
const portfolioItems = document.querySelectorAll(".portfolio-item");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        portfolioItems.forEach(item => {
            if (filter === "all" || item.dataset.category === filter) {
                item.classList.remove("hide");
            } else {
                item.classList.add("hide");
            }
        });
    });
});
