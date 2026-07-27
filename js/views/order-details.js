import { store } from '../store.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

export const renderOrderDetails = async () => {
    return `
        <div class="page-enter section">
            <div class="container" style="max-width: 800px;" id="order-details-container">
                <!-- Skeleton Loader -->
                <h1 class="mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: 250px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px;" class="animate-pulse"></div>
                </h1>
                
                <div class="glass-card mb-lg p-lg" style="padding: var(--space-xl);">
                    <div style="width: 100%; height: 60px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 2rem;" class="animate-pulse"></div>
                    <div class="grid md:grid-cols-2 gap-xl mb-xl">
                        <div>
                            <div style="width: 150px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 12px;" class="animate-pulse"></div>
                            <div style="width: 200px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px;" class="animate-pulse"></div>
                            <div style="width: 180px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px;" class="animate-pulse"></div>
                        </div>
                        <div>
                            <div style="width: 150px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 12px;" class="animate-pulse"></div>
                            <div style="width: 100px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 8px;" class="animate-pulse"></div>
                        </div>
                    </div>
                    <div style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border-radius: 8px;" class="animate-pulse"></div>
                </div>
            </div>
        </div>
        <style>
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
            
            /* Timeline Styles */
            .timeline-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                margin-bottom: 2rem;
                padding-bottom: 2rem;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                overflow-x: auto;
            }
            .timeline-container::before {
                content: '';
                position: absolute;
                top: 15px;
                left: 0;
                right: 0;
                height: 2px;
                background: rgba(255,255,255,0.1);
                z-index: 1;
            }
            .timeline-step {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 80px;
            }
            .timeline-dot {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--color-surface);
                border: 2px solid rgba(255,255,255,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                transition: all 0.3s ease;
            }
            .timeline-label {
                font-size: 0.75rem;
                color: var(--color-text-muted);
                text-align: center;
                transition: all 0.3s ease;
            }
            .timeline-step.active .timeline-dot {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: #000;
                box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
            }
            .timeline-step.active .timeline-label {
                color: var(--color-primary);
                font-weight: bold;
            }
            .timeline-step.completed .timeline-dot {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: #000;
            }
            .timeline-step.completed .timeline-label {
                color: var(--color-text-main);
            }
            .timeline-step.cancelled .timeline-dot {
                background: var(--color-error);
                border-color: var(--color-error);
                color: #fff;
            }
            .timeline-step.cancelled .timeline-label {
                color: var(--color-error);
            }
            
            /* For progress bar fill */
            .timeline-progress {
                position: absolute;
                top: 15px;
                left: 0;
                height: 2px;
                background: var(--color-primary);
                z-index: 1;
                transition: width 0.5s ease;
            }
        </style>
    `;
};

renderOrderDetails.mount = async (params) => {
    const container = document.getElementById('order-details-container');
    if (!container || !params || !params.id) return;
    
    const orderId = params.id;
    const state = store.getState();
    const profile = state.customerProfile;
    
    if (!profile) {
        // Not logged in or no profile
        router.navigate('/login');
        return;
    }
    
    try {
        // Fetch order
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
        if (error || !order) {
            throw new Error("Order not found");
        }
        
        // Authorization Check
        if (order.customer_id !== profile.id) {
            container.innerHTML = `
                <div class="glass-card text-center" style="padding: var(--space-xl); margin-top: 2rem;">
                    <div class="text-error mb-md" style="font-size: 3rem;">🚫</div>
                    <h2 class="mb-sm">Access Denied</h2>
                    <p class="text-muted mb-lg">This order does not belong to your account.</p>
                    <a href="/my-orders" data-link class="btn btn-primary">Back to My Orders</a>
                </div>
            `;
            return;
        }
        
        // Render View
        renderView(container, order, profile);
        
    } catch (err) {
        console.error("Order details error:", err);
        container.innerHTML = `
            <div class="glass-card text-center" style="padding: var(--space-xl); margin-top: 2rem;">
                <div class="text-error mb-md" style="font-size: 3rem;">⚠️</div>
                <h3 class="mb-sm">Order Not Found</h3>
                <p class="text-muted mb-lg">We couldn't find the requested order.</p>
                <a href="/my-orders" data-link class="btn btn-primary">Back to My Orders</a>
            </div>
        `;
    }
};

