import { supabase } from '../../supabase.js';
import { renderAdminLayout } from './layout.js';

export const renderAdminDashboard = async () => {
    // Fetch analytics data (Today's orders)
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    let totalRevenue = 0;
    let orderCount = 0;
    
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total, items')
            .gte('created_at', startOfDay.toISOString());
            
        if (orders) {
            orderCount = orders.length;
            totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
        }
    } catch(e) {
        console.error("Failed to fetch analytics:", e);
    }
    
    const content = `
        <div class="flex justify-between items-center mb-xl">
            <h2 class="text-white">Dashboard <span class="text-primary">Overview</span></h2>
            <div class="text-sm text-muted">Real-time Data</div>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-lg mb-2xl">
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid var(--color-primary);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">Today's Orders</h4>
                <div class="text-4xl font-bold text-white">${orderCount}</div>
            </div>
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid var(--color-primary);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">Today's Revenue</h4>
                <div class="text-4xl font-bold text-primary">₹${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="glass-card p-lg" style="padding: var(--space-xl); display: flex; flex-direction: column; align-items: center; border-top: 3px solid rgba(255,255,255,0.2);">
                <h4 class="text-muted mb-sm text-sm uppercase" style="letter-spacing: 1px;">System Status</h4>
                <div class="text-lg font-bold text-success mt-sm flex items-center gap-sm">
                    <span style="width: 12px; height: 12px; background: #28a745; border-radius: 50%; display: inline-block;"></span> Online
                </div>
            </div>
        </div>
        
        <h3 class="mb-md text-white">Recent Audit Logs</h3>
        <div class="glass-card" style="padding: var(--space-lg); min-height: 250px;">
            <p class="text-muted text-center" style="margin-top: 80px;">Activity logs will appear here once module is fully connected.</p>
        </div>
    `;
    
    return renderAdminLayout(content, '/admin/dashboard');
};

renderAdminDashboard.mount = () => {
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('adminRole');
            import('../../router.js').then(module => {
                module.router.navigate('/admin');
            });
        });
    }
};
