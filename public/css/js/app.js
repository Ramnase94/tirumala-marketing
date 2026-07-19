// ==========================
// Tirumala Marketing App
// ==========================

let fetchedProducts = [];
let shoppingCart = JSON.parse(localStorage.getItem("tirumala_cart")) || [];

// --------------------------
// Dark Mode
// --------------------------

function toggleDark() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

}

window.addEventListener("load", () => {

    if (localStorage.getItem("darkMode") === "true") {

        document.body.classList.add("dark");

    }

});

// --------------------------
// Cart Count
// --------------------------

function updateNavCartCount() {

    const count = document.getElementById("navCartCount");

    if (count) {

        count.innerText = shoppingCart.length;

    }

}

// --------------------------
// Fetch Products
// --------------------------

async function fetchSnacks() {

    try {

        const response = await fetch("/api/products");

        fetchedProducts = await response.json();

        displaySnacks();

        updateNavCartCount();

    } catch (err) {

        console.error(err);

    }

}// ==========================
// Display Products
// ==========================

function displaySnacks(products = fetchedProducts) {

    const grid = document.getElementById("productsDisplay");

    if (!grid) return;

    grid.innerHTML = "";

    products.forEach(snack => {

        const badgeText =
            snack.type === "Spicy"
            ? "🌶️ Spicy"
            : "🟢 Non-Spicy";

        const badgeClass =
            snack.type === "Spicy"
            ? "badge"
            : "badge non-spicy";

        grid.innerHTML += `

<div class="product-card">

    <div class="offer-badge">
        20% OFF
    </div>

    <img src="${snack.image}" class="product-image" alt="${snack.name}">

    <div class="wishlist">❤</div>

    <div class="product-top">

        <span class="${badgeClass}">
            ${badgeText}
        </span>

        <h3>${snack.name}</h3>

        <p>${snack.desc}</p>

        <p>📦 ${snack.weight}</p>

        <p>📂 ${snack.category}</p>

        <div class="rating">
            ⭐⭐⭐⭐⭐
        </div>

    </div>

    <div class="product-bottom">

        <div class="price">
            ₹${snack.price}
        </div>

        <button class="btn"
        onclick="addItemToCart(${snack.id})">

            🛒 Add To Cart

        </button>

    </div>

</div>

`;

    });

}

// ==========================
// Search Products
// ==========================

function searchProducts() {

    const value = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered = fetchedProducts.filter(item =>

        item.name.toLowerCase().includes(value) ||

        item.category.toLowerCase().includes(value)

    );

    displaySnacks(filtered);

}

// ==========================
// Category Filter
// ==========================

function filterCategory(category) {

    if (category === "All") {

        displaySnacks();

        return;

    }

    const filtered = fetchedProducts.filter(item =>

        item.category === category

    );

    displaySnacks(filtered);

}

// ==========================
// Add To Cart
// ==========================

function addItemToCart(id) {

    const product = fetchedProducts.find(item => item.id == id);

    if (!product) {

        alert("Product Not Found");

        return;

    }

    shoppingCart.push(product);

    localStorage.setItem(
        "tirumala_cart",
        JSON.stringify(shoppingCart)
    );

    updateNavCartCount();

    alert(product.name + " कार्टमध्ये जोडले.");

}// ==========================
// Feedback
// ==========================

async function sendFeedback() {

    const name = document.getElementById("fbName").value.trim();
    const rating = document.getElementById("fbRating").value;
    const comment = document.getElementById("fbComment").value.trim();

    if (name === "" || comment === "") {

        alert("कृपया सर्व माहिती भरा.");
        return;

    }

    try {

        const response = await fetch("/api/feedbacks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                rating,
                comment
            })

        });

        if (response.ok) {

            alert("✅ Feedback यशस्वीरित्या पाठवला.");

            document.getElementById("fbName").value = "";
            document.getElementById("fbComment").value = "";
            document.getElementById("fbRating").value = "5";

        } else {

            alert("❌ Feedback Submit झाला नाही.");

        }

    } catch (err) {

        console.error(err);

        alert("❌ Server Error");

    }

}


// ==========================
// Hero Slider
// ==========================

const banners = [

    "images/banner1.jpg",
    "images/banner2.jpg",
    "images/banner3.jpg"

];

let currentBanner = 0;

setInterval(() => {

    const img = document.getElementById("sliderImage");

    if (!img) return;

    currentBanner++;

    if (currentBanner >= banners.length) {

        currentBanner = 0;

    }

    img.src = banners[currentBanner];

}, 3000);


// ==========================
// Countdown Timer
// ==========================

let hours = 5;
let minutes = 59;
let seconds = 59;

setInterval(() => {

    if (seconds > 0) {

        seconds--;

    } else {

        seconds = 59;

        if (minutes > 0) {

            minutes--;

        } else {

            minutes = 59;

            if (hours > 0) {

                hours--;

            }

        }

    }

    const timer = document.getElementById("timer");

    if (timer) {

        timer.innerHTML =
            String(hours).padStart(2, "0") + " : " +
            String(minutes).padStart(2, "0") + " : " +
            String(seconds).padStart(2, "0");

    }

}, 1000);


// ==========================
// Review Slider
// ==========================

const reviews = document.querySelectorAll(".review");

let reviewIndex = 0;

if (reviews.length > 0) {

    setInterval(() => {

        reviews[reviewIndex].classList.remove("active");

        reviewIndex++;

        if (reviewIndex >= reviews.length) {

            reviewIndex = 0;

        }

        reviews[reviewIndex].classList.add("active");

    }, 3000);

}


// ==========================
// Start App
// ==========================

window.onload = () => {

    fetchSnacks();

    updateNavCartCount();

};