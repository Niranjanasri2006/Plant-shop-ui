/* =====================================================
   GREENLEAF - COMMON SCRIPT
   CART + WISHLIST
   ===================================================== */


/* =====================================================
   AUTH CONFIG
   ===================================================== */

const AUTH_API_BASE = "http://localhost:5000/api/auth";


/* =====================================================
   AUTH SESSION HELPERS (token + current user)
   ===================================================== */

function getToken() {

    return localStorage.getItem("greenleafToken") || null;

}


function setToken(token) {

    localStorage.setItem("greenleafToken", token);

}


function clearToken() {

    localStorage.removeItem("greenleafToken");

}


function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem("greenleafUser")
    ) || null;

}


function setCurrentUser(user) {

    localStorage.setItem(
        "greenleafUser",
        JSON.stringify(user)
    );

}


function clearCurrentUser() {

    localStorage.removeItem("greenleafUser");

}


/* Builds a storage key scoped to the currently logged-in user,
   so every user gets their own cart / wishlist / profile / orders /
   address in localStorage instead of one shared global state. */

function getUserStorageKey(baseKey) {

    const user =
        getCurrentUser();

    const userId =
        user ? user.id : "guest";

    return baseKey + "_" + userId;

}


/* =====================================================
   GET CART
   ===================================================== */

function getCart() {

    return JSON.parse(
        localStorage.getItem(getUserStorageKey("greenleafCart"))
    ) || [];

}


/* =====================================================
   SAVE CART
   ===================================================== */

function saveCart(cart) {

    localStorage.setItem(
        getUserStorageKey("greenleafCart"),
        JSON.stringify(cart)
    );

}


/* =====================================================
   GET WISHLIST
   ===================================================== */

function getWishlist() {

    return JSON.parse(
        localStorage.getItem(getUserStorageKey("greenleafWishlist"))
    ) || [];

}


/* =====================================================
   SAVE WISHLIST
   ===================================================== */

function saveWishlist(wishlist) {

    localStorage.setItem(
        getUserStorageKey("greenleafWishlist"),
        JSON.stringify(wishlist)
    );

}


/* =====================================================
   GET PRODUCT FROM CARD
   ===================================================== */

function getProductFromCard(card) {

    const nameElement =
        card.querySelector("h3");

    const priceElement =
        card.querySelector(".plant-bottom strong");

    const imageElement =
        card.querySelector(".plant-image img");

    const categoryElement =
        card.querySelector(".plant-info small");


    if (!nameElement || !priceElement) {

        return null;

    }


    const name =
        nameElement.textContent.trim();


    const priceText =
        priceElement.textContent
            .replace("₹", "")
            .replace(/,/g, "")
            .trim();


    const price =
        Number(priceText);


    const image =
        imageElement
            ? imageElement.src
            : "";


    const category =
        categoryElement
            ? categoryElement.textContent.trim()
            : "";


    /* Id is derived from the image filename (not the name text)
       so the same plant always resolves to the same id even if a
       page label differs slightly (e.g. "Rose" vs "Rose Plant"). */

    let id;

    if (imageElement && imageElement.getAttribute("src")) {

        const fileName =
            imageElement
                .getAttribute("src")
                .split("/")
                .pop();

        id =
            fileName.replace(/\.[a-zA-Z0-9]+$/, "");

    } else {

        id =
            name
                .toLowerCase()
                .replace(/\s+/g, "-");

    }


    return {

        id: id,

        name: name,

        price: price,

        image: image,

        category: category

    };

}


/* =====================================================
   UPDATE NAVBAR COUNTS
   ===================================================== */

function updateCounts() {

    const cart =
        getCart();

    const wishlist =
        getWishlist();


    /* Cart total quantity */

    let cartTotal = 0;


    cart.forEach(function(item) {

        cartTotal += item.quantity;

    });


    document
        .querySelectorAll(".cart-count")
        .forEach(function(element) {

            element.textContent =
                cartTotal > 0
                    ? cartTotal
                    : "";

        });


    /* Wishlist count */

    document
        .querySelectorAll(".wishlist-count")
        .forEach(function(element) {

            element.textContent =
                wishlist.length > 0
                    ? wishlist.length
                    : "";

        });

}


/* =====================================================
   ADD TO CART
   ===================================================== */

function addProductToCart(product) {

    if (!product) {

        return;

    }


    let cart =
        getCart();


    const existing =
        cart.find(function(item) {

            return item.id === product.id;

        });


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: product.price,

            image: product.image,

            category: product.category,

            quantity: 1

        });

    }


    saveCart(cart);

    updateCounts();


    alert(
        product.name +
        " added to cart 🛒"
    );

}


/* =====================================================
   ADD TO WISHLIST
   ===================================================== */

function toggleProductWishlist(
    product,
    button
) {

    if (!product) {

        return;

    }


    let wishlist =
        getWishlist();


    const existingIndex =
        wishlist.findIndex(function(item) {

            return item.id === product.id;

        });


    if (existingIndex === -1) {

        wishlist.push(product);

        button.classList.add("active");

        button.innerHTML =
            '<i class="fa-solid fa-heart"></i>';

    } else {

        wishlist.splice(
            existingIndex,
            1
        );

        button.classList.remove("active");

        button.innerHTML =
            '<i class="fa-regular fa-heart"></i>';

    }


    saveWishlist(wishlist);

    updateCounts();

}


/* =====================================================
   CHECK WISHLIST HEARTS
   ===================================================== */

function updateWishlistButtons() {

    const wishlist =
        getWishlist();


    document
        .querySelectorAll(".plant-card")
        .forEach(function(card) {

            const product =
                getProductFromCard(card);


            const button =
                card.querySelector(
                    ".wishlist-btn"
                );


            if (!product || !button) {

                return;

            }


            const exists =
                wishlist.some(function(item) {

                    return item.id === product.id;

                });


            if (exists) {

                button.classList.add("active");

                button.innerHTML =
                    '<i class="fa-solid fa-heart"></i>';

            } else {

                button.classList.remove("active");

                button.innerHTML =
                    '<i class="fa-regular fa-heart"></i>';

            }

        });

}


/* =====================================================
   REMOVE FROM CART
   ===================================================== */

function removeFromCart(productId) {

    let cart =
        getCart();


    cart =
        cart.filter(function(item) {

            return item.id !== productId;

        });


    saveCart(cart);

    updateCounts();

}


