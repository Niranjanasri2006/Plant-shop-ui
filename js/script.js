/* =====================================================
   GREENLEAF - COMMON SCRIPT
   CART + WISHLIST
   ===================================================== */


/* =====================================================
   GET CART
   ===================================================== */

function getCart() {

    return JSON.parse(
        localStorage.getItem("greenleafCart")
    ) || [];

}


/* =====================================================
   SAVE CART
   ===================================================== */

function saveCart(cart) {

    localStorage.setItem(
        "greenleafCart",
        JSON.stringify(cart)
    );

}


/* =====================================================
   GET WISHLIST
   ===================================================== */

function getWishlist() {

    return JSON.parse(
        localStorage.getItem("greenleafWishlist")
    ) || [];

}


/* =====================================================
   SAVE WISHLIST
   ===================================================== */

function saveWishlist(wishlist) {

    localStorage.setItem(
        "greenleafWishlist",
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


    return {

        id: name
            .toLowerCase()
            .replace(/\s+/g, "-"),

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
        localStorage.getItem("greenleafProfile")
    ) || null;

}


function saveProfile(profile) {

    localStorage.setItem(
        "greenleafProfile",
        JSON.stringify(profile)
    );

}


/* =====================================================
   ORDERS
   ===================================================== */

function getOrders() {

    return JSON.parse(
        localStorage.getItem("greenleafOrders")
    ) || [];

}


function saveOrders(orders) {

    localStorage.setItem(
        "greenleafOrders",
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


/* =====================================================
   SAVED ADDRESS
   ===================================================== */

function getAddress() {

    return JSON.parse(
        localStorage.getItem("greenleafAddress")
    ) || null;

}


function saveAddress(address) {

    localStorage.setItem(
        "greenleafAddress",
        JSON.stringify(address)
    );

}


/* =====================================================
   LOGIN STATE
   ===================================================== */

/* No key saved yet = user hasn't logged in through the form yet */

function isLoggedIn() {

    return localStorage.getItem("greenleafLoggedIn") === "true";

}


function setLoggedIn(value) {

    localStorage.setItem(
        "greenleafLoggedIn",
        value ? "true" : "false"
    );

}


function logoutUser() {

    setLoggedIn(false);

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

        updateCounts();

        updateWishlistButtons();

        applySidebarProfile();

    }
);