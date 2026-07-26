import { Icons } from '../components.js';
import { store } from '../store.js';

export const renderMenu = async () => {
    const { products } = store.getState();
    // Group products by category
    const categories = ['shawarma', 'sides', 'drinks'];
    
    let menuHtml = '';
    
    categories.forEach(cat => {
        const catProducts = products.filter(p => p.category === cat);
        if (catProducts.length === 0) return;
        
        const catTitle = cat.charAt(0).toUpperCase() + cat.slice(1);
        
        const cardsHtml = catProducts.map(p => {
            const ingr = p.ingredients ? (typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients).join(', ') : '';
            return `
            <div class="glass-card product-card">
                <div class="product-img-wrapper">
                    <img src="${p.image_url || p.image}" alt="${p.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="flex justify-between items-center mb-sm">
                        <h3 class="product-title">${p.name}</h3>
                        ${p.spiceLevel === 'spicy' || p.spice_level === 'spicy' ? '<span class="badge badge-primary">Spicy</span>' : ''}
                    </div>
                    <p class="text-xs text-muted mb-sm">Ingredients: ${ingr}</p>
                    <p class="product-desc">${p.description}</p>
                    <div class="product-price-row">
                        <span class="product-price">₹${Number(p.price).toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm" onclick="window.menuActions.openCustomizeModal('${p.id}')">Add</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        menuHtml += `
            <div class="mb-xl">
                <h2 class="text-primary mb-lg uppercase" style="letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">${catTitle}</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });

    return `
        <div class="page-enter section">
            <div class="container">
                <div class="text-center mb-2xl">
                    <h1 class="mb-md">Our <span class="text-primary">Menu</span></h1>
                    <p class="text-muted max-w-lg mx-auto">Explore our premium selection of shawarmas, sides, and signature drinks.</p>
                </div>
                
                ${menuHtml}
            </div>
            
            <!-- Customize Modal Container -->
            <div id="customize-modal-container"></div>
        </div>
    `;
};

// Mount function for logic specific to this view
renderMenu.mount = () => {
    // Setup actions for menu view
    window.menuActions = {
        openCustomizeModal: (productId) => {
            const { products, extras } = store.getState();
            // Handle numeric IDs vs string IDs safely
            const product = products.find(p => String(p.id) === String(productId));
            if (!product) return;
            
            const container = document.getElementById('customize-modal-container');
            
            // Build Extras HTML
            const extrasHtml = extras.map(ext => `
                <label class="flex justify-between items-center p-sm glass mb-sm rounded" style="border-radius: var(--radius-sm); cursor: pointer;">
                    <div class="flex items-center gap-sm">
                        <input type="checkbox" value="${ext.id}" class="extra-checkbox" data-price="${ext.price}" data-name="${ext.name}">
                        <span>${ext.name}</span>
                    </div>
                    <span class="text-primary">+₹${Number(ext.price).toFixed(2)}</span>
                </label>
            `).join('');

            container.innerHTML = `
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 300;" id="modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 301; width: 90%; max-width: 500px; padding: var(--space-lg); display: flex; flex-direction: column; max-height: 90vh; overflow-y: auto;">
                    <div class="flex justify-between items-center mb-md">
                        <h3>Customize ${product.name}</h3>
                        <button class="btn-icon" id="close-modal-btn">${Icons.Close}</button>
                    </div>
                    
                    <div class="mb-md">
                        <img src="${product.image_url || product.image}" alt="${product.name}" style="width:100%; height:200px; object-fit:cover; border-radius:var(--radius-sm);">
                    </div>
                    
                    <div class="mb-lg">
                        <h4 class="mb-sm text-primary">Extras & Add-ons</h4>
                        ${extrasHtml}
                    </div>
                    
                    <div class="flex justify-between items-center mb-lg">
                        <span>Quantity</span>
                        <div class="qty-control">
                            <button class="qty-btn" id="modal-qty-minus">${Icons.Minus}</button>
                            <span class="qty-val" id="modal-qty-val">1</span>
                            <button class="qty-btn" id="modal-qty-plus">${Icons.Plus}</button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-full" id="add-to-cart-confirm" style="width:100%;">
                        Add to Cart - ₹<span id="modal-total-price">${Number(product.price).toFixed(2)}</span>
                    </button>
                </div>
            `;
            
            // Logic
            let qty = 1;
            let currentPrice = Number(product.price);
            let selectedExtras = [];
            
            const updatePrice = () => {
                const extrasTotal = selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
                const total = (currentPrice + extrasTotal) * qty;
                document.getElementById('modal-total-price').textContent = total.toFixed(2);
            };
            
            // Events
            document.getElementById('close-modal-btn').onclick = () => container.innerHTML = '';
            document.getElementById('modal-overlay').onclick = () => container.innerHTML = '';
            
            document.getElementById('modal-qty-minus').onclick = () => {
                if (qty > 1) {
                    qty--;
                    document.getElementById('modal-qty-val').textContent = qty;
                    updatePrice();
                }
            };
            
            document.getElementById('modal-qty-plus').onclick = () => {
                qty++;
                document.getElementById('modal-qty-val').textContent = qty;
                updatePrice();
            };
            
            document.querySelectorAll('.extra-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedExtras.push({
                            id: e.target.value,
                            name: e.target.getAttribute('data-name'),
                            price: parseFloat(e.target.getAttribute('data-price'))
                        });
                    } else {
                        selectedExtras = selectedExtras.filter(ext => ext.id !== e.target.value);
                    }
                    updatePrice();
                });
            });
            
            document.getElementById('add-to-cart-confirm').onclick = () => {
                store.addToCart(product, qty, selectedExtras);
                container.innerHTML = ''; // close modal
            };
        }
    };
};