/* =====================================================
   REMOVE FROM WISHLIST
   ===================================================== */

function removeFromWishlist(productId) {

    let wishlist =
        getWishlist();


    wishlist =
        wishlist.filter(function(item) {

            return item.id !== productId;

        });


    saveWishlist(wishlist);

    updateCounts();

}


/* =====================================================
   CHANGE CART QUANTITY
   ===================================================== */

function changeQuantity(
    productId,
    change
) {

    let cart =
        getCart();


    const product =
        cart.find(function(item) {

            return item.id === productId;

        });


    if (!product) {

        return;

    }


    product.quantity += change;


    if (product.quantity <= 0) {

        cart =
            cart.filter(function(item) {

                return item.id !== productId;

            });

    }


    saveCart(cart);

    updateCounts();

}


/* =====================================================
   CALCULATE CART TOTAL
   ===================================================== */

function calculateCartTotal() {

    const cart =
        getCart();


    let total = 0;


    cart.forEach(function(item) {

        total +=
            item.price *
            item.quantity;

    });


    return total;

}


/* =====================================================
   PROFILE DETAILS
   ===================================================== */

function getProfile() {

    return JSON.parse(
        localStorage.getItem(getUserStorageKey("greenleafProfile"))
    ) || null;

}


function saveProfile(profile) {

    localStorage.setItem(
        getUserStorageKey("greenleafProfile"),
        JSON.stringify(profile)
    );

}


/* =====================================================
   ORDERS
   ===================================================== */

function getOrders() {

    return JSON.parse(
        localStorage.getItem(getUserStorageKey("greenleafOrders"))
    ) || [];

}


function saveOrders(orders) {

    localStorage.setItem(
        getUserStorageKey("greenleafOrders"),
        JSON.stringify(orders)
    );

}


/* Turns the current cart into a placed order, clears the cart,
   and returns the order that was created (or null if cart empty) */

function placeOrder() {

    const cart =
        getCart();


    if (cart.length === 0) {

        return null;

    }


    let subtotal = 0;

    cart.forEach(function(item) {

        subtotal +=
            item.price *
            item.quantity;

    });


    let discount = 0;

    if (subtotal >= 1000) {

        discount = subtotal * 0.10;

    }


    let delivery = 0;

    if (subtotal > 0) {

        delivery = 50;

    }

    if (subtotal >= 1500) {

        delivery = 0;

    }


    const order = {

        id: "GL" + Date.now(),

        date: new Date().toISOString(),

        items: cart,

        subtotal: subtotal,

        discount: discount,

        delivery: delivery,

        total: subtotal - discount + delivery,

        status: "Processing"

    };


    const orders =
        getOrders();

    orders.unshift(order);

    saveOrders(orders);


    saveCart([]);

    updateCounts();


    return order;

}


/* Places an order for a single product straight from the Buy Now
   button, without touching whatever is currently in the cart.
   Uses the exact same order shape as placeOrder() so the existing
   Order page (orders.html) renders it with no changes needed. */

function placeDirectOrder(product, qty) {

    const item = {

        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: qty

    };


    const subtotal =
        item.price * item.quantity;


    let discount = 0;

    if (subtotal >= 1000) {

        discount = subtotal * 0.10;

    }


    let delivery = 0;

    if (subtotal > 0) {

        delivery = 50;

    }

    if (subtotal >= 1500) {

        delivery = 0;

    }


    const order = {

        id: "GL" + Date.now(),

        date: new Date().toISOString(),

        items: [item],

        subtotal: subtotal,

        discount: discount,

        delivery: delivery,

        total: subtotal - discount + delivery,

        status: "Processing"

    };


    const orders =
        getOrders();

    orders.unshift(order);

    saveOrders(orders);


    return order;

}


/* Shows the "Order Confirmed" popup (markup lives in plant-detail.html).
   Falls back to a direct redirect if the popup isn't on the page. */

function showOrderConfirmedPopup() {

    const overlay =
        document.getElementById("orderConfirmOverlay");

    if (!overlay) {

        window.location.href = "orders.html";

        return;

    }

    overlay.classList.add("show");

    const viewBtn =
        document.getElementById("orderConfirmViewBtn");

    if (viewBtn) {

        viewBtn.onclick = function () {

            window.location.href = "orders.html";

        };

    }

}


/* =====================================================
   SAVED ADDRESS
   ===================================================== */

function getAddress() {

    return JSON.parse(
        localStorage.getItem(getUserStorageKey("greenleafAddress"))
    ) || null;

}


function saveAddress(address) {

    localStorage.setItem(
        getUserStorageKey("greenleafAddress"),
        JSON.stringify(address)
    );

}


/* =====================================================
   LOGIN STATE
   ===================================================== */

/* Logged in means we hold both a JWT token and the user object
   returned by the backend after register/login */

function isLoggedIn() {

    return !!getToken() && !!getCurrentUser();

}


function logoutUser() {

    clearToken();

    clearCurrentUser();

    const base =
        isInPagesFolder() ? "../" : "";

    window.location.href =
        base + "index.html";

}


/* =====================================================
   AUTH MODAL (Sign Up / Login gate shown on first visit
   and on every page until the user is authenticated)
   ===================================================== */

