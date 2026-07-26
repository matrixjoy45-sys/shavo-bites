import { store } from '../store.js';
import { Icons } from '../components.js';
import { supabase } from '../supabase.js';

export const renderCheckout = async () => {
    const state = store.getState();
    const cart = state.cart;
    
    if (cart.length === 0) {
        return `
            <div class="page-enter section container flex flex-col items-center justify-center text-center" style="min-height: 60vh;">
                <div class="text-primary mb-md" style="transform: scale(2);">${Icons.Cart}</div>
                <h2 class="mb-sm">Your cart is empty</h2>
                <p class="text-muted mb-lg">Add some delicious items before proceeding to checkout.</p>
                <a href="/menu" data-link class="btn btn-primary">Go to Menu</a>
            </div>
        `;
    }

    const subtotal = store.getCartTotal();
    const delivery = 2.99;
    const total = subtotal + delivery;

    const orderSummaryHtml = cart.map(item => {
        const itemPrice = Number(item.product.price) + item.extras.reduce((s,e)=>s+Number(e.price),0);
        return `
        <div class="flex justify-between mb-sm text-sm">
            <span>${item.quantity}x ${item.product.name}</span>
            <span>$${(itemPrice * item.quantity).toFixed(2)}</span>
        </div>
        `;
    }).join('');

    return `
        <div class="page-enter section">
            <div class="container">
                <h1 class="mb-xl text-center">Checkout</h1>
                
                <div class="grid md:grid-cols-3 gap-xl">
                    <div class="md:col-span-2">
                        <form id="checkout-form" class="glass-card" style="padding: var(--space-xl);">
                            
                            <h3 class="mb-md text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Contact & Address</h3>
                            
                            <div class="grid md:grid-cols-2 gap-md">
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" id="cust-name" class="form-input" required placeholder="John Doe">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" id="cust-phone" class="form-input" required placeholder="+1 234 567 8900">
                                </div>
                            </div>
                            
                            <div class="form-group flex justify-between items-center mb-md mt-sm">
                                <label class="form-label mb-0">Delivery Address</label>
                                <button type="button" class="btn btn-outline btn-sm" id="btn-use-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                                    Use Current Location
                                </button>
                            </div>
                            
                            <div class="grid md:grid-cols-2 gap-md">
                                <div class="form-group">
                                    <label class="form-label">House / Flat Number</label>
                                    <input type="text" id="cust-house" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Street / Area</label>
                                    <input type="text" id="cust-street" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">City</label>
                                    <input type="text" id="cust-city" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">PIN Code</label>
                                    <input type="text" id="cust-pin" class="form-input" required>
                                </div>
                            </div>
                            
                            <h3 class="mb-md mt-lg text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Payment Method</h3>
                            <div class="form-group">
                                <select class="form-select" id="payment-method">
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="upi">UPI</option>
                                    <option value="card">Credit / Debit Card</option>
                                </select>
                            </div>
                            
                            <h3 class="mb-md mt-lg text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Special Instructions</h3>
                            <div class="form-group">
                                <textarea class="form-input" id="cust-instructions" rows="3" placeholder="e.g. extra spicy, call on arrival..."></textarea>
                            </div>
                            
                            <button type="submit" id="submit-order-btn" class="btn btn-primary mt-lg" style="width: 100%; padding: 1rem; font-size: 1.125rem;">
                                Place Order - $${total.toFixed(2)}
                            </button>
                        </form>
                    </div>
                    
                    <div>
                        <div class="glass-card" style="padding: var(--space-xl); position: sticky; top: 100px;">
                            <h3 class="mb-md">Order Summary</h3>
                            <div class="mb-lg" style="max-height: 300px; overflow-y: auto;">
                                ${orderSummaryHtml}
                            </div>
                            
                            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-md);">
                                <div class="flex justify-between items-center mb-sm">
                            <span class="text-muted">Subtotal</span>
                            <span>₹${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="text-muted">Delivery</span>
                            <span>₹${delivery.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span class="text-primary font-bold">₹${total.toFixed(2)}</span>
                        </div>        </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Success Modal -->
            <div id="success-modal-container"></div>
        </div>
    `;
};

