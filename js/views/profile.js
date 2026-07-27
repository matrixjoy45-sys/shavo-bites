import { store } from '../store.js';
import { supabase } from '../supabase.js';
import { Icons } from '../components.js';

export const renderProfile = async () => {
    const state = store.getState();
    const user = state.user;
    const profile = state.customerProfile || {};

    if (!user) {
        return `<div>Please log in</div>`;
    }

    const avatarUrl = profile.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(profile.name || user.email);

    return `
        <div class="page-enter section">
            <div class="container" style="max-width: 800px;">
                <div class="flex justify-between items-center mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h1>My Profile</h1>
                    <button class="btn btn-outline btn-sm text-error" style="border-color: var(--color-error);" id="btn-logout">
                        Logout
                    </button>
                </div>

                <div class="grid md:grid-cols-3 gap-xl">
                    <!-- Sidebar -->
                    <div>
                        <div class="glass-card text-center" style="padding: var(--space-xl);">
                            <div class="mb-md" style="position: relative; display: inline-block;">
                                <img src="${avatarUrl}" alt="Profile" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-primary);" id="profile-img-preview">
                                
                                <label for="avatar-upload" style="position: absolute; bottom: 0; right: 0; background: var(--color-primary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: black; border: 2px solid #111;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </label>
                                <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                            </div>
                            
                            <h3 class="mb-xs">${profile.name || 'User'}</h3>
                            <p class="text-muted text-sm" style="word-break: break-all;">${user.email}</p>
                        </div>
                    </div>

                    <!-- Main Form -->
                    <div class="md:col-span-2">
                        <form id="profile-form" class="glass-card" style="padding: var(--space-xl);">
                            <h3 class="mb-md text-primary">Personal Information</h3>
                            
                            <div class="form-group mb-md">
                                <label class="form-label">Full Name</label>
                                <input type="text" id="prof-name" class="form-input" value="${profile.name || ''}" required>
                            </div>
                            
                            <div class="form-group mb-md">
                                <label class="form-label">Email Address (Read Only)</label>
                                <input type="email" class="form-input" value="${user.email}" disabled style="opacity: 0.7; cursor: not-allowed;">
                            </div>
                            
                            <div class="form-group mb-lg">
                                <label class="form-label">Phone Number</label>
                                <input type="tel" id="prof-phone" class="form-input" value="${profile.phone || ''}" placeholder="+91 98765 43210">
                            </div>
                            
                            <button type="submit" id="prof-save-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
};

renderProfile.mount = () => {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await store.logout();
                window.location.href = '/';
            } catch (err) {
                console.error(err);
            }
        });
    }

    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('prof-save-btn');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Saving...';
                
                const name = document.getElementById('prof-name').value;
                const phone = document.getElementById('prof-phone').value || null;
                
                const user = store.getState().user;
                
                const { error } = await supabase
                    .from('customers')
                    .update({ name, phone, updated_at: new Date().toISOString() })
                    .eq('user_id', user.id);
                    
                if (error) throw error;
                
                // Refresh session state locally
                await store.handleSessionChange({ user });
                
                alert('Profile updated successfully!');
            } catch (err) {
                alert('Failed to update profile: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
            }
        });
    }

    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const user = store.getState().user;
            if (!user) return;

            try {
                // Show temporary preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('profile-img-preview').src = e.target.result;
                };
                reader.readAsDataURL(file);

                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('profile-images')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(fileName);

                // Update customers table
                const { error: updateError } = await supabase
                    .from('customers')
                    .update({ avatar_url: publicUrl })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;
                
                await store.handleSessionChange({ user });
                
            } catch (err) {
                alert('Failed to upload image: ' + err.message);
            }
        });
    }
};
