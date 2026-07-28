import { supabase, getImageUrl } from '../../supabase.js';
import { renderAdminLayout } from './layout.js';
import { Icons } from '../../components.js';

export const renderAdminBanners = async () => {
    let banners = [];
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('type', 'banner');
            
        if (error) throw error;
        banners = data || [];
    } catch(e) {
        console.error("Failed to fetch banners:", e);
    }
    
    const tableRows = banners.map(banner => {
        const val = banner.value;
        const statusBadge = val.is_active 
            ? `<span class="badge" style="background:var(--color-success); color:white;">Active</span>`
            : `<span class="badge" style="background:#555; color:white;">Disabled</span>`;
            
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 1rem;">
                    <img src="${getImageUrl(val.image_url)}" alt="Banner" style="width: 120px; height: 60px; border-radius: var(--radius-sm); object-fit: cover;">
                </td>
                <td style="padding: 1rem;">
                    <div style="font-weight: bold;">${val.title}</div>
                    <div class="text-xs text-muted">${val.subtitle}</div>
                </td>
                <td style="padding: 1rem;">${statusBadge}</td>
                <td style="padding: 1rem; text-align: right;">
                    <div class="flex gap-sm justify-end">
                        <button class="btn-icon text-error" title="Delete" onclick="window.adminBannerActions.deleteBanner('${banner.key}')">
                            ${Icons.Trash}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const content = `
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">Hero <span class="text-primary">Banners</span></h2>
                <p class="text-sm text-muted">Manage the large rotating images on the home page</p>
            </div>
            <button class="btn btn-primary flex items-center gap-sm" onclick="window.adminBannerActions.openModal()">
                ${Icons.Plus} Add Banner
            </button>
        </div>
        
        <div class="glass-card" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--color-text-muted);">
                        <th style="padding: 1rem;">Image</th>
                        <th style="padding: 1rem;">Text Content</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.length > 0 ? tableRows : `<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">No banners found. The default fallback will be used.</td></tr>`}
                </tbody>
            </table>
        </div>
        
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
        <div id="admin-modal-container"></div>
    `;
    
    return renderAdminLayout(content, '/admin/banners');
};

renderAdminBanners.mount = () => {
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('admin-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `glass-card fade-in slide-up`;
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderLeft = `4px solid ${type === 'success' ? '#28a745' : 'var(--color-error)'}`;
        toast.innerHTML = `<strong>${type === 'success' ? 'Success' : 'Error'}</strong> <span style="margin-left: 0.5rem;">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    window.adminBannerActions = {
        openModal: () => {
            const container = document.getElementById('admin-modal-container');
            container.innerHTML = `
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 1000;" id="admin-modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; width: 95%; max-width: 500px; padding: var(--space-xl); max-height: 90vh; overflow-y: auto;">
                    <div class="flex justify-between items-center mb-lg pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3>Upload Hero Banner</h3>
                        <button class="btn-icon" id="admin-close-modal-btn">${Icons.Close}</button>
                    </div>
                    
                    <form id="admin-banner-form">
                        <div class="form-group mb-md">
                            <label class="form-label">Headline (e.g. BIG FLAVOR.)</label>
                            <input type="text" id="banner-title" class="form-input" required>
                        </div>
                        <div class="form-group mb-md">
                            <label class="form-label">Sub-headline (e.g. EVERY BITE.)</label>
                            <input type="text" id="banner-subtitle" class="form-input" required>
                        </div>
                        <div class="form-group mb-md">
                            <label class="form-label">Description text</label>
                            <textarea id="banner-desc" class="form-input" rows="2" required></textarea>
                        </div>
                        <div class="form-group mb-lg">
                            <label class="form-label">High-Quality Background Image</label>
                            <input type="file" id="banner-image" class="form-input" accept="image/png, image/jpeg, image/webp" required>
                            <p class="text-xs text-muted mt-xs">Will be converted to WebP. Ideal ratio 16:9.</p>
                        </div>
                        <label class="flex items-center gap-sm mb-lg" style="cursor: pointer;">
                            <input type="checkbox" id="banner-active" checked>
                            <span>Enable immediately</span>
                        </label>
                        <button type="submit" id="banner-save-btn" class="btn btn-primary w-full" style="width:100%;">Upload & Save</button>
                    </form>
                </div>
            `;
            
            const closeModal = () => container.innerHTML = '';
            document.getElementById('admin-close-modal-btn').onclick = closeModal;
            document.getElementById('admin-modal-overlay').onclick = closeModal;
            
            document.getElementById('admin-banner-form').onsubmit = async (e) => {
                e.preventDefault();
                const btn = document.getElementById('banner-save-btn');
                btn.disabled = true;
                btn.innerHTML = 'Optimizing & Uploading...';
                
                try {
                    const fileInput = document.getElementById('banner-image');
                    const file = fileInput.files[0];
                    if (file.size > 8 * 1024 * 1024) throw new Error("File too large. Max 8MB.");
                    
                    // Simple upload for now (In production you'd use the Canvas WebP compressor here too)
                    const fileName = `banner_${Date.now()}.${file.name.split('.').pop()}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('menu-images')
                        .upload('banners/' + fileName, file);
                        
                    if (uploadError) throw uploadError;
                        
                    const payload = {
                        title: document.getElementById('banner-title').value,
                        subtitle: document.getElementById('banner-subtitle').value,
                        desc: document.getElementById('banner-desc').value,
                        image_url: 'banners/' + fileName,
                        is_active: document.getElementById('banner-active').checked
                    };
                    
                    const key = 'banner_' + Date.now();
                    
                    const { error: dbError } = await supabase.from('settings').insert([{
                        key, type: 'banner', value: payload
                    }]);
                    
                    if (dbError) throw dbError;
                    
                    showToast('Banner uploaded successfully!');
                    setTimeout(() => window.history.go(0), 1000);
                    
                } catch(err) {
                    showToast(err.message, 'error');
                    btn.disabled = false;
                    btn.innerHTML = 'Upload & Save';
                }
            };
        },
        
        deleteBanner: async (key) => {
            if(confirm('Delete this banner?')) {
                try {
                    await supabase.from('settings').delete().eq('key', key);
                    showToast('Banner deleted.');
                    setTimeout(() => window.history.go(0), 1000);
                } catch(e) {
                    showToast(e.message, 'error');
                }
            }
        }
    };
};
