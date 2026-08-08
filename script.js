// =========================================================================
// 1. INTERACTIVE WHEEL ROTATION CONTROL
// =========================================================================
const container = document.getElementById('wheelContainer');
const wheel = document.getElementById('spinningWheel');
let currentRotation = 0;
let lastTouchY = 0;

function applyWheelRotation() {
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    // Every gondola reads this custom property to counter-rotate itself
    // by the same live amount, keeping images/labels upright (Ferris wheel effect).
    wheel.style.setProperty('--rotation', `${currentRotation}deg`);
}

if (container && wheel) {
    // Desktop mouse wheel scroll rotation
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        currentRotation += e.deltaY * 0.2;
        applyWheelRotation();
    }, { passive: false });

    // Mobile touch controls start track
    container.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    // Mobile drag swipe rotation logic
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const currentTouchY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentTouchY;
        currentRotation += deltaY * 0.5;
        applyWheelRotation();
        lastTouchY = currentTouchY;
    }, { passive: false });
}


// =========================================================================
// 2. SHOPPING CART — SHARED HELPERS
// =========================================================================

// Every price in this site is Bangladeshi Taka. Pass in a plain number
// (e.g. 25) or a string that may already contain symbols/commas, and this
// always returns a clean "৳25" style string.
function formatBDT(amount) {
    const num = parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    // Show decimals only if the price actually has cents/paisa.
    const isWhole = Number.isInteger(num);
    return `BDT ${isWhole ? num : num.toFixed(2)}`;
}

// Adds a product to the cart in localStorage (used by both the shop page
// and the homepage product modal). If the same product is already in the
// cart, its quantity is increased instead of creating a duplicate row.
function addToCart(product) {
    if (!product || !product.title) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.title === product.title);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            title: product.title,
            price: product.price,
            images: product.images || (product.image ? [product.image] : []),
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalItems = cart.reduce((sum, item) => {
        return sum + (item.quantity || 1);
    }, 0);

    const badge = document.getElementById('cartCount');

    if (!badge) return;

    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'flex';
        badge.style.opacity = '1';
    } else {
        badge.textContent = '';
        badge.style.display = 'none';
        badge.style.opacity = '0';
    }
}


// =========================================================================
// 3. PAGE INITIALIZATION LISTENER
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});

// 3D STACK CAROUSEL & POP-UP MODAL LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('stackContainer');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');

    if (!container) return;

    let slots = ['slot-far-left', 'slot-mid-left', 'slot-center', 'slot-mid-right', 'slot-far-right'];
    const cards = Array.from(container.querySelectorAll('.stack-card'));

    function updateCardPositions() {
        cards.forEach((card, index) => {
            card.className = `stack-card ${slots[index]}`;
        });
    }

    function rotateRight() {
        slots.unshift(slots.pop());
        updateCardPositions();
    }

    function rotateLeft() {
        slots.push(slots.shift());
        updateCardPositions();
    }
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCartBtn = document.getElementById('modalAddToCart');
const modalBuyNowBtn = document.getElementById('modalBuyNow');

// Holds the product that's currently shown in the homepage pop-up so the
// Add to Basket / Buy Now buttons know what to add.
let currentStackProduct = null;

// OPEN MODAL
cards.forEach((card) => {
    card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img && modal && modalImg) {
            modalImg.src = img.src;

            const title = card.getAttribute('data-title') || img.alt || "Handmade Creation";
            const price = card.getAttribute('data-price') || "15";
            const priceLabel = formatBDT(price);

            if (modalTitle) {
                modalTitle.textContent = title;
            }

            if (modalPrice) {
                modalPrice.textContent = priceLabel;
            }

            currentStackProduct = { title, price: priceLabel, images: [img.src] };

            // Add 'active' class instead of changing display style directly
            modal.classList.add('active');
            container.classList.add('modal-active');
        }
    });
});

// ADD TO BASKET / BUY NOW from the homepage pop-up
if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentStackProduct) {
            addToCart(currentStackProduct);
            const original = modalAddToCartBtn.textContent;
            modalAddToCartBtn.textContent = 'Added ✓';
            setTimeout(() => { modalAddToCartBtn.textContent = original; }, 1200);
        }
    });
}

if (modalBuyNowBtn) {
    modalBuyNowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentStackProduct) {
            addToCart(currentStackProduct);
            window.location.href = 'cart.html';
        }
    });
}

// CLOSE MODAL
if (modal) {
    modal.addEventListener('click', (e) => {
        // Don't close when clicking the action buttons inside the modal
        if (e.target === modalAddToCartBtn || e.target === modalBuyNowBtn) return;
        // Remove 'active' class to trigger the smooth fade-out animation
        modal.classList.remove('active');
        container.classList.remove('modal-active');
    });
}
// SWIPE GESTURES (UPDATED WITH DIRECTIONAL FILTER)
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Check:
        // 1. Horizontal movement must be greater than vertical movement (User is swiping sideways, not scrolling).
        // 2. Horizontal movement must exceed 40px threshold.
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    }, { passive: true });

    container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const diffX = startX - e.clientX;
        const diffY = startY - e.clientY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    });

    container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        const diffX = startX - e.clientX;
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) rotateRight();
            else rotateLeft();
        }
        isDragging = false;
    });
});



// Custom Order Modal Handler
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openCustomModal');
    const closeBtn = document.getElementById('closeCustomModal');
    const customModal = document.getElementById('customOrderModal');

    if (!openBtn || !closeBtn || !customModal) return;

    // Open Modal
    openBtn.addEventListener('click', () => {
        customModal.classList.add('active');
    });

    // Close via Close Button (X)
    closeBtn.addEventListener('click', () => {
        customModal.classList.remove('active');
    });

    // Close when clicking outside card area
    customModal.addEventListener('click', (e) => {
        if (e.target === customModal) {
            customModal.classList.remove('active');
        }
    });
});