renderCheckout.mount = () => {
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submit-order-btn');
            btn.disabled = true;
            btn.textContent = 'Processing...';
            
            const state = store.getState();
            const cart = state.cart;
            const subtotal = store.getCartTotal();
            const delivery = 2.99;
            const total = subtotal + delivery;

            // Fallback for UUID if crypto.randomUUID is not available in non-secure contexts
            const generateUUID = () => {
                if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const customerId = generateUUID();
            const customerData = {
                id: customerId,
                name: document.getElementById('cust-name').value,
                phone: document.getElementById('cust-phone').value,
                house: document.getElementById('cust-house').value,
                street: document.getElementById('cust-street').value,
                city: document.getElementById('cust-city').value,
                pin: document.getElementById('cust-pin').value
            };

            const orderId = generateUUID();
            
            try {
                if (!supabase) {
                    console.error("Supabase client is not initialized.");
                    throw new Error("Supabase client is not initialized. Check your config.");
                }

                // 1. Insert Customer
                const { data: custData, error: custError } = await supabase
                    .from('customers')
                    .insert([customerData]);
                    
                if (custError) {
                    console.error("Supabase Customer Error:", custError);
                    throw new Error(`Customer Insert Failed: ${custError.message || JSON.stringify(custError)}`);
                }
                
                // 2. Insert Order
                const orderData = {
                    id: orderId,
                    customer_id: customerId,
                    items: cart,
                    subtotal: subtotal,
                    delivery_fee: delivery,
                    total: total,
                    payment_method: document.getElementById('payment-method').value,
                    special_instructions: document.getElementById('cust-instructions').value,
                    status: 'Pending'
                };

                const { data: ordData, error: ordError } = await supabase
                    .from('orders')
                    .insert([orderData]);
                    
                if (ordError) {
                    console.error("Supabase Order Error:", ordError);
                    throw new Error(`Order Insert Failed: ${ordError.message || JSON.stringify(ordError)}`);
                }
                
                // 3. Invoke Edge Function for Email Notification
                console.log("Invoking order-notification Edge Function...");
                const { data: funcData, error: funcError } = await supabase.functions.invoke('order-notification', {
                    body: {
                        type: 'INSERT',
                        table: 'orders',
                        record: orderData
                    }
                });
                
                if (funcError) {
                    console.error("❌ Edge Function Invocation Failed:", funcError);
                } else {
                    console.log("✅ Edge Function Invoked Successfully:", funcData);
                }
                
            } catch (err) {
                console.error("Order submission error:", err);
                btn.disabled = false;
                btn.textContent = 'Place Order - $' + total.toFixed(2);
                return; // STOP execution on failure, do not show success modal
            }
            
            const container = document.getElementById('success-modal-container');
            container.innerHTML = `
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 300;"></div>
                <div class="glass-card text-center" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 301; width: 90%; max-width: 450px; padding: var(--space-xl);">
                    <div class="text-success mb-md flex justify-center" style="transform: scale(3);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h2 class="mb-sm text-primary">Order Confirmed!</h2>
                    <p class="text-muted mb-md">Your order has been received and is being prepared.</p>
                    
                    <div class="text-left bg-black p-md rounded mb-lg" style="background: rgba(0,0,0,0.5); padding: var(--space-md); border-radius: var(--radius-sm);">
                        <p class="mb-xs"><strong>Order ID:</strong> ${orderId}</p>
                        <p class="mb-xs"><strong>Est. Delivery:</strong> 20-30 Minutes</p>
                        <p class="mb-xs text-primary font-bold"><strong>Status:</strong> Preparing</p>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.checkoutActions.finishOrder()">View My Orders</button>
                </div>
            `;
            
            store.clearCart();
        });
    }
    
    document.getElementById('btn-use-location')?.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {},
                (err) => {}
            );
        }
    });
    
    window.checkoutActions = {
        finishOrder: () => {
            // Usually we'd route to profile/orders, for now just go home
            import('../router.js').then(module => {
                module.router.navigate('/profile');
            });
        }
    };
};
