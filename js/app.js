import { store } from './store.js';
import { renderHeader, renderFooter, renderCartDrawer } from './components.js';
import { router } from './router.js';

// Setup global actions for inline event handlers (like cart quantity updates)
window.appActions = {
    updateQty: (id, delta) => store.updateQuantity(id, delta),
    removeFromCart: (id) => store.removeFromCart(id),
    toggleCart: () => store.toggleCart()
};

const updateAppShell = () => {
    // Render Header & Footer once (they are static mostly)
    const headerEl = document.getElementById('site-header');
    if (!headerEl.innerHTML) headerEl.innerHTML = renderHeader();
    
    const footerEl = document.getElementById('site-footer');
    if (!footerEl.innerHTML) footerEl.innerHTML = renderFooter();
    
    // Update Cart Badge
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
        badge.textContent = store.getCartCount();
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
    
    // Render Cart Drawer
    const cartContainer = document.getElementById('cart-drawer-container');
    const state = store.getState();
    cartContainer.innerHTML = renderCartDrawer();
    
    if (state.cartOpen) {
        cartContainer.classList.add('cart-open');
    } else {
        cartContainer.classList.remove('cart-open');
    }
    
    // Bind Event Listeners for Cart Drawer
    const closeBtn = document.getElementById('close-cart-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => store.toggleCart(false));
    
    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', () => store.toggleCart(false));
    
    const openBtn = document.getElementById('open-cart-btn');
    // Ensure we don't attach multiple times
    const newOpenBtn = openBtn.cloneNode(true);
    openBtn.parentNode.replaceChild(newOpenBtn, openBtn);
    newOpenBtn.addEventListener('click', () => store.toggleCart(true));
    
    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            headerEl.classList.add('scrolled');
        } else {
            headerEl.classList.remove('scrolled');
        }
    }, { passive: true });
};

// Initialize App
const initApp = async () => {
    // Fetch data from Supabase (or fallback)
    await store.initData();
    
    // Subscribe to state changes
    store.subscribe(() => {
        updateAppShell();
    });
    
    // Initial Render
    updateAppShell();
    
    // Initialize Router
    router.init();
};

document.addEventListener('DOMContentLoaded', initApp);
