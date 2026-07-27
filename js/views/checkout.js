import { store } from '../store.js';
import { Icons } from '../components.js';
import { supabase } from '../supabase.js';

export const renderCheckout = async () => {
    const state = store.getState();
    const cart = state.cart;
    const profile = state.customerProfile || {};
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
            <span>₹${(itemPrice * item.quantity).toFixed(2)}</span>
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
                                    <input type="text" id="cust-name" class="form-input" required placeholder="John Doe" value="${profile.name || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" id="cust-phone" class="form-input" required placeholder="+91 98765 43210" value="${profile.phone || ''}">
                                </div>
                            </div>
                            
                            <div class="form-group flex justify-between items-center mb-md mt-sm">
                                <label class="form-label mb-0">Delivery Address</label>
                                <button type="button" class="btn btn-outline btn-sm" id="btn-use-location">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                                    Use Current Location
                                </button>
                            </div>
                            
                            <div id="checkout-address-section">
                                <!-- Rendered dynamically by mount -->
                                <div style="width: 100%; height: 100px; background: rgba(255,255,255,0.05); border-radius: 8px;" class="animate-pulse"></div>
                            </div>
                            
                            <!-- Address Selection Modal (Hidden by default) -->
                            <div id="checkout-address-modal" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; padding: 1rem;">
                                <div class="glass-card w-full" style="max-width: 500px; max-height: 80vh; overflow-y: auto; padding: var(--space-xl); position: relative;">
                                    <button type="button" id="close-address-modal" class="btn-icon" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-text-muted);">&times;</button>
                                    <h3 class="mb-lg text-primary text-xl">Select Delivery Address</h3>
                                    <div id="checkout-address-list" class="grid gap-md">
                                        <!-- Addresses populated here -->
                                    </div>
                                    <div class="mt-lg pt-md" style="border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                                        <a href="/addresses" data-link class="btn btn-outline w-full">+ Manage Addresses</a>
                                    </div>
                                </div>
                            </div>
                            
                            <input type="hidden" id="selected-address-json" value="">
                            
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
                                Place Order - ₹${total.toFixed(2)}
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

let currentAddresses = [];
let selectedAddress = null;

