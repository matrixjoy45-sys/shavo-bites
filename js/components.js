import { store } from './store.js';

// SVG Icons
export const Icons = {
    Cart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
    Menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
    User: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    Close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    Plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Minus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
};

export const renderHeader = () => {
    return `
        <div class="container flex justify-between items-center">
            <a href="/" data-link class="logo flex items-center">
                <picture>
                    <source srcset="/assets/images/logo-master.webp" type="image/webp">
                    <img src="/assets/images/logo-master.png" alt="SHAVO BITES Logo" style="height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                </picture>
            </a>
            
            <nav class="hidden md:flex gap-lg">
                <a href="/" data-link class="nav-link">Home</a>
                <a href="/menu" data-link class="nav-link">Menu</a>
                <a href="/profile" data-link class="nav-link">Profile</a>
            </nav>
            
            <div class="flex items-center gap-md">
                <button class="cart-btn" id="open-cart-btn">
                    ${Icons.Cart}
                    <span class="cart-badge" id="cart-count-badge">0</span>
                </button>
                <button class="btn-icon hidden" id="mobile-menu-btn">
                    ${Icons.Menu}
                </button>
            </div>
        </div>
    `;
};

export const renderFooter = () => {
    return `
        <div class="glass" style="margin-top: auto; padding: var(--space-xl) 0;">
            <div class="container grid md:grid-cols-4 gap-xl">
                <div>
                    <picture>
                        <source srcset="/assets/images/logo-master.webp" type="image/webp">
                        <img src="/assets/images/logo-master.png" alt="SHAVO BITES Logo" style="height: 64px; width: auto; object-fit: contain; margin-bottom: 1rem;">
                    </picture>
                    <p class="text-muted text-sm">Big Flavor. Every Bite.<br>Premium delivery-only shawarma.</p>
                </div>
                <div>
                    <h4 class="mb-md">Quick Links</h4>
                    <ul class="flex-col gap-sm flex">
                        <li><a href="/" data-link class="text-muted hover:text-white">Home</a></li>
                        <li><a href="/menu" data-link class="text-muted hover:text-white">Menu</a></li>
                        <li><a href="/profile" data-link class="text-muted hover:text-white">My Account</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-md">Legal</h4>
                    <ul class="flex-col gap-sm flex">
                        <li><a href="#" class="text-muted">Privacy Policy</a></li>
                        <li><a href="#" class="text-muted">Terms & Conditions</a></li>
                        <li><a href="#" class="text-muted">Delivery Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-md">Contact</h4>
                    <p class="text-muted text-sm mb-sm">Email: hello@shavobites.com</p>
                    <p class="text-muted text-sm mb-sm">Phone: +1 234 567 8900</p>
                    <div class="flex gap-sm mt-md">
                        <!-- Social Icons Placeholders -->
                        <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    </div>
                </div>
            </div>
            <div class="container mt-xl text-center text-sm text-muted" style="border-top: 1px solid var(--color-border); padding-top: var(--space-lg);">
                &copy; ${new Date().getFullYear()} SHAVO BITES. All rights reserved.
            </div>
        </div>
    `;
};

export const renderCartDrawer = () => {
    const state = store.getState();
    const cart = state.cart;
    const total = store.getCartTotal();
    
    let cartItemsHtml = '';
    
    if (cart.length === 0) {
        cartItemsHtml = `
            <div class="flex flex-col items-center justify-center h-100 text-center text-muted" style="height: 100%;">
                ${Icons.Cart}
                <p class="mt-md">Your cart is empty</p>
                <a href="/menu" data-link class="btn btn-primary mt-lg" id="cart-start-order">Start Ordering</a>
            </div>
        `;
    } else {
        cartItemsHtml = cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
                <div class="flex-1">
                    <div class="flex justify-between">
                        <h4 class="text-sm font-bold">${item.product.name}</h4>
                        <button class="btn-icon" style="width:20px;height:20px;color:var(--color-error);" onclick="window.appActions.removeFromCart('${item.cartItemId}')">
                            ${Icons.Trash}
                        </button>
                    </div>
                    <div class="text-xs text-muted mb-sm">
                        ${item.extras.map(e => `+ ${e.name}`).join(', ')}
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="text-primary font-bold">$${(item.product.price + item.extras.reduce((s,e)=>s+e.price,0)).toFixed(2)}</div>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="window.appActions.updateQty('${item.cartItemId}', -1)">${Icons.Minus}</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="window.appActions.updateQty('${item.cartItemId}', 1)">${Icons.Plus}</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    return `
        <div class="cart-overlay" id="cart-overlay"></div>
        <div class="cart-drawer" id="cart-drawer">
            <div class="cart-header">
                <h3>Your Order</h3>
                <button class="btn-icon" id="close-cart-btn">${Icons.Close}</button>
            </div>
            <div class="cart-body">
                ${cartItemsHtml}
            </div>
            ${cart.length > 0 ? `
            <div class="cart-footer">
                <div class="flex justify-between mb-sm text-sm">
                    <span>Subtotal</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between mb-md text-sm text-muted">
                    <span>Delivery</span>
                    <span>$2.99</span>
                </div>
                <div class="flex justify-between mb-lg font-bold text-lg">
                    <span>Total</span>
                    <span class="text-primary">$${(total + 2.99).toFixed(2)}</span>
                </div>
                <a href="/checkout" data-link class="btn btn-primary" style="width:100%;" id="cart-checkout-btn">Proceed to Checkout</a>
            </div>
            ` : ''}
        </div>
    `;
};