function buildAuthModal() {

    if (document.getElementById("authModalOverlay")) {

        return;

    }

    const styleTag =
        document.createElement("style");

    styleTag.id = "authModalStyles";

    styleTag.textContent = `
        body.auth-modal-open > *:not(#authModalOverlay) {
            filter: blur(6px);
            pointer-events: none;
            user-select: none;
        }
        #authModalOverlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 30, 20, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        }
        #authModalOverlay .auth-modal-box {
            background: #ffffff;
            width: 100%;
            max-width: 460px;
            border-radius: 18px;
            padding: 34px 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-height: 90vh;
            overflow-y: auto;
            font-family: inherit;
        }
        #authModalOverlay .auth-modal-logo {
            text-align: center;
            margin-bottom: 6px;
        }
        #authModalOverlay .auth-modal-logo i {
            font-size: 38px;
            color: #2f8f4e;
        }
        #authModalOverlay .auth-modal-logo span {
            display: block;
            font-size: 22px;
            font-weight: 700;
            color: #1c3d24;
            margin-top: 6px;
        }
        #authModalOverlay .auth-modal-tagline {
            text-align: center;
            font-size: 13px;
            color: #6b7d70;
            margin-bottom: 22px;
        }
        #authModalOverlay .auth-tabs {
            display: flex;
            border-radius: 10px;
            background: #f1f5f2;
            padding: 4px;
            margin-bottom: 20px;
        }
        #authModalOverlay .auth-tab-btn {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            color: #4c5c50;
            transition: 0.2s;
        }
        #authModalOverlay .auth-tab-btn.active {
            background: #2f8f4e;
            color: #ffffff;
        }
        #authModalOverlay .auth-form {
            display: none;
            flex-direction: column;
            gap: 12px;
        }
        #authModalOverlay .auth-form.active {
            display: flex;
        }
        #authModalOverlay .auth-form input {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #dbe4dd;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            font-family: inherit;
        }
        #authModalOverlay .auth-form input:focus {
            border-color: #2f8f4e;
        }
        #authModalOverlay .auth-row {
            display: flex;
            gap: 10px;
        }
        #authModalOverlay .auth-row input {
            flex: 1;
            min-width: 0;
        }
        #authModalOverlay .auth-submit-btn {
            margin-top: 4px;
            background: #2f8f4e;
            color: #ffffff;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
        }
        #authModalOverlay .auth-submit-btn:hover {
            background: #257a41;
        }
        #authModalOverlay .auth-error {
            color: #d5423f;
            font-size: 13px;
            min-height: 16px;
            text-align: center;
            margin: 0;
        }
        #authModalOverlay .auth-success {
            color: #2f8f4e;
            font-size: 13px;
            min-height: 16px;
            text-align: center;
            margin: 0;
        }
        #authModalOverlay .auth-link-row {
            text-align: center;
            margin: 4px 0 0;
        }
        #authModalOverlay .auth-link-row a {
            color: #2f8f4e;
            font-size: 13px;
            text-decoration: none;
            font-weight: 600;
        }
        #authModalOverlay .auth-link-row a:hover {
            text-decoration: underline;
        }
        #authModalOverlay .auth-password-wrapper {
            position: relative;
        }
        #authModalOverlay .auth-password-wrapper input {
            padding-right: 40px;
        }
        #authModalOverlay .auth-password-toggle {
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #7c8c80;
            font-size: 16px;
            padding: 4px;
            line-height: 1;
        }
        #authModalOverlay .auth-password-toggle:hover {
            color: #2f8f4e;
        }
        #welcomeToast {
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%) translateY(-16px) scale(0.92);
            background: linear-gradient(135deg, #2f8f4e, #226b3a);
            border-radius: 16px;
            box-shadow: 0 18px 40px rgba(20, 60, 35, 0.35);
            padding: 20px 30px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 14px;
            opacity: 0;
            transition: opacity 0.4s ease, transform 0.4s ease;
            max-width: 90%;
        }
        #welcomeToast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
        #welcomeToast .welcome-icon {
            width: 44px;
            height: 44px;
            min-width: 44px;
            border-radius: 50%;
            background: rgba(255,255,255,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #welcomeToast .welcome-icon i {
            font-size: 20px;
            color: #ffffff;
        }
        #welcomeToast p {
            margin: 0;
            font-family: inherit;
            text-align: left;
        }
        #welcomeToast .welcome-line1 {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
        }
        #welcomeToast .welcome-line2 {
            font-size: 13px;
            color: rgba(255,255,255,0.85);
            margin-top: 3px;
        }
    `;

    document.head.appendChild(styleTag);

    const overlay =
        document.createElement("div");

    overlay.id = "authModalOverlay";

    overlay.innerHTML = `
        <div class="auth-modal-box">

            <div class="auth-modal-logo">
                <i class="fa-solid fa-leaf"></i>
                <span>GreenLeaf</span>
            </div>

            <p class="auth-modal-tagline">
                Login or create an account to continue shopping
            </p>

            <div class="auth-tabs">
                <button type="button" class="auth-tab-btn active" id="authTabLogin">Login</button>
                <button type="button" class="auth-tab-btn" id="authTabSignup">Sign Up</button>
            </div>

            <form id="authLoginForm" class="auth-form active">
                <input type="email" id="authLoginEmail" placeholder="Email Address" required>
                <div class="auth-password-wrapper">
                    <input type="password" id="authLoginPassword" placeholder="Password" required>
                    <button type="button" class="auth-password-toggle" id="authLoginPasswordToggle" aria-label="Show password">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                </div>
                <p class="auth-error" id="authLoginError"></p>
                <button type="submit" class="auth-submit-btn">Login</button>
                <p class="auth-link-row">
                    <a href="#" id="authForgotLink">Forgot password?</a>
                </p>
            </form>

            <form id="authSignupForm" class="auth-form">
                <input type="text" id="authSignupName" placeholder="Full Name" required>
                <div class="auth-row">
                    <input type="tel" id="authSignupPhone" placeholder="Phone Number" required>
                    <input type="date" id="authSignupDob" required>
                </div>
                <input type="text" id="authSignupAddress" placeholder="Address" required>
                <input type="email" id="authSignupEmail" placeholder="Email Address" required>
                <div class="auth-password-wrapper">
                    <input type="password" id="authSignupPassword" placeholder="Password (min 6 characters)" required>
                    <button type="button" class="auth-password-toggle" id="authSignupPasswordToggle" aria-label="Show password">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                </div>
                <p class="auth-error" id="authSignupError"></p>
                <button type="submit" class="auth-submit-btn">Sign Up</button>
            </form>

            <form id="authForgotForm" class="auth-form">
                <p class="auth-modal-tagline" style="margin-bottom: 4px;">
                    Enter your email and phone number to verify it's you, then set a new password.
                </p>
                <input type="email" id="authForgotEmail" placeholder="Email Address" required>
                <input type="tel" id="authForgotPhone" placeholder="Phone Number" required>
                <div class="auth-password-wrapper">
                    <input type="password" id="authForgotNewPassword" placeholder="New Password (min 6 characters)" required>
                    <button type="button" class="auth-password-toggle" id="authForgotPasswordToggle" aria-label="Show password">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                </div>
                <p class="auth-error" id="authForgotError"></p>
                <p class="auth-success" id="authForgotSuccess"></p>
                <button type="submit" class="auth-submit-btn">Reset Password</button>
                <p class="auth-link-row">
                    <a href="#" id="authBackToLoginLink">Back to Login</a>
                </p>
            </form>

        </div>
    `;

    document.body.appendChild(overlay);

    document.body.classList.add("auth-modal-open");


    /* ---------- Tab switching ---------- */

    document.getElementById("authTabLogin").addEventListener("click", function () {

        document.getElementById("authTabLogin").classList.add("active");
        document.getElementById("authTabSignup").classList.remove("active");
        document.getElementById("authLoginForm").classList.add("active");
        document.getElementById("authSignupForm").classList.remove("active");

    });

    document.getElementById("authTabSignup").addEventListener("click", function () {

        document.getElementById("authTabSignup").classList.add("active");
        document.getElementById("authTabLogin").classList.remove("active");
        document.getElementById("authSignupForm").classList.add("active");
        document.getElementById("authLoginForm").classList.remove("active");

    });


    /* ---------- Forgot password navigation ---------- */

    document.getElementById("authForgotLink").addEventListener("click", function (event) {

        event.preventDefault();

        document.querySelector(".auth-tabs").style.display = "none";
        document.getElementById("authLoginForm").classList.remove("active");
        document.getElementById("authSignupForm").classList.remove("active");
        document.getElementById("authForgotForm").classList.add("active");

    });

    document.getElementById("authBackToLoginLink").addEventListener("click", function (event) {

        event.preventDefault();

        document.getElementById("authForgotError").textContent = "";
        document.getElementById("authForgotSuccess").textContent = "";

        document.querySelector(".auth-tabs").style.display = "flex";
        document.getElementById("authForgotForm").classList.remove("active");
        document.getElementById("authTabLogin").classList.add("active");
        document.getElementById("authTabSignup").classList.remove("active");
        document.getElementById("authLoginForm").classList.add("active");

    });


    /* ---------- Password show/hide toggles ---------- */

    function wireUpPasswordToggle(toggleId, inputId) {

        const toggleBtn =
            document.getElementById(toggleId);

        const input =
            document.getElementById(inputId);

        toggleBtn.addEventListener("click", function () {

            const isHidden =
                input.type === "password";

            input.type =
                isHidden ? "text" : "password";

            toggleBtn.innerHTML =
                isHidden
                    ? '<i class="fa-regular fa-eye-slash"></i>'
                    : '<i class="fa-regular fa-eye"></i>';

            toggleBtn.setAttribute(
                "aria-label",
                isHidden ? "Hide password" : "Show password"
            );

        });

    }

    wireUpPasswordToggle("authLoginPasswordToggle", "authLoginPassword");

    wireUpPasswordToggle("authSignupPasswordToggle", "authSignupPassword");

    wireUpPasswordToggle("authForgotPasswordToggle", "authForgotNewPassword");


    /* ---------- Login submit ---------- */

    document.getElementById("authLoginForm").addEventListener("submit", async function (event) {

        event.preventDefault();

        const errorBox =
            document.getElementById("authLoginError");

        errorBox.textContent = "";

        const email =
            document.getElementById("authLoginEmail").value.trim();

        const password =
            document.getElementById("authLoginPassword").value;

        try {

            const response =
                await fetch(AUTH_API_BASE + "/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

            const data =
                await response.json();

            if (!response.ok) {

                errorBox.textContent =
                    data.message || "Login failed";

                return;

            }

            completeAuthSuccess(data, "login");

        } catch (error) {

            errorBox.textContent =
                "Server not reachable. Please check your backend is running.";

        }

    });


    /* ---------- Signup submit ---------- */

    document.getElementById("authSignupForm").addEventListener("submit", async function (event) {

        event.preventDefault();

        const errorBox =
            document.getElementById("authSignupError");

        errorBox.textContent = "";

        const name =
            document.getElementById("authSignupName").value.trim();

        const phone =
            document.getElementById("authSignupPhone").value.trim();

        const dob =
            document.getElementById("authSignupDob").value;

        const address =
            document.getElementById("authSignupAddress").value.trim();

        const email =
            document.getElementById("authSignupEmail").value.trim();

        const password =
            document.getElementById("authSignupPassword").value;

        if (password.length < 6) {

            errorBox.textContent =
                "Password must be at least 6 characters";

            return;

        }

        try {

            const response =
                await fetch(AUTH_API_BASE + "/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, dob, address, phone })
                });

            const data =
                await response.json();

            if (!response.ok) {

                errorBox.textContent =
                    data.message || "Signup failed";

                return;

            }

            completeAuthSuccess(data, "signup");

        } catch (error) {

            errorBox.textContent =
                "Server not reachable. Please check your backend is running.";

        }

    });


    /* ---------- Forgot password submit ---------- */

    document.getElementById("authForgotForm").addEventListener("submit", async function (event) {

        event.preventDefault();

        const errorBox =
            document.getElementById("authForgotError");

        const successBox =
            document.getElementById("authForgotSuccess");

        errorBox.textContent = "";
        successBox.textContent = "";

        const email =
            document.getElementById("authForgotEmail").value.trim();

        const phone =
            document.getElementById("authForgotPhone").value.trim();

        const newPassword =
            document.getElementById("authForgotNewPassword").value;

        if (newPassword.length < 6) {

            errorBox.textContent =
                "New password must be at least 6 characters";

            return;

        }

        try {

            const response =
                await fetch(AUTH_API_BASE + "/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, phone, newPassword })
                });

            const data =
                await response.json();

            if (!response.ok) {

                errorBox.textContent =
                    data.message || "Password reset failed";

                return;

            }

            successBox.textContent =
                data.message || "Password reset successful. Please login.";

            document.getElementById("authForgotForm").reset();

        } catch (error) {

            errorBox.textContent =
                "Server not reachable. Please check your backend is running.";

        }

    });

}


