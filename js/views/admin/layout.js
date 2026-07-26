import { Icons } from '../../components.js';

export const renderAdminLayout = (content, activeRoute) => {
    const role = localStorage.getItem('adminRole') || 'manager';
    
    const navItems = [
        { path: '/admin/dashboard', name: 'Dashboard' },
        { path: '/admin/menu', name: 'Menu' }
    ];
    
    if (role === 'super_admin') {
        navItems.push({ path: '/admin/settings', name: 'Settings' });
        navItems.push({ path: '/admin/offers', name: 'Offers' });
        navItems.push({ path: '/admin/banners', name: 'Banners' });
    }
    
    const navHtml = navItems.map(item => `
        <a href="${item.path}" data-link class="admin-nav-link ${item.path === activeRoute ? 'active' : ''}" style="display:flex; align-items:center; gap:0.5rem; padding:1rem; color:${item.path === activeRoute ? 'var(--color-primary)' : 'var(--color-text-muted)'}; background:${item.path === activeRoute ? 'rgba(212,175,55,0.1)' : 'transparent'}; border-radius: var(--radius-sm); margin-bottom:0.5rem; text-decoration:none; transition: all 0.2s;">
            ${item.name}
        </a>
    `).join('');
    
    return `
        <div class="container page-enter">
            <div class="flex flex-col md:flex-row gap-xl" style="min-height: calc(100vh - 200px); margin: var(--space-xl) 0;">
                
                <!-- Sidebar -->
                <aside class="glass" style="width: 100%; md:width: 280px; min-width: 250px; padding: var(--space-lg); border-radius: var(--radius-md); display: flex; flex-direction: column;">
                    <div class="mb-lg pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <h3 class="text-white mb-xs">Admin Panel</h3>
                        <span class="badge badge-primary text-xs uppercase">${role.replace('_', ' ')}</span>
                    </div>
                    <nav class="flex flex-col flex-1">
                        ${navHtml}
                    </nav>
                    <div style="margin-top: 2rem; padding-top: var(--space-lg); border-top: 1px solid rgba(255,255,255,0.1);">
                        <button class="btn btn-outline w-full" id="admin-logout-btn" style="width:100%;">Logout</button>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main class="flex-1 glass" style="padding: var(--space-xl); border-radius: var(--radius-md); overflow-x: auto;">
                    ${content}
                </main>
            </div>
        </div>
    `;
};