renderCheckout.mount = async () => {
    const state = store.getState();
    const profile = state.customerProfile;
    
    if (profile) {
        try {
            const { data } = await supabase
                .from('customer_addresses')
                .select('*')
                .eq('customer_id', profile.id)
                .order('is_default', { ascending: false });
            currentAddresses = data || [];
            selectedAddress = currentAddresses.length > 0 ? currentAddresses[0] : null;
        } catch(e) {
            console.error('Failed to load addresses:', e);
        }
    }
    
    const form = document.getElementById('checkout-form');
    
    // Render the initial selected address
    const renderAddressSection = () => {
        const section = document.getElementById('checkout-address-section');
        const hiddenInput = document.getElementById('selected-address-json');
        
        if (!section || !hiddenInput) return;
        
        if (selectedAddress) {
            hiddenInput.value = JSON.stringify(selectedAddress);
            section.innerHTML = `
                <div class="glass-card p-md mb-md" style="background: rgba(0,0,0,0.2); border: 1px solid var(--color-primary);">
                    <div class="flex justify-between items-start">
                        <div class="text-sm">
                            <div class="flex items-center gap-xs mb-xs">
                                <span class="badge-default" style="background: var(--color-primary); color: #000; font-size: 0.6rem; padding: 2px 6px; border-radius: 8px; font-weight: bold;">${selectedAddress.type}</span>
                                <span class="font-bold text-text-main">${selectedAddress.name}</span>
                            </div>
                            <p class="text-muted">${selectedAddress.house}, ${selectedAddress.street}</p>
                            <p class="text-muted">${selectedAddress.area}, ${selectedAddress.city}</p>
                            <p class="text-muted">${selectedAddress.state} - ${selectedAddress.pin}</p>
                        </div>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-change-address" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Change</button>
                    </div>
                </div>
            `;
            
            // Re-bind change button
            document.getElementById('btn-change-address')?.addEventListener('click', openAddressModal);
        } else {
            hiddenInput.value = '';
            section.innerHTML = `
                <div class="glass-card p-md mb-md text-center" style="background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.2);">
                    <p class="text-muted mb-sm text-sm">No delivery address saved.</p>
                    <a href="/addresses" data-link class="btn btn-primary btn-sm">Add Address</a>
                </div>
            `;
        }
    };
    
    // Address Modal Logic
    const openAddressModal = () => {
        const modal = document.getElementById('checkout-address-modal');
        const list = document.getElementById('checkout-address-list');
        
        list.innerHTML = currentAddresses.map(addr => `
            <div class="glass-card p-md cursor-pointer address-select-option ${selectedAddress?.id === addr.id ? 'active-address' : ''}" data-id="${addr.id}" style="transition: all 0.2s; ${selectedAddress?.id === addr.id ? 'border-color: var(--color-primary);' : ''}">
                <div class="flex justify-between items-center mb-xs">
                    <span class="font-bold text-text-main">${addr.type}</span>
                    ${selectedAddress?.id === addr.id ? '<span class="text-primary">✓</span>' : ''}
                </div>
                <p class="text-sm text-muted">${addr.house}, ${addr.street}, ${addr.area}</p>
            </div>
        `).join('');
        
        // Bind selection
        list.querySelectorAll('.address-select-option').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                selectedAddress = currentAddresses.find(a => a.id === id);
                renderAddressSection();
                closeAddressModal();
            });
        });
        
        modal.classList.remove('hidden');
        setTimeout(() => modal.style.opacity = '1', 10);
    };
    
    const closeAddressModal = () => {
        const modal = document.getElementById('checkout-address-modal');
        modal.style.opacity = '0';
        setTimeout(() => modal.classList.add('hidden'), 300);
    };
    
    document.getElementById('close-address-modal')?.addEventListener('click', closeAddressModal);
    
    // Initial render
    renderAddressSection();
    
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

            // Get authenticated user's customer profile
            const profile = state.customerProfile;
            if (!profile) {
                alert('Could not load your profile. Please try logging in again.');
                btn.disabled = false;
                btn.textContent = 'Place Order - ₹' + total.toFixed(2);
                return;
            }

            // Extract selected address from hidden input
            const addressJson = document.getElementById('selected-address-json').value;
            if (!addressJson) {
                alert('Please select a delivery address');
                btn.disabled = false;
                btn.textContent = 'Place Order - ₹' + total.toFixed(2);
                return;
            }
            
            const addressData = JSON.parse(addressJson);
            // Ensure phone is set (from form or profile)
            addressData.phone = document.getElementById('cust-phone').value || profile.phone;
            
            // Name is also needed if someone changes the name in the contact info
            addressData.name = document.getElementById('cust-name').value || profile.name;

            // Fallback for UUID if crypto.randomUUID is not available in non-secure contexts
            const generateUUID = () => {
                if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const orderId = generateUUID();
            
            try {
                if (!supabase) {
                    console.error("Supabase client is not initialized.");
                    throw new Error("Supabase client is not initialized. Check your config.");
                }

                // 1. Update customer address (only valid schema fields)
                const customerUpdateData = {
                    name: addressData.name,
                    phone: addressData.phone,
                    house: addressData.house,
                    street: addressData.street,
                    city: addressData.city,
                    pin: addressData.pin
                };
                
                const { error: addrError } = await supabase
                    .from('customers')
                    .update(customerUpdateData)
                    .eq('id', profile.id);
                    
                if (addrError) {
                    console.warn("Address update warning:", addrError);
                }
                
                // 2. Insert Order linked to authenticated customer
                const orderData = {
                    id: orderId,
                    customer_id: profile.id,
                    items: cart,
                    subtotal: subtotal,
                    delivery_fee: delivery,
                    total: total,
                    payment_method: document.getElementById('payment-method').value,
                    special_instructions: document.getElementById('cust-instructions').value,
                    status: 'Pending',
                    delivery_address: addressData
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
                btn.textContent = 'Place Order - ₹' + total.toFixed(2);
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
