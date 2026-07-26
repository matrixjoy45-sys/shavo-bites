import { supabase } from '../../supabase.js';

export const renderAdminLogin = async () => {
    return `
        <div class="page-enter section flex justify-center items-center" style="min-height: 70vh;">
            <div class="glass-card" style="width: 100%; max-width: 420px; padding: var(--space-2xl);">
                <div class="text-center mb-xl">
                    <h2 class="text-primary mb-xs">Admin Login</h2>
                    <p class="text-muted text-sm">Secure CMS Access</p>
                </div>
                <form id="admin-login-form">
                    <div class="form-group mb-md">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="admin-email" class="form-input" required placeholder="admin@shavobites.com">
                    </div>
                    <div class="form-group mb-xl">
                        <label class="form-label">Password</label>
                        <input type="password" id="admin-password" class="form-input" required placeholder="••••••••">
                    </div>
                    <button type="submit" id="admin-login-btn" class="btn btn-primary" style="width:100%; padding: 1rem; font-size: 1.1rem;">Secure Sign In</button>
                    <div id="login-error" class="text-error text-center mt-md text-sm font-bold"></div>
                </form>
            </div>
        </div>
    `;
};

renderAdminLogin.mount = () => {
    const form = document.getElementById('admin-login-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('admin-login-btn');
        const errDiv = document.getElementById('login-error');
        
        btn.disabled = true;
        btn.textContent = 'Authenticating...';
        errDiv.textContent = '';
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Check role in admin_roles table
            const { data: roleData, error: roleError } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('user_id', data.user.id)
                .single();
                
            if (roleError || !roleData) {
                // User authenticated but not found in admin_roles
                await supabase.auth.signOut();
                throw new Error("Unauthorized: Your account does not have admin privileges.");
            }
            
            // Store role securely for frontend toggles
            localStorage.setItem('adminRole', roleData.role);
            
            // Navigate to Dashboard
            import('../../router.js').then(module => {
                module.router.navigate('/admin/dashboard');
            });
            
        } catch (error) {
            errDiv.textContent = error.message;
            btn.disabled = false;
            btn.textContent = 'Secure Sign In';
        }
    });
};
