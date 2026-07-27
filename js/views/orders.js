import { store } from '../store.js';
import { supabase } from '../supabase.js';
import { OrderCard } from '../components.js';

export const renderMyOrders = async () => {
    const state = store.getState();
    const user = state.user;
    const profile = state.customerProfile;

    if (!user || !profile) {
        return `<div class="page-enter section container text-center" style="min-height: 60vh;">Please log in to view your orders.</div>`;
    }

    return `
        <div class="page-enter section">
            <div class="container" style="max-width: 800px;">
                <h1 class="mb-xl border-b pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.1);">My Orders</h1>
                <div id="orders-container">
                    <!-- Skeleton Loader -->
                    <div class="glass-card mb-md p-md" style="padding: var(--space-lg); border-left: 3px solid rgba(255,255,255,0.1);">
                        <div class="flex justify-between items-start mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div>
                                <div style="width: 120px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px;" class="animate-pulse"></div>
                                <div style="width: 80px; height: 14px; background: rgba(255,255,255,0.05); border-radius: 4px;" class="animate-pulse"></div>
                            </div>
                            <div class="text-right">
                                <div style="width: 60px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px; margin-left: auto;" class="animate-pulse"></div>
                                <div style="width: 70px; height: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-left: auto;" class="animate-pulse"></div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-md">
                            <div style="width: 200px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px;" class="animate-pulse"></div>
                            <div style="width: 100px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 20px;" class="animate-pulse"></div>
                        </div>
                    </div>
                    <div class="glass-card mb-md p-md" style="padding: var(--space-lg); border-left: 3px solid rgba(255,255,255,0.1);">
                        <div class="flex justify-between items-start mb-md pb-md" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div>
                                <div style="width: 120px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px;" class="animate-pulse"></div>
                                <div style="width: 80px; height: 14px; background: rgba(255,255,255,0.05); border-radius: 4px;" class="animate-pulse"></div>
                            </div>
                            <div class="text-right">
                                <div style="width: 60px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px; margin-left: auto;" class="animate-pulse"></div>
                                <div style="width: 70px; height: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-left: auto;" class="animate-pulse"></div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-md">
                            <div style="width: 200px; height: 16px; background: rgba(255,255,255,0.05); border-radius: 4px;" class="animate-pulse"></div>
                            <div style="width: 100px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 20px;" class="animate-pulse"></div>
                        </div>
                    </div>
                </div>
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
        </style>
    `;
};

renderMyOrders.mount = async () => {
    const container = document.getElementById('orders-container');
    if (!container) return;

    const state = store.getState();
    const profile = state.customerProfile;

    if (!profile) return;

    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="glass-card text-center flex flex-col items-center justify-center" style="padding: var(--space-xl); min-height: 40vh;">
                    <div class="text-primary mb-md" style="font-size: 4rem;">📦</div>
                    <h2 class="mb-sm">No Orders Yet</h2>
                    <p class="text-muted mb-lg">You haven't placed any orders yet. Discover our delicious menu!</p>
                    <a href="/menu" data-link class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => OrderCard(order)).join('');

    } catch (err) {
        console.error('Error fetching orders:', err);
        container.innerHTML = `
            <div class="glass-card text-center" style="padding: var(--space-xl);">
                <div class="text-error mb-md" style="font-size: 3rem;">⚠️</div>
                <h3 class="mb-sm">Failed to load orders</h3>
                <p class="text-muted mb-lg">${err.message || 'An unexpected error occurred.'}</p>
                <button class="btn btn-outline" onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
};
