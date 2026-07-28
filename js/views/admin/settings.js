import { supabase } from '../../supabase.js';
import { renderAdminLayout } from './layout.js';
import { Icons } from '../../components.js';

export const renderAdminSettings = async () => {
    let settings = {};
    let logoData = null;
    let logoKey = 'logo_default';
    
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .in('type', ['general', 'logo']);
            
        if (error) throw error;
        
        if (data) {
            data.forEach(row => {
                if (row.type === 'general') {
                    settings[row.key] = row.value;
                } else if (row.type === 'logo' && row.value?.is_active !== false) {
                    logoData = row.value;
                    logoKey = row.key;
                }
            });
        }
    } catch(e) {
        console.error("Failed to fetch settings:", e);
    }
    
    const storeStatus = settings.store_status || { isOpen: true };
    const deliveryFee = settings.delivery_fee || { fee: 2.99 };
    const contact = settings.contact || { phone: '+1 234 567 8900', whatsapp: '+1 234 567 8900' };
    const minOrder = settings.min_order || { amount: 15.00 };

    const content = `
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">General <span class="text-primary">Settings</span></h2>
                <p class="text-sm text-muted">Manage restaurant status, delivery fees, and contact details</p>
            </div>
        </div>
        
        <form id="admin-settings-form" class="grid md:grid-cols-2 gap-xl">
            <!-- Store Status -->
            <div class="glass-card p-lg" style="padding: var(--space-xl);">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Store Status</h3>
                
                <div class="form-group mb-md">
                    <label class="flex justify-between items-center cursor-pointer">
                        <span class="text-lg">Accepting Orders</span>
                        <div style="position: relative; display: inline-block; width: 50px; height: 26px;">
                            <input type="checkbox" id="setting-is-open" ${storeStatus.isOpen ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${storeStatus.isOpen ? 'var(--color-primary)' : '#555'}; transition: .4s; border-radius: 34px;">
                                <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${storeStatus.isOpen ? '28px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                            </span>
                        </div>
                    </label>
                    <p class="text-xs text-muted mt-xs">Turning this off will prevent customers from placing checkout orders.</p>
                </div>
            </div>
            
            <!-- Delivery & Minimums -->
            <div class="glass-card p-lg" style="padding: var(--space-xl);">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Order Settings</h3>
                
                <div class="form-group mb-md">
                    <label class="form-label">Delivery Charge (₹)</label>
                    <input type="number" id="setting-delivery-fee" class="form-input" step="0.01" value="${deliveryFee.fee}" required>
                </div>
                
                <div class="form-group mb-md">
                    <label class="form-label">Minimum Order Amount (₹)</label>
                    <input type="number" id="setting-min-order" class="form-input" step="0.01" value="${minOrder.amount}" required>
                </div>
            </div>
            
            <!-- Branding Settings -->
            <div class="glass-card p-lg" style="padding: var(--space-xl); grid-column: 1 / -1;">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Branding & Logo</h3>
                
                <div class="form-group mb-md">
                    <label class="form-label">Upload New Logo</label>
                    <div class="flex items-center gap-md">
                        ${logoData?.image_url ? `<img src="${logoData.image_url.startsWith('http') || logoData.image_url.startsWith('/assets/') ? logoData.image_url : supabase.storage.from('menu-images').getPublicUrl(logoData.image_url).data?.publicUrl}" alt="Current Logo" style="height: 50px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: var(--radius-sm); object-fit: contain;">` : `<div style="height:50px; width:50px; background:rgba(255,255,255,0.1); border-radius: var(--radius-sm); display:flex; align-items:center; justify-content:center;" class="text-xs text-muted">No Logo</div>`}
                        <input type="file" id="setting-logo-upload" class="form-input flex-1" accept="image/png, image/jpeg, image/webp">
                        <input type="hidden" id="setting-logo-key" value="${logoKey}">
                        <input type="hidden" id="setting-logo-current" value="${logoData?.image_url || ''}">
                    </div>
                </div>
            </div>
            
            <!-- Contact Details -->
            <div class="glass-card p-lg" style="padding: var(--space-xl); grid-column: 1 / -1;">
                <h3 class="mb-md text-white border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">Contact & Social</h3>
                
                <div class="grid md:grid-cols-2 gap-lg">
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="text" id="setting-phone" class="form-input" value="${contact.phone}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">WhatsApp Number</label>
                        <input type="text" id="setting-whatsapp" class="form-input" value="${contact.whatsapp}" required>
                    </div>
                </div>
            </div>
            
            <div class="grid-column: 1 / -1" style="grid-column: 1 / -1;">
                <button type="submit" id="save-settings-btn" class="btn btn-primary w-full" style="width:100%; padding: 1rem; font-size: 1.1rem;">Save All Settings</button>
            </div>
        </form>
        
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
    `;
    
    return renderAdminLayout(content, '/admin/settings');
};