const renderView = (container, order, profile) => {
    const orderDate = new Date(order.created_at);
    const dateStr = orderDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Timeline logic
    const statuses = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
    const currentIdx = statuses.indexOf(order.status);
    
    let isCancelled = order.status === 'Cancelled';
    
    let timelineHtml = '';
    if (isCancelled) {
        timelineHtml = `
            <div class="timeline-container">
                <div class="timeline-step cancelled">
                    <div class="timeline-dot">✕</div>
                    <div class="timeline-label">Order Cancelled</div>
                </div>
            </div>
        `;
    } else {
        const progressWidth = currentIdx >= 0 ? (currentIdx / (statuses.length - 1)) * 100 : 0;
        
        timelineHtml = `
            <div class="timeline-container">
                <div class="timeline-progress" style="width: ${progressWidth}%;"></div>
                ${statuses.map((s, i) => {
                    let classes = '';
                    let icon = '•';
                    if (i < currentIdx) {
                        classes = 'completed';
                        icon = '✓';
                    } else if (i === currentIdx) {
                        classes = 'active';
                        icon = '•';
                    }
                    return `
                        <div class="timeline-step ${classes}">
                            <div class="timeline-dot">${icon}</div>
                            <div class="timeline-label">${s}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Items
    const itemsHtml = order.items.map(item => {
        const itemTotal = (item.product.price + item.extras.reduce((sum, e) => sum + e.price, 0)) * item.quantity;
        return `
            <div class="flex justify-between items-start mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div class="flex-1">
                    <div class="font-bold">${item.quantity}x ${item.product.name}</div>
                    <div class="text-xs text-muted mt-xs">
                        ${item.extras.map(e => `+ ${e.name} (₹${e.price})`).join(', ')}
                    </div>
                </div>
                <div class="text-right font-bold">
                    ₹${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    // Action buttons
    let actionBtnHtml = '';
    if (order.status === 'Delivered') {
        actionBtnHtml = `<button class="btn btn-primary" id="reorder-btn">Reorder</button>`;
    }
    
    // Format Address - Use exact delivery address stored with the order
    let addressHtml = 'N/A';
    if (order.delivery_address) {
        // Handle if it's stored as a JSON object or parsed automatically by Supabase
        const addr = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;
        
        const houseStr = addr.house ? addr.house + ', ' : '';
        const streetStr = addr.street ? addr.street : '';
        const cityStr = addr.city ? addr.city + ', ' : '';
        const pinStr = addr.pin ? addr.pin : '';
        
        addressHtml = `${houseStr}${streetStr}<br>${cityStr}${pinStr}`;
        if (addr.phone) {
            addressHtml += `<br>Phone: ${addr.phone}`;
        }
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div>
                <a href="/my-orders" data-link class="text-primary text-sm mb-sm block">&larr; Back to Orders</a>
                <h1>Order #${order.id.substring(0,8).toUpperCase()}</h1>
                <div class="text-muted text-sm mt-xs">${dateStr} at ${timeStr}</div>
            </div>
            <div>
                ${actionBtnHtml}
            </div>
        </div>
        
        <div class="glass-card mb-xl p-lg" style="padding: var(--space-xl);">
            ${timelineHtml}
            
            <div class="grid md:grid-cols-2 gap-xl">
                <div>
                    <h3 class="mb-md text-primary" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
                    <p class="mb-xs"><strong>Name:</strong> ${profile.name || 'N/A'}</p>
                    <p class="mb-xs"><strong>Phone:</strong> ${profile.phone || 'N/A'}</p>
                    <p class="mb-md"><strong>Payment:</strong> ${order.payment_method}</p>
                    
                    <h3 class="mb-md mt-lg text-primary" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
                    <p class="text-sm text-muted" style="line-height: 1.6;">
                        ${addressHtml}
                    </p>
                </div>
                
                <div style="background: rgba(0,0,0,0.2); padding: var(--space-lg); border-radius: var(--radius-md);">
                    <h3 class="mb-md text-primary" style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
                    <div class="mb-md">
                        ${itemsHtml}
                    </div>
                    
                    <div class="flex justify-between items-center mb-sm text-sm">
                        <span class="text-muted">Subtotal</span>
                        <span>₹${Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.05); text-sm">
                        <span class="text-muted">Delivery Charge</span>
                        <span>₹${Number(order.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center font-bold text-lg text-primary">
                        <span>Grand Total</span>
                        <span>₹${Number(order.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Bind Action Buttons
    const reorderBtn = document.getElementById('reorder-btn');
    if (reorderBtn) {
        reorderBtn.addEventListener('click', () => {
            if (confirm('This will clear your current cart and add these items. Proceed?')) {
                // Clear cart
                store.setState({ cart: [] });
                
                // Add items back
                order.items.forEach(item => {
                    store.addToCart(item.product, item.quantity, item.extras);
                });
                
                // Navigate to checkout
                router.navigate('/checkout');
            }
        });
    }
};