/* Runs after a successful login OR signup response from the backend */

function completeAuthSuccess(data, mode) {

    setToken(data.token);

    setCurrentUser(data.user);

    /* Seed this user's profile page with the details they registered
       with, but only if they don't already have saved profile edits
       from a previous session on this browser */

    if (!getProfile()) {

        saveProfile({
            fullname: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            dob: data.user.dob ? data.user.dob.substring(0, 10) : "",
            address: data.user.address || ""
        });

    }

    closeAuthModal();

    updateCounts();

    updateWishlistButtons();

    applySidebarProfile();

    showWelcomeToast(data.user.name, mode);

}


/* Shows a small greeting toast for a couple of seconds after a
   successful login or signup, then fades out and removes itself */

function showWelcomeToast(name, mode) {

    const existing =
        document.getElementById("welcomeToast");

    if (existing) {

        existing.remove();

    }

    const firstName =
        name ? name.split(" ")[0] : "";

    const isSignup =
        mode === "signup";

    const line1 =
        isSignup
            ? "Welcome to the GreenLeaf family" + (firstName ? ", " + firstName : "") + "!"
            : "Welcome back" + (firstName ? ", " + firstName : "") + "!";

    const line2 =
        isSignup
            ? "Your account is ready -- let's find your first plant"
            : "Great to see you again -- happy shopping";

    const toast =
        document.createElement("div");

    toast.id = "welcomeToast";

    toast.innerHTML = `
        <div class="welcome-icon">
            <i class="fa-solid fa-seedling"></i>
        </div>
        <div>
            <p class="welcome-line1">${line1}</p>
            <p class="welcome-line2">${line2}</p>
        </div>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(function () {

        toast.classList.add("show");

    });

    setTimeout(function () {

        toast.classList.remove("show");

        setTimeout(function () {

            toast.remove();

        }, 400);

    }, 2500);

}


function closeAuthModal() {

    const overlay =
        document.getElementById("authModalOverlay");

    if (overlay) {

        overlay.remove();

    }

    document.body.classList.remove("auth-modal-open");

}


/* Called on every page load -- shows the auth modal only when
   nobody is logged in yet on this browser */

function initAuthGate() {

    if (!isLoggedIn()) {

        buildAuthModal();

    }

}


/* =====================================================
   PLANT DETAIL DATA
   (single source of truth for the 8 GreenLeaf plants)
   ===================================================== */

const PLANT_DETAILS = {

    "money-plant": {
        name: "Money Plant",
        category: "Indoor Plant",
        price: 299,
        rating: 4.5,
        image: "images/plants/money-plant.jpeg",
        description: "A trailing beauty with glossy, heart-shaped leaves, the Money Plant (Pothos) is one of the most popular indoor plants for good reason. It's practically unkillable, grows happily in water or soil, and is believed to bring good luck and prosperity into the home.",
        watering: "Water once every 7–10 days. Let the top inch of soil dry out between waterings to avoid root rot.",
        sunlight: "Thrives in bright, indirect light but tolerates low-light corners very well.",
        careInstructions: "Wipe the leaves occasionally to keep them dusk-free, trim leggy vines to encourage bushier growth, and feed with a diluted liquid fertilizer once a month during summer.",
        plantType: "Climbing / Trailing Vine (Foliage Plant)",
        suitablePlace: "Living rooms, office desks, hanging baskets and balconies",
        height: "30 cm – 2 m (climbs or trails with support)",
        potSize: "4–6 inch pot, repot as roots fill the container",
        careLevel: "Easy – Beginner Friendly",
        benefits: [
            "Naturally purifies indoor air",
            "Believed to bring good luck & prosperity",
            "Grows well in soil or a simple water vase",
            "Extremely low maintenance"
        ]
    },

    "snake-plant": {
        name: "Snake Plant",
        category: "Indoor Plant",
        price: 449,
        rating: 5.0,
        image: "images/plants/snake-plant.jpeg",
        description: "With tall, upright, sword-like leaves, the Snake Plant brings a striking architectural look to any room. It is one of the toughest houseplants around, tolerating dim light and irregular watering with ease.",
        watering: "Water every 2–3 weeks. Allow the soil to dry out completely between waterings — this plant hates soggy roots.",
        sunlight: "Adapts well from low light to bright indirect light.",
        careInstructions: "Avoid overwatering, dust the leaves occasionally so they can breathe, and repot only every 2–3 years since it prefers being slightly root-bound.",
        plantType: "Succulent (Foliage Plant)",
        suitablePlace: "Bedrooms, office desks and bathroom corners",
        height: "45 cm – 1.2 m",
        potSize: "6–8 inch pot with good drainage",
        careLevel: "Very Easy – Ideal for Beginners",
        benefits: [
            "Releases oxygen at night, great for bedrooms",
            "Filters toxins like formaldehyde & benzene",
            "Thrives on neglect and irregular care",
            "Sculptural look that suits any décor"
        ]
    },

    "jade-plant": {
        name: "Jade Plant",
        category: "Outdoor Plant",
        price: 399,
        rating: 4.0,
        image: "images/plants/jade-plant.jpeg",
        description: "The Jade Plant is a charming succulent shrub with thick, woody stems and glossy oval leaves. Often gifted as a symbol of friendship and good fortune, it slowly matures into a miniature tree-like form.",
        watering: "Water every 2 weeks. Let the soil dry out fully between waterings — it stores water in its leaves.",
        sunlight: "Full sun to bright light; 4–6 hours of direct sun outdoors keeps it compact and healthy.",
        careInstructions: "Use a well-draining succulent mix, prune to shape as it grows, and bring indoors or shelter it during frost or heavy rain.",
        plantType: "Succulent Shrub",
        suitablePlace: "Balconies, gardens, patios and sunny windowsills",
        height: "30 cm – 1.5 m (slow growing)",
        potSize: "6–10 inch pot with drainage holes",
        careLevel: "Easy",
        benefits: [
            "Believed to attract positive energy & prosperity",
            "Highly drought tolerant",
            "Can live for decades with minimal care",
            "Great low-water balcony plant"
        ]
    },

    "outdoor-palm": {
        name: "Outdoor Palm",
        category: "Outdoor Plant",
        price: 599,
        rating: 4.0,
        image: "images/plants/outdoor-palm.jpeg",
        description: "This ornamental Outdoor Palm brings an instant tropical, resort-style feel to any garden or entrance with its tall stem and gracefully arching, feathery fronds.",
        watering: "Water 2–3 times a week in summer; reduce to once a week in cooler months. Keep the soil moist but never waterlogged.",
        sunlight: "Full sun to partial shade.",
        careInstructions: "Trim yellowing fronds regularly, feed with a palm-specific fertilizer during the growing season, and mulch around the base to retain moisture.",
        plantType: "Ornamental Palm Tree",
        suitablePlace: "Gardens, entrances, poolside areas and terraces",
        height: "1.5 m – 4 m+ (grows taller with age)",
        potSize: "12–16 inch pot, or plant directly in the ground",
        careLevel: "Moderate",
        benefits: [
            "Instant tropical, resort-style landscaping look",
            "Excellent statement plant for entrances",
            "Handles heat and outdoor conditions well",
            "Long-lived, low-fuss outdoor greenery"
        ]
    },

    "rose": {
        name: "Rose Plant",
        category: "Flowering Plant",
        price: 349,
        rating: 4.0,
        image: "images/plants/rose.jpeg",
        description: "A timeless garden classic, the Rose Plant produces fragrant, colourful blooms that make any garden or balcony feel special. With the right care it flowers again and again through the season.",
        watering: "Water every 2–3 days, keeping the soil consistently moist. Water at the base to keep foliage dry and prevent fungal issues.",
        sunlight: "Full sun — at least 6 hours of direct sunlight daily for the best blooms.",
        careInstructions: "Deadhead spent flowers to encourage new blooms, prune during the dormant season, and feed monthly with a rose-specific fertilizer.",
        plantType: "Flowering Shrub",
        suitablePlace: "Garden beds, terrace pots and sunny balconies",
        height: "60 cm – 1.5 m",
        potSize: "10–12 inch pot",
        careLevel: "Moderate",
        benefits: [
            "Fragrant, colourful blooms for décor & gifting",
            "Attracts pollinators like bees & butterflies",
            "Repeat flowering with regular care",
            "Wide variety of bloom colours available"
        ]
    },

    "hibiscus": {
        name: "Hibiscus",
        category: "Flowering Plant",
        price: 299,
        rating: 4.5,
        image: "images/plants/hibiscus.jpeg",
        description: "The Hibiscus is a vibrant tropical shrub known for its large, trumpet-shaped flowers. In warm climates it can bloom almost year-round, adding a bold splash of colour to gardens and balconies.",
        watering: "Water every 2 days in summer to keep the soil moist; reduce frequency in winter.",
        sunlight: "Full sun — 5–6 hours of direct light daily for the most abundant flowering.",
        careInstructions: "Prune after each flowering flush, feed with a potassium-rich fertilizer for stronger blooms, and check regularly for pests like aphids.",
        plantType: "Flowering Shrub",
        suitablePlace: "Gardens, balconies and sunny terraces",
        height: "1 m – 2.5 m",
        potSize: "10–14 inch pot",
        careLevel: "Moderate",
        benefits: [
            "Large, showy blooms almost year-round",
            "Attracts butterflies and birds to the garden",
            "Flowers traditionally used in hair & herbal care",
            "Fast growing — great as a flowering hedge"
        ]
    },

    "aloe-vera": {
        name: "Aloe Vera",
        category: "Medicinal Plant",
        price: 249,
        rating: 4.0,
        image: "images/plants/aloe-vera.jpeg",
        description: "Aloe Vera is a hardy succulent prized for the soothing gel inside its thick, fleshy leaves. A staple of home remedies and skincare, it's as practical as it is easy to grow.",
        watering: "Water every 2–3 weeks. Let the soil dry out completely between waterings — this plant stores its own water.",
        sunlight: "Bright indirect to direct light; a few hours of gentle morning sun works best.",
        careInstructions: "Plant in a well-draining, sandy potting mix, avoid overwatering, and separate offset 'pups' from the base to propagate new plants.",
        plantType: "Succulent (Medicinal)",
        suitablePlace: "Kitchen gardens, sunny windowsills and balconies",
        height: "30 cm – 60 cm",
        potSize: "6–8 inch pot with drainage",
        careLevel: "Very Easy",
        benefits: [
            "Gel soothes burns, cuts & skin irritation",
            "Popular ingredient in skincare & haircare",
            "Helps purify indoor air",
            "Extremely drought hardy and low maintenance"
        ]
    },

    "tulsi": {
        name: "Tulsi",
        category: "Medicinal Plant",
        price: 149,
        rating: 5.0,
        image: "images/plants/tulsi.jpeg",
        description: "Tulsi, or Holy Basil, is a fragrant, sacred herb found in most Indian households. Its aromatic leaves are used in teas and home remedies, and the plant is easy to grow in a small courtyard pot.",
        watering: "Water daily or every alternate day, keeping the soil consistently moist but never waterlogged.",
        sunlight: "Full sun to partial sun — 4–6 hours of direct light daily.",
        careInstructions: "Pinch off flowering buds to keep the leaves tender and flavourful, harvest leaves regularly to encourage bushier growth, and use a well-draining pot.",
        plantType: "Aromatic Herb (Medicinal)",
        suitablePlace: "Courtyards, balconies, kitchen gardens and near entrances",
        height: "30 cm – 60 cm",
        potSize: "8–10 inch pot",
        careLevel: "Easy",
        benefits: [
            "Traditionally used to support immunity",
            "Considered sacred, grown in most Indian homes",
            "Natural aroma helps repel mosquitoes & insects",
            "Fresh leaves ready for tea, cooking & remedies"
        ]
    }

};


/* =====================================================
   PLANT DETAIL PAGE HELPERS
   ===================================================== */

/* True when the current page lives inside the /pages/ folder */

function isInPagesFolder() {

    return (
        window.location.pathname.indexOf("/pages/") !== -1
    );

}


/* Builds a correct relative link to the detail page
   regardless of whether we're at the site root or inside /pages/ */

function getDetailUrl(id) {

    const base =
        isInPagesFolder()
            ? ""
            : "pages/";

    return (
        base +
        "plant-detail.html?id=" +
        encodeURIComponent(id)
    );

}


/* Builds the star-rating icon markup used across the site */

function renderStars(rating) {

    let html = "";

    const fullStars =
        Math.floor(rating);

    const hasHalf =
        rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {

        html +=
            '<i class="fa-solid fa-star"></i>';

    }

    if (hasHalf) {

        html +=
            '<i class="fa-solid fa-star-half-stroke"></i>';

    }

    const filled =
        fullStars + (hasHalf ? 1 : 0);

    for (let i = filled; i < 5; i++) {

        html +=
            '<i class="fa-regular fa-star"></i>';

    }

    return html;

}


/* Builds one plant-card block (used for "You Might Also Like") --
   identical markup to the cards elsewhere on the site so all the
   existing add-to-cart / wishlist / navigate handlers just work */

function createPlantCardHTML(id, plant) {

    return `
        <div class="plant-card">

            <button class="wishlist-btn">
                <i class="fa-regular fa-heart"></i>
            </button>

            <div class="plant-image">
                <img src="../${plant.image}" alt="${plant.name}" loading="lazy">
            </div>

            <div class="plant-info">

                <small>${plant.category}</small>

                <h3>${plant.name}</h3>

                <div class="rating">
                    ${renderStars(plant.rating)}
                    <span>(${plant.rating.toFixed(1)})</span>
                </div>

                <div class="plant-bottom">

                    <strong>₹${plant.price}</strong>

                    <button class="add-cart-btn">
                        <i class="fa-solid fa-cart-plus"></i>
                        Add
                    </button>

                </div>

            </div>

        </div>
    `;

}


/* Renders the "You Might Also Like" grid -- every plant except
   the one currently being viewed */

function renderRelatedPlants(currentId) {

    const container =
        document.getElementById("relatedPlants");

    if (!container) {

        return;

    }

    let html = "";

    Object.keys(PLANT_DETAILS).forEach(function (id) {

        if (id === currentId) {

            return;

        }

        html +=
            createPlantCardHTML(
                id,
                PLANT_DETAILS[id]
            );

    });

    container.innerHTML = html;

}


/* Adds `qty` units of a product to the cart in a single update
   (avoids firing the "added to cart" alert multiple times) */

function addProductToCartWithQty(product, qty) {

    if (!product || qty < 1) {

        return;

    }

    let cart =
        getCart();

    const existing =
        cart.find(function (item) {

            return item.id === product.id;

        });

    if (existing) {

        existing.quantity += qty;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: qty

        });

    }

    saveCart(cart);
    updateCounts();

    alert(
        product.name +
        " added to cart 🛒"
    );

}


/* Main render for the dynamic plant detail page */

/* Builds a "different angle" image path for a plant.
   angleNumber 1 -> images/plants/money-plant.jpeg -> images/diff_angle/money-plant-diffangle.jpeg
   angleNumber 2 -> images/plants/money-plant.jpeg -> images/diff_angle/money-plant-diffangle2.jpeg */
function getDiffAngleImagePath(imagePath, angleNumber) {

    const parts = imagePath.split("/");
    const filename = parts[parts.length - 1];
    const dotIndex = filename.lastIndexOf(".");
    const base = filename.substring(0, dotIndex);
    const ext = filename.substring(dotIndex);

    const suffix =
        angleNumber && angleNumber > 1 ? "-diffangle" + angleNumber : "-diffangle";

    return "images/diff_angle/" + base + suffix + ext;

}

function renderPlantDetail() {

    const container =
        document.getElementById("plantDetailContainer");

    if (!container) {

        return;

    }

    const params =
        new URLSearchParams(window.location.search);

    const id =
        params.get("id");

    const plant =
        PLANT_DETAILS[id];

    if (!plant) {

        container.innerHTML = `
            <div class="detail-not-found">
                <i class="fa-solid fa-seedling"></i>
                <h2>Plant Not Found</h2>
                <p>We couldn't find the plant you're looking for.</p>
                <a href="plants.html" class="btn primary-btn">Browse Plants</a>
            </div>
        `;

        renderRelatedPlants(null);

        return;

    }

    document.title =
        plant.name + " | GreenLeaf";

    const product = {

        id: id,
        name: plant.name,
        price: plant.price,
        image: new URL("../" + plant.image, window.location.href).href,
        diffImage: new URL("../" + getDiffAngleImagePath(plant.image, 1), window.location.href).href,
        category: plant.category

    };

    const benefitsHTML =
        plant.benefits
            .map(function (b) {

                return `<li><i class="fa-solid fa-circle-check"></i> ${b}</li>`;

            })
            .join("");

    container.innerHTML = `

        <div class="detail-grid">

            <div class="detail-left">

                <div class="detail-image-box">

                    <div class="detail-thumb-list">

                        <button type="button" class="detail-thumb active" data-img="${product.image}">
                            <img src="${product.image}" alt="${plant.name}">
                        </button>

                        <button type="button" class="detail-thumb" data-img="${product.diffImage}">
                            <img src="${product.diffImage}" alt="${plant.name} different angle" onerror="this.closest('.detail-thumb').style.display='none'">
                        </button>

                    </div>

                    <div class="detail-main-img-wrap">
                        <img id="detailMainImage" src="${product.image}" alt="${plant.name}">
                    </div>

                </div>

                <div class="detail-care-box">
                    <h3><i class="fa-solid fa-hand-holding-heart"></i> Care Instructions</h3>
                    <p>${plant.careInstructions}</p>
                </div>

                <div class="detail-benefits-box">
                    <h3><i class="fa-solid fa-star"></i> Benefits &amp; Key Features</h3>
                    <ul class="benefits-list">
                        ${benefitsHTML}
                    </ul>
                </div>

            </div>

            <div class="detail-info">

                <small class="detail-category">${plant.category}</small>

                <h1 class="detail-title">${plant.name}</h1>

                <div class="rating detail-rating">
                    ${renderStars(plant.rating)}
                    <span>(${plant.rating.toFixed(1)})</span>
                </div>

                <div class="detail-price-row">
                    <strong class="detail-price">₹${plant.price}</strong>
                </div>

                <p class="detail-description">${plant.description}</p>

                <div class="qty-row">

                    <span class="qty-label">Quantity</span>

                    <div class="qty-selector">
                        <button type="button" class="qty-btn" id="qtyMinus">−</button>
                        <input type="text" id="detailQty" value="1" readonly>
                        <button type="button" class="qty-btn" id="qtyPlus">+</button>
                    </div>

                </div>

                <div class="detail-actions">

                    <div class="detail-actions-row">

                        <button class="btn primary-btn" id="detailAddCartBtn">
                            <i class="fa-solid fa-cart-plus"></i>
                            Add to Cart
                        </button>

                        <button class="btn secondary-btn wishlist-detail-btn" id="detailWishlistBtn" title="Add to Wishlist">
                            <i class="fa-regular fa-heart"></i>
                        </button>

                    </div>

                    <button class="btn buy-now-btn" id="detailBuyNowBtn">
                        <i class="fa-solid fa-bolt"></i>
                        Buy Now
                    </button>

                </div>

                <div class="spec-grid">

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-droplet"></i></div>
                        <div>
                            <h4>Watering</h4>
                            <p>${plant.watering}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-sun"></i></div>
                        <div>
                            <h4>Sunlight</h4>
                            <p>${plant.sunlight}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-seedling"></i></div>
                        <div>
                            <h4>Plant Type</h4>
                            <p>${plant.plantType}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-house"></i></div>
                        <div>
                            <h4>Suitable Place</h4>
                            <p>${plant.suitablePlace}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-ruler-vertical"></i></div>
                        <div>
                            <h4>Height / Size</h4>
                            <p>${plant.height}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-circle-dot"></i></div>
                        <div>
                            <h4>Pot Size</h4>
                            <p>${plant.potSize}</p>
                        </div>
                    </div>

                    <div class="spec-item">
                        <div class="feature-icon"><i class="fa-solid fa-hand-sparkles"></i></div>
                        <div>
                            <h4>Care Level</h4>
                            <p>${plant.careLevel}</p>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    `;


    /* ---------- Image thumbnails (different angle) ---------- */

    const detailMainImage =
        document.getElementById("detailMainImage");

    const detailThumbs =
        document.querySelectorAll(".detail-thumb");

    detailThumbs.forEach(function (thumb) {

        thumb.addEventListener("click", function () {

            detailThumbs.forEach(function (t) {
                t.classList.remove("active");
            });

            thumb.classList.add("active");

            detailMainImage.src = thumb.dataset.img;

        });

    });


    /* ---------- Quantity selector ---------- */

    const qtyInput =
        document.getElementById("detailQty");

    const qtyMinusBtn =
        document.getElementById("qtyMinus");

    /* At quantity 1 the "-" button is fully disabled (no hover/click) */

    const updateQtyMinusState = function () {

        const qty =
            parseInt(qtyInput.value, 10) || 1;

        qtyMinusBtn.disabled = qty <= 1;

    };

    updateQtyMinusState();

    qtyMinusBtn.addEventListener("click", function () {

        let qty =
            parseInt(qtyInput.value, 10) || 1;

        if (qty > 1) {

            qty -= 1;

        }

        qtyInput.value = qty;

        updateQtyMinusState();

    });

    document
        .getElementById("qtyPlus")
        .addEventListener("click", function () {

            let qty =
                parseInt(qtyInput.value, 10) || 1;

            qty += 1;

            qtyInput.value = qty;

            updateQtyMinusState();

        });


    /* ---------- Add to Cart ---------- */

    document
        .getElementById("detailAddCartBtn")
        .addEventListener("click", function () {

            const qty =
                parseInt(qtyInput.value, 10) || 1;

            addProductToCartWithQty(product, qty);

        });


    /* ---------- Wishlist ---------- */

    const wishlistBtn =
        document.getElementById("detailWishlistBtn");

    const wishlist =
        getWishlist();

    const alreadyWishlisted =
        wishlist.some(function (item) {

            return item.id === product.id;

        });

    if (alreadyWishlisted) {

        wishlistBtn.classList.add("active");

        wishlistBtn.innerHTML =
            '<i class="fa-solid fa-heart"></i>';

    }

    wishlistBtn.addEventListener("click", function () {

        toggleProductWishlist(
            product,
            wishlistBtn
        );

        /* toggleProductWishlist swaps the icon only -- keep icon-only, no label */

        const icon =
            wishlistBtn.classList.contains("active")
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';

        wishlistBtn.innerHTML =
            icon;

    });


    /* ---------- Buy Now ---------- */

    document
        .getElementById("detailBuyNowBtn")
        .addEventListener("click", function () {

            const qty =
                parseInt(qtyInput.value, 10) || 1;

            placeDirectOrder(product, qty);

            showOrderConfirmedPopup();

        });


    /* ---------- You Might Also Like ---------- */

    renderRelatedPlants(id);


    /* ---------- Related plants carousel arrows ---------- */

    const relatedTrack =
        document.getElementById("relatedPlants");

    const relatedPrevBtn =
        document.getElementById("relatedPrevBtn");

    const relatedNextBtn =
        document.getElementById("relatedNextBtn");

    if (relatedTrack && relatedPrevBtn && relatedNextBtn) {

        const scrollRelated = function (direction) {

            const card =
                relatedTrack.querySelector(".plant-card");

            const cardWidth =
                card
                    ? card.getBoundingClientRect().width + 22
                    : 260;

            relatedTrack.scrollBy({
                left: direction * cardWidth * 2,
                behavior: "smooth"
            });

        };

        relatedPrevBtn.addEventListener("click", function () {

            scrollRelated(-1);

        });

        relatedNextBtn.addEventListener("click", function () {

            scrollRelated(1);

        });

    }

}


/* =====================================================
   BUTTON CLICK HANDLING
   ===================================================== */

document.addEventListener(
    "click",
    function(event) {


        /* ===============================
           ADD TO CART
           =============================== */

        const cartButton =
            event.target.closest(
                ".add-cart-btn"
            );


        if (cartButton) {

            const card =
                cartButton.closest(
                    ".plant-card"
                );


            if (card) {

                const product =
                    getProductFromCard(card);


                addProductToCart(product);

            }

        }


        /* ===============================
           WISHLIST
           =============================== */

        const wishlistButton =
            event.target.closest(
                ".wishlist-btn"
            );


        if (wishlistButton) {

            const card =
                wishlistButton.closest(
                    ".plant-card"
                );


            if (card) {

                const product =
                    getProductFromCard(card);


                toggleProductWishlist(
                    product,
                    wishlistButton
                );

            }

        }


        /* ===============================
           OPEN PLANT DETAIL PAGE
           (click anywhere on a plant card
           that isn't the cart/wishlist button)
           =============================== */

        const clickedCard =
            event.target.closest(
                ".plant-card"
            );


        if (
            clickedCard &&
            !cartButton &&
            !wishlistButton
        ) {

            const product =
                getProductFromCard(clickedCard);


            if (product) {

                window.location.href =
                    getDetailUrl(product.id);

            }

        }

    }
);


/* =====================================================
   APPLY SAVED PROFILE TO SIDEBAR
   ===================================================== */

function applySidebarProfile() {

    const nameElement =
        document.getElementById("sidebarName");

    const emailElement =
        document.getElementById("sidebarEmail");


    if (!nameElement && !emailElement) {

        return;

    }


    const profile =
        getProfile();


    if (!profile) {

        return;

    }


    if (nameElement && profile.fullname) {

        nameElement.textContent = profile.fullname;

    }


    if (emailElement && profile.email) {

        emailElement.textContent = profile.email;

    }

}


/* =====================================================
   PAGE LOAD
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initAuthGate();

        renderPlantDetail();

        updateCounts();

        updateWishlistButtons();

        applySidebarProfile();

    }
);