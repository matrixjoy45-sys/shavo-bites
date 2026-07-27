import { store } from '../store.js';
import { supabase } from '../supabase.js';
import { router } from '../router.js';

let currentAddresses = [];
let isEditing = false;
let editAddressId = null;

export const renderAddresses = async () => {
    return `
        <div class="page-enter section">
            <div class="container" style="max-width: 900px;" id="addresses-container">
                <!-- Skeleton Loader -->
                <div class="flex justify-between items-center mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: 250px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px;" class="animate-pulse"></div>
                    <div style="width: 150px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 8px;" class="animate-pulse"></div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-lg">
                    <div style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border-radius: 8px;" class="animate-pulse"></div>
                    <div style="width: 100%; height: 200px; background: rgba(255,255,255,0.05); border-radius: 8px;" class="animate-pulse"></div>
                </div>
            </div>
        </div>
        
        <!-- Address Modal -->
        <div id="address-modal" class="modal-overlay hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; padding: 1rem;">
            <div class="glass-card w-full" style="max-width: 600px; max-height: 90vh; overflow-y: auto; padding: var(--space-xl); position: relative; transform: translateY(20px); transition: transform 0.3s ease;">
                <button id="close-modal-btn" class="btn-icon" style="position: absolute; top: 1rem; right: 1rem; color: var(--color-text-muted);">&times;</button>
                <h2 id="modal-title" class="mb-lg text-primary text-2xl">Add New Address</h2>
                
                <form id="address-form" class="grid gap-md">
                    <div class="grid md:grid-cols-2 gap-md">
                        <div>
                            <label class="block text-sm text-muted mb-xs">Contact Name *</label>
                            <input type="text" id="addr-name" class="input w-full" required>
                        </div>
                        <div>
                            <label class="block text-sm text-muted mb-xs">Phone Number *</label>
                            <input type="tel" id="addr-phone" class="input w-full" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-muted mb-xs">House / Flat / Block *</label>
                        <input type="text" id="addr-house" class="input w-full" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm text-muted mb-xs">Street / Colony *</label>
                        <input type="text" id="addr-street" class="input w-full" required>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-md">
                        <div>
                            <label class="block text-sm text-muted mb-xs">Area / Sector *</label>
                            <input type="text" id="addr-area" class="input w-full" required>
                        </div>
                        <div>
                            <label class="block text-sm text-muted mb-xs">Landmark (Optional)</label>
                            <input type="text" id="addr-landmark" class="input w-full">
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-3 gap-md">
                        <div>
                            <label class="block text-sm text-muted mb-xs">City *</label>
                            <input type="text" id="addr-city" class="input w-full" required>
                        </div>
                        <div>
                            <label class="block text-sm text-muted mb-xs">State *</label>
                            <input type="text" id="addr-state" class="input w-full" required>
                        </div>
                        <div>
                            <label class="block text-sm text-muted mb-xs">Pincode *</label>
                            <input type="text" id="addr-pin" class="input w-full" required>
                        </div>
                    </div>
                    
                    <div class="mt-sm">
                        <label class="block text-sm text-muted mb-sm">Address Type *</label>
                        <div class="flex gap-md">
                            <label class="flex items-center gap-xs cursor-pointer">
                                <input type="radio" name="addr-type" value="Home" checked> Home
                            </label>
                            <label class="flex items-center gap-xs cursor-pointer">
                                <input type="radio" name="addr-type" value="Work"> Work
                            </label>
                            <label class="flex items-center gap-xs cursor-pointer">
                                <input type="radio" name="addr-type" value="Other"> Other
                            </label>
                        </div>
                    </div>
                    
                    <div class="mt-sm flex items-center gap-sm cursor-pointer">
                        <input type="checkbox" id="addr-default" style="width: 18px; height: 18px;">
                        <label for="addr-default" class="text-sm cursor-pointer">Make this my default address</label>
                    </div>
                    
                    <div class="mt-lg flex justify-end gap-md">
                        <button type="button" id="cancel-modal-btn" class="btn btn-outline">Cancel</button>
                        <button type="submit" id="save-address-btn" class="btn btn-primary">Save Address</button>
                    </div>
                </form>
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
            .address-card {
                position: relative;
                transition: all 0.3s ease;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .address-card:hover {
                transform: translateY(-2px);
                border-color: rgba(212, 175, 55, 0.3);
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            }
            .address-card.default-address {
                border-color: var(--color-primary);
                background: linear-gradient(145deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.4) 100%);
            }
            .badge-default {
                background: var(--color-primary);
                color: #000;
                font-size: 0.7rem;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .modal-overlay.show {
                display: flex !important;
                opacity: 1 !important;
            }
            .modal-overlay.show .glass-card {
                transform: translateY(0) !important;
            }
            
            /* Hide modal by default but ensure CSS can override */
            .hidden { display: none !important; }
        </style>
    `;
};

renderAddresses.mount = async () => {
    const state = store.getState();
    const profile = state.customerProfile;
    
    if (!profile) {
        router.navigate('/login');
        return;
    }
    
    await loadAddresses(profile.id);
    setupModalEvents();
};

const loadAddresses = async (customerId) => {
    const container = document.getElementById('addresses-container');
    if (!container) return;
    
    try {
        const { data: addresses, error } = await supabase
            .from('customer_addresses')
            .select('*')
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        currentAddresses = addresses || [];
        renderAddressList(container, customerId);
        
    } catch (err) {
        console.error("Failed to load addresses:", err);
        container.innerHTML = `
            <div class="glass-card text-center" style="padding: var(--space-xl); margin-top: 2rem;">
                <div class="text-error mb-md" style="font-size: 3rem;">⚠️</div>
                <h3 class="mb-sm">Failed to load addresses</h3>
                <p class="text-muted mb-lg">${err.message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
};

const renderAddressList = (container, customerId) => {
    let contentHtml = `
        <div class="flex justify-between items-center mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div>
                <h1 class="text-3xl text-primary">Saved Addresses</h1>
                <p class="text-muted text-sm mt-xs">Manage your delivery locations</p>
            </div>
            <button id="add-address-btn" class="btn btn-primary shadow-glow">
                + Add New Address
            </button>
        </div>
    `;
    
    if (currentAddresses.length === 0) {
        contentHtml += `
            <div class="glass-card text-center py-xl" style="padding: var(--space-2xl);">
                <div style="font-size: 4rem; opacity: 0.5;" class="mb-md">📍</div>
                <h3 class="text-xl mb-sm text-primary">No Addresses Found</h3>
                <p class="text-muted mb-lg">You haven't saved any delivery addresses yet.</p>
                <button id="add-address-empty-btn" class="btn btn-primary">Add Your First Address</button>
            </div>
        `;
    } else {
        contentHtml += `<div class="grid md:grid-cols-2 gap-lg">`;
        
        currentAddresses.forEach(addr => {
            const isDefault = addr.is_default;
            const cardClass = isDefault ? 'glass-card address-card p-lg default-address' : 'glass-card address-card p-lg';
            
            contentHtml += `
                <div class="${cardClass}">
                    <div class="flex justify-between items-start mb-sm">
                        <div class="flex items-center gap-sm">
                            <span class="text-primary" style="font-size: 1.2rem;">
                                ${addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '🏢' : '📍'}
                            </span>
                            <h3 class="font-bold text-lg">${addr.type}</h3>
                            ${isDefault ? `<span class="badge-default ml-sm">Default</span>` : ''}
                        </div>
                        <div class="flex gap-sm">
                            <button class="btn-icon edit-addr-btn" data-id="${addr.id}" title="Edit" style="color: var(--color-text-main);">✏️</button>
                            <button class="btn-icon delete-addr-btn" data-id="${addr.id}" title="Delete" style="color: var(--color-error);">🗑️</button>
                        </div>
                    </div>
                    
                    <div class="text-muted text-sm mb-md" style="line-height: 1.6;">
                        <p class="text-text-main font-semibold mb-xs">${addr.name} | ${addr.phone}</p>
                        <p>${addr.house}, ${addr.street}</p>
                        <p>${addr.area}</p>
                        <p>${addr.city}, ${addr.state} - ${addr.pin}</p>
                        ${addr.landmark ? `<p class="italic mt-xs opacity-75">Landmark: ${addr.landmark}</p>` : ''}
                    </div>
                    
                    ${!isDefault ? `
                        <div class="mt-md pt-md" style="border-top: 1px solid rgba(255,255,255,0.05);">
                            <button class="text-primary text-sm set-default-btn hover:underline" data-id="${addr.id}">
                                Set as Default
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        contentHtml += `</div>`;
    }
    
    container.innerHTML = contentHtml;
    
    // Bind list events
    const addBtn = document.getElementById('add-address-btn');
    if (addBtn) addBtn.addEventListener('click', () => openAddressModal());
    
    const addEmptyBtn = document.getElementById('add-address-empty-btn');
    if (addEmptyBtn) addEmptyBtn.addEventListener('click', () => openAddressModal());
    
    document.querySelectorAll('.edit-addr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const addr = currentAddresses.find(a => a.id === id);
            if (addr) openAddressModal(addr);
        });
    });
    
    document.querySelectorAll('.delete-addr-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm('Are you sure you want to delete this address?')) {
                try {
                    const { error } = await supabase.from('customer_addresses').delete().eq('id', id);
                    if (error) throw error;
                    await loadAddresses(customerId);
                } catch (err) {
                    alert('Failed to delete address: ' + err.message);
                }
            }
        });
    });
    
    document.querySelectorAll('.set-default-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            try {
                const { error } = await supabase
                    .from('customer_addresses')
                    .update({ is_default: true })
                    .eq('id', id);
                if (error) throw error;
                await loadAddresses(customerId);
            } catch (err) {
                alert('Failed to set default address: ' + err.message);
            }
        });
    });
};

const setupModalEvents = () => {
    const modal = document.getElementById('address-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const form = document.getElementById('address-form');
    
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300); // Wait for transition
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const state = store.getState();
        const profile = state.customerProfile;
        if (!profile) return;
        
        const submitBtn = document.getElementById('save-address-btn');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        const addressData = {
            customer_id: profile.id,
            name: document.getElementById('addr-name').value,
            phone: document.getElementById('addr-phone').value,
            house: document.getElementById('addr-house').value,
            street: document.getElementById('addr-street').value,
            area: document.getElementById('addr-area').value,
            city: document.getElementById('addr-city').value,
            state: document.getElementById('addr-state').value,
            pin: document.getElementById('addr-pin').value,
            landmark: document.getElementById('addr-landmark').value,
            type: document.querySelector('input[name="addr-type"]:checked').value,
            is_default: document.getElementById('addr-default').checked
        };
        
        try {
            if (isEditing && editAddressId) {
                const { error } = await supabase
                    .from('customer_addresses')
                    .update(addressData)
                    .eq('id', editAddressId);
                if (error) throw error;
            } else {
                // If it's the first address, make it default automatically
                if (currentAddresses.length === 0) {
                    addressData.is_default = true;
                }
                const { error } = await supabase
                    .from('customer_addresses')
                    .insert([addressData]);
                if (error) throw error;
            }
            
            closeModal();
            await loadAddresses(profile.id);
            
        } catch (err) {
            alert('Failed to save address: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
};

const openAddressModal = (address = null) => {
    const modal = document.getElementById('address-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('address-form');
    
    modal.classList.remove('hidden');
    // small delay to allow display:block to apply before animating opacity
    setTimeout(() => modal.classList.add('show'), 10); 
    
    form.reset();
    
    if (address) {
        isEditing = true;
        editAddressId = address.id;
        title.textContent = 'Edit Address';
        
        document.getElementById('addr-name').value = address.name || '';
        document.getElementById('addr-phone').value = address.phone || '';
        document.getElementById('addr-house').value = address.house || '';
        document.getElementById('addr-street').value = address.street || '';
        document.getElementById('addr-area').value = address.area || '';
        document.getElementById('addr-city').value = address.city || '';
        document.getElementById('addr-state').value = address.state || '';
        document.getElementById('addr-pin').value = address.pin || '';
        document.getElementById('addr-landmark').value = address.landmark || '';
        
        document.querySelector(`input[name="addr-type"][value="${address.type}"]`).checked = true;
        document.getElementById('addr-default').checked = address.is_default;
        
        // Don't allow unchecking default if it's currently default (force them to select another one instead)
        if (address.is_default) {
            document.getElementById('addr-default').disabled = true;
        } else {
            document.getElementById('addr-default').disabled = false;
        }
    } else {
        isEditing = false;
        editAddressId = null;
        title.textContent = 'Add New Address';
        
        // Auto-fill from profile for convenience if empty
        const profile = store.getState().customerProfile;
        if (profile) {
            document.getElementById('addr-name').value = profile.name || '';
            document.getElementById('addr-phone').value = profile.phone || '';
        }
        
        document.getElementById('addr-default').disabled = false;
        if (currentAddresses.length === 0) {
            document.getElementById('addr-default').checked = true;
            document.getElementById('addr-default').disabled = true; // First must be default
        }
    }
};