renderAdminSettings.mount = () => {
    // Basic toggle UI update script for the slider
    const isOpenCheckbox = document.getElementById('setting-is-open');
    if (isOpenCheckbox) {
        isOpenCheckbox.addEventListener('change', (e) => {
            const slider = e.target.nextElementSibling;
            const knob = slider.firstElementChild;
            if (e.target.checked) {
                slider.style.backgroundColor = 'var(--color-primary)';
                knob.style.left = '28px';
            } else {
                slider.style.backgroundColor = '#555';
                knob.style.left = '4px';
            }
        });
    }

    const showToast = (message, type = 'success') => {
        const container = document.getElementById('admin-toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `glass-card fade-in slide-up`;
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderLeft = `4px solid ${type === 'success' ? '#28a745' : 'var(--color-error)'}`;
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '0.5rem';
        
        toast.innerHTML = `
            <strong style="color: ${type === 'success' ? '#28a745' : 'var(--color-error)'}">${type === 'success' ? 'Success' : 'Error'}</strong>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    const form = document.getElementById('admin-settings-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-settings-btn');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            
            try {
                // Upsert Store Status
                await supabase.from('settings').upsert({
                    key: 'store_status',
                    type: 'general',
                    value: { isOpen: document.getElementById('setting-is-open').checked }
                }, { onConflict: 'key' });
                
                // Upsert Delivery Fee
                await supabase.from('settings').upsert({
                    key: 'delivery_fee',
                    type: 'general',
                    value: { fee: parseFloat(document.getElementById('setting-delivery-fee').value) }
                }, { onConflict: 'key' });
                
                // Upsert Min Order
                await supabase.from('settings').upsert({
                    key: 'min_order',
                    type: 'general',
                    value: { amount: parseFloat(document.getElementById('setting-min-order').value) }
                }, { onConflict: 'key' });
                
                // Upsert Contact
                await supabase.from('settings').upsert({
                    key: 'contact',
                    type: 'general',
                    value: { 
                        phone: document.getElementById('setting-phone').value,
                        whatsapp: document.getElementById('setting-whatsapp').value
                    }
                }, { onConflict: 'key' });
                
                // Upload Logo if provided
                const logoFile = document.getElementById('setting-logo-upload').files[0];
                let finalLogoUrl = document.getElementById('setting-logo-current').value;
                const logoKeyToUse = document.getElementById('setting-logo-key').value || ('logo_' + Date.now());
                
                if (logoFile) {
                    const ext = logoFile.name.split('.').pop();
                    const fileName = `logo_${Date.now()}.${ext}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('menu-images')
                        .upload(fileName, logoFile);
                        
                    if (uploadError) throw uploadError;
                    finalLogoUrl = uploadData.path;
                    
                    // Upsert logo setting
                    await supabase.from('settings').upsert({
                        key: logoKeyToUse,
                        type: 'logo',
                        value: { image_url: finalLogoUrl, is_active: true }
                    }, { onConflict: 'key' });
                }
                
                // Audit log
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('audit_logs').insert([{
                    user_id: user?.id,
                    action: 'UPDATE_SETTINGS',
                    resource: 'settings',
                    details: { updated: ['store_status', 'delivery_fee', 'min_order', 'contact'] }
                }]);
                
                showToast('Settings saved successfully!');
            } catch (error) {
                console.error(error);
                showToast('Failed to save settings: ' + error.message, 'error');
            }
            
            btn.disabled = false;
            btn.textContent = 'Save All Settings';
        });
    }
};
