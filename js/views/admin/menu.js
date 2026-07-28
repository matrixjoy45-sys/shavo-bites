import { supabase, getImageUrl } from '../../supabase.js';
import { renderAdminLayout } from './layout.js';
import { Icons } from '../../components.js';

export const renderAdminMenu = async () => {
    // 1. Fetch all menu items
    let menuItems = [];
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        menuItems = data || [];
        window.__ADMIN_MENU_ITEMS__ = menuItems; // Store globally for modal access
    } catch(e) {
        console.error("Failed to fetch menu items:", e);
    }
    
    // 2. Build Table HTML
    const tableRows = menuItems.map(item => {
        const isDeleted = item.deleted_at !== null;
        const statusBadge = isDeleted 
            ? `<span class="badge" style="background:var(--color-error); color:white;">Deleted</span>`
            : item.is_active 
                ? `<span class="badge" style="background:var(--color-success); color:white;">Active</span>`
                : `<span class="badge" style="background:#555; color:white;">Hidden</span>`;
                
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${isDeleted ? 'opacity: 0.5;' : ''}">
                <td style="padding: 1rem;">
                    <img src="${getImageUrl(item.image)}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                </td>
                <td style="padding: 1rem; font-weight: bold;">${item.name}</td>
                <td style="padding: 1rem;" class="capitalize">${item.category}</td>
                <td style="padding: 1rem;">₹${Number(item.price).toFixed(2)}</td>
                <td style="padding: 1rem;">${statusBadge}</td>
                <td style="padding: 1rem; text-align: right;">
                    <div class="flex gap-sm justify-end">
                        <button class="btn-icon text-primary" title="Edit" onclick="window.adminMenuActions.openModal('${item.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        ${isDeleted ? `
                        <button class="btn-icon text-success" title="Restore" onclick="window.adminMenuActions.restoreItem('${item.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        </button>
                        ` : `
                        <button class="btn-icon text-error" title="Delete" onclick="window.adminMenuActions.deleteItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')">
                            ${Icons.Trash}
                        </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    const content = `
        <div class="flex justify-between items-center mb-xl">
            <div>
                <h2 class="text-white">Menu <span class="text-primary">Management</span></h2>
                <p class="text-sm text-muted">Create, edit, and manage your products</p>
            </div>
            <button class="btn btn-primary flex items-center gap-sm" onclick="window.adminMenuActions.openModal()">
                ${Icons.Plus} Add New Item
            </button>
        </div>
        
        <div class="glass-card" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--color-text-muted);">
                        <th style="padding: 1rem;">Image</th>
                        <th style="padding: 1rem;">Name</th>
                        <th style="padding: 1rem;">Category</th>
                        <th style="padding: 1rem;">Price</th>
                        <th style="padding: 1rem;">Status</th>
                        <th style="padding: 1rem; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.length > 0 ? tableRows : `<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">No menu items found.</td></tr>`}
                </tbody>
            </table>
        </div>
        
        <!-- Toast Notification Container -->
        <div id="admin-toast-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;"></div>
        
        <!-- Add/Edit Modal -->
        <div id="admin-modal-container"></div>
    `;
    
    return renderAdminLayout(content, '/admin/menu');
};

renderAdminMenu.mount = () => {
    // Audit Logger Utility
    const logAudit = async (action, resource, details) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert([{
                user_id: user?.id,
                action,
                resource,
                details
            }]);
        } catch(e) {
            console.error("Audit log failed:", e);
        }
    };

    // Toast Utility
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
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        
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

    // HTML5 Canvas WebP Compressor
    const compressImageToWebP = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Max dimension 1200px
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' }));
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    }, 'image/webp', 0.85); // 85% quality
                };
                img.onerror = (e) => reject(e);
            };
            reader.onerror = (e) => reject(e);
        });
    };

    window.adminMenuActions = {
        openModal: (itemId = null) => {
            const isEditing = itemId !== null;
            const items = window.__ADMIN_MENU_ITEMS__ || [];
            const item = isEditing ? items.find(i => i.id === itemId) : null;
            
            // Fallback for ingredients
            const ingredientsStr = item && item.ingredients 
                ? (Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients)
                : '';
                
            // Check for new schema flags (default false if undefined)
            const isBestseller = item?.is_bestseller || false;
            const isFeatured = item?.is_featured || false;
            
            const container = document.getElementById('admin-modal-container');
            container.innerHTML = `
                <div class="cart-overlay" style="opacity: 1; pointer-events: auto; z-index: 1000;" id="admin-modal-overlay"></div>
                <div class="glass-card" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1001; width: 95%; max-width: 600px; padding: var(--space-xl); max-height: 90vh; overflow-y: auto;">
                    <div class="flex justify-between items-center mb-lg pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3>${isEditing ? 'Edit' : 'Add New'} Menu Item</h3>
                        <button class="btn-icon" id="admin-close-modal-btn">${Icons.Close}</button>
                    </div>
                    
                    <form id="admin-menu-form">
                        <input type="hidden" id="menu-id" value="${isEditing ? item.id : ''}">
                        
                        <div class="grid md:grid-cols-2 gap-md mb-md">
                            <div class="form-group">
                                <label class="form-label">Name</label>
                                <input type="text" id="menu-name" class="form-input" required value="${item?.name || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select id="menu-category" class="form-select" required>
                                    <option value="shawarma" ${item?.category === 'shawarma' ? 'selected' : ''}>Shawarma</option>
                                    <option value="sides" ${item?.category === 'sides' ? 'selected' : ''}>Sides</option>
                                    <option value="drinks" ${item?.category === 'drinks' ? 'selected' : ''}>Drinks</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-md mb-md">
                            <div class="form-group">
                                <label class="form-label">Price (₹)</label>
                                <input type="number" id="menu-price" class="form-input" step="0.01" required value="${item?.price || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Spice Level</label>
                                <select id="menu-spice" class="form-select">
                                    <option value="none" ${item?.spiceLevel === 'none' ? 'selected' : ''}>None</option>
                                    <option value="mild" ${item?.spiceLevel === 'mild' ? 'selected' : ''}>Mild</option>
                                    <option value="medium" ${item?.spiceLevel === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="spicy" ${item?.spiceLevel === 'spicy' ? 'selected' : ''}>Spicy</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group mb-md">
                            <label class="form-label">Description</label>
                            <textarea id="menu-desc" class="form-input" rows="2" required>${item?.description || ''}</textarea>
                        </div>
                        
                        <div class="form-group mb-md">
                            <label class="form-label">Ingredients (comma separated)</label>
                            <input type="text" id="menu-ingredients" class="form-input" value="${ingredientsStr}">
                        </div>
                        
                        <div class="form-group mb-lg">
                            <label class="form-label">Product Image</label>
                            ${isEditing && item.image ? `<div class="mb-sm"><img src="${getImageUrl(item.image)}" style="width: 100px; border-radius: var(--radius-sm);"></div>` : ''}
                            <input type="file" id="menu-image-upload" class="form-input" accept="image/png, image/jpeg, image/webp" ${isEditing ? '' : 'required'}>
                            <p class="text-xs text-muted mt-xs">Max 5MB. Will be automatically optimized to WebP.</p>
                        </div>
                        
                        <div class="grid md:grid-cols-3 gap-md mb-lg">
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-active" ${!isEditing || item?.is_active ? 'checked' : ''}>
                                <span>Active (Visible)</span>
                            </label>
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-bestseller" ${isBestseller ? 'checked' : ''}>
                                <span>Bestseller</span>
                            </label>
                            <label class="flex items-center gap-sm" style="cursor: pointer;">
                                <input type="checkbox" id="menu-featured" ${isFeatured ? 'checked' : ''}>
                                <span>Featured Item</span>
                            </label>
                        </div>
                        
                        <button type="submit" id="menu-save-btn" class="btn btn-primary w-full" style="width:100%;">${isEditing ? 'Save Changes' : 'Create Item'}</button>
                    </form>
                </div>
            `;
            
            const closeModal = () => container.innerHTML = '';
            document.getElementById('admin-close-modal-btn').onclick = closeModal;
            document.getElementById('admin-modal-overlay').onclick = closeModal;
            
            // Form Submit Handler
            document.getElementById('admin-menu-form').onsubmit = async (e) => {
                e.preventDefault();
                const saveBtn = document.getElementById('menu-save-btn');
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<span class="loading-spinner" style="display:inline-block;width:1rem;height:1rem;border:2px solid #fff;border-bottom-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:0.5rem;"></span> Processing...';
                
                try {
                    const idInput = document.getElementById('menu-id').value;
                    const isEdit = idInput !== '';
                    const newId = isEdit ? idInput : 'p' + Date.now();
                    
                    let imageUrl = isEdit ? item.image : '';
                    const fileInput = document.getElementById('menu-image-upload');
                    
                    // Handle Image Upload with Client-Side Compression
                    if (fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 5 * 1024 * 1024) throw new Error("Image exceeds 5MB limit.");
                        
                        saveBtn.innerHTML = 'Optimizing Image...';
                        const webpFile = await compressImageToWebP(file);
                        
                        saveBtn.innerHTML = 'Uploading to Storage...';
                        const fileName = `${newId}_${Date.now()}.webp`;
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('menu-images')
                            .upload(fileName, webpFile, { upsert: true });
                            
                        if (uploadError) throw new Error("Image Upload Failed: " + uploadError.message);
                        
                        // Store just the filename/path
                        imageUrl = fileName;
                    }
                    
                    saveBtn.innerHTML = 'Saving to Database...';
                    
                    const payload = {
                        id: newId,
                        name: document.getElementById('menu-name').value,
                        category: document.getElementById('menu-category').value,
                        price: parseFloat(document.getElementById('menu-price').value),
                        "spiceLevel": document.getElementById('menu-spice').value,
                        description: document.getElementById('menu-desc').value,
                        ingredients: document.getElementById('menu-ingredients').value.split(',').map(s=>s.trim()).filter(Boolean),
                        image: imageUrl,
                        is_active: document.getElementById('menu-active').checked,
                        is_bestseller: document.getElementById('menu-bestseller').checked,
                        is_featured: document.getElementById('menu-featured').checked
                    };
                    
                    const { error: dbError } = await supabase
                        .from('menu_items')
                        .upsert([payload]);
                        
                    if (dbError) {
                        // Check if error is due to missing columns (is_bestseller/is_featured)
                        if (dbError.message && dbError.message.includes("column")) {
                            throw new Error("Database schema missing columns. Please run the provided ALTER TABLE SQL.");
                        }
                        throw dbError;
                    }
                    
                    await logAudit(isEdit ? 'UPDATE_MENU' : 'CREATE_MENU', 'menu_items', { id: newId, name: payload.name });
                    showToast(isEdit ? 'Item updated successfully!' : 'Item created successfully!');
                    closeModal();
                    
                    // Soft reload by re-triggering the route
                    setTimeout(() => window.history.go(0), 1000);
                    
                } catch(error) {
                    showToast(error.message, 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = isEditing ? 'Save Changes' : 'Create Item';
                }
            };
        },
        
        deleteItem: async (id, name) => {
            if (confirm(`Are you sure you want to soft-delete "${name}"? It will be hidden from the menu.`)) {
                try {
                    const { error } = await supabase
                        .from('menu_items')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', id);
                        
                    if (error) throw error;
                    await logAudit('SOFT_DELETE_MENU', 'menu_items', { id, name });
                    showToast(`${name} has been moved to trash.`);
                    setTimeout(() => window.history.go(0), 1000);
                } catch(error) {
                    showToast(error.message, 'error');
                }
            }
        },
        
        restoreItem: async (id) => {
            try {
                const { error } = await supabase
                    .from('menu_items')
                    .update({ deleted_at: null })
                    .eq('id', id);
                    
                if (error) throw error;
                await logAudit('RESTORE_MENU', 'menu_items', { id });
                showToast(`Item restored successfully.`);
                setTimeout(() => window.history.go(0), 1000);
            } catch(error) {
                showToast(error.message, 'error');
            }
        }
    };
    
    // Inject keyframes for spinner if not present
    if (!document.getElementById('admin-spinner-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-spinner-styles';
        style.innerHTML = `
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
};
