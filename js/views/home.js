import { Icons } from '../components.js';
import { store } from '../store.js';

export const renderHome = async () => {
    // Get popular items from store
    const { products } = store.getState();
    const popularItems = products.slice(0, 3);
    
    const productCards = popularItems.map((p, i) => `
        <div class="glass-card product-card fade-in stagger-${i+1}">
            <div class="product-img-wrapper">
                <img src="${p.image_url || p.image}" alt="${p.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <div class="flex justify-between items-center mb-xs">
                    <h3 class="product-title">${p.name}</h3>
                    ${p.spiceLevel === 'spicy' || p.spice_level === 'spicy' ? '<span class="badge badge-primary">Spicy</span>' : ''}
                </div>
                <p class="product-desc">${p.description}</p>
                <div class="product-price-row">
                    <span class="product-price">$${Number(p.price).toFixed(2)}</span>
                    <a href="/menu" data-link class="btn btn-outline btn-sm">Order</a>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="page-enter">
            <!-- Hero Section -->
            <section class="relative flex items-center" style="min-height: 90vh; padding-top: 80px;">
                <!-- Background Image & Gradient -->
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden;">
                    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 100%); z-index:1;"></div>
                    <img src="./assets/images/hero.webp" style="width:100%; height:100%; object-fit:cover; transform:scale(1.05);" alt="Hero">
                </div>
                
                <div class="container slide-up">
                    <div style="max-width: 600px;">
                        <h1 class="mb-md" style="text-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                            <span class="text-primary">BIG FLAVOR.</span><br>
                            EVERY BITE.
                        </h1>
                        <p class="text-lg text-muted mb-lg">
                            Experience the most luxurious delivery-only shawarma in town. Premium ingredients, crafted to perfection.
                        </p>
                        <div class="flex gap-md">
                            <a href="/menu" data-link class="btn btn-primary">Order Now</a>
                            <a href="#popular" class="btn btn-outline">Explore Menu</a>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Popular Items -->
            <section id="popular" class="section">
                <div class="container">
                    <h2 class="section-title">Popular Items</h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
                        ${productCards}
                    </div>
                </div>
            </section>
            
            <!-- Why Choose Us -->
            <section class="section" style="background: rgba(255,255,255,0.02);">
                <div class="container">
                    <h2 class="section-title">Why SHAVO BITES?</h2>
                    <div class="grid md:grid-cols-3 gap-lg text-center">
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">${Icons.Cart}</div>
                            <h3 class="mb-sm">Fast Delivery</h3>
                            <p class="text-muted">20-30 minutes guaranteed delivery to your doorstep.</p>
                        </div>
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            </div>
                            <h3 class="mb-sm">Premium Quality</h3>
                            <p class="text-muted">Michelin-star quality ingredients, freshly prepared daily.</p>
                        </div>
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <div class="text-primary mb-md flex justify-center" style="transform: scale(2);">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                            </div>
                            <h3 class="mb-sm">24/7 Support</h3>
                            <p class="text-muted">Dedicated WhatsApp and live tracking for all orders.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
};
