import { Icons } from '../components.js';

export const renderProfile = async () => {
    // For a real app, this would check `store.getState().user`
    // We'll mock a logged in state for demonstration
    const isLoggedIn = true;
    
    if (!isLoggedIn) {
        return `
            <div class="page-enter section container flex flex-col items-center justify-center text-center" style="min-height: 60vh;">
                <h2 class="mb-sm">Login or Sign Up</h2>
                <p class="text-muted mb-lg">Create an account to track orders and save your details.</p>
                <button class="btn btn-primary">Login / Sign Up</button>
            </div>
        `;
    }
    
    return `
        <div class="page-enter section">
            <div class="container">
                <h1 class="mb-xl text-center">My Profile</h1>
                
                <div class="grid md:grid-cols-4 gap-xl">
                    <!-- Sidebar -->
                    <div class="glass-card" style="padding: var(--space-lg); height: fit-content;">
                        <div class="text-center mb-lg">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-primary); color: #000; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; margin: 0 auto mb-sm;">
                                JD
                            </div>
                            <h3>John Doe</h3>
                            <p class="text-muted text-sm">+1 234 567 8900</p>
                        </div>
                        
                        <nav class="flex flex-col gap-sm">
                            <a href="#" class="btn btn-outline text-left justify-start active" style="justify-content: flex-start;">My Orders</a>
                            <a href="#" class="btn btn-outline text-left justify-start" style="border-color: transparent; justify-content: flex-start;">Saved Addresses</a>
                            <a href="#" class="btn btn-outline text-left justify-start" style="border-color: transparent; justify-content: flex-start;">Account Settings</a>
                            <button class="btn btn-outline text-left justify-start text-error mt-lg" style="border-color: transparent; justify-content: flex-start; color: var(--color-error);">Logout</button>
                        </nav>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="md:col-span-3">
                        <div class="glass-card" style="padding: var(--space-xl);">
                            <h2 class="mb-lg border-b pb-sm text-primary" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Recent Orders</h2>
                            
                            <!-- Mock Order 1 -->
                            <div class="glass p-md rounded mb-md" style="padding: var(--space-md); border-radius: var(--radius-sm);">
                                <div class="flex justify-between items-center mb-md border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                    <div>
                                        <span class="font-bold text-lg">Order #ORD-748921</span>
                                        <span class="text-muted text-sm ml-sm">Placed 2 days ago</span>
                                    </div>
                                    <span class="badge" style="background: rgba(46, 204, 113, 0.2); color: var(--color-success); border: 1px solid var(--color-success);">Delivered</span>
                                </div>
                                <div class="text-muted mb-md text-sm">
                                    2x Chicken Shawarma (Extra Garlic), 1x Premium Dates Shake
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-lg">$37.97</span>
                                    <button class="btn btn-outline btn-sm">Reorder</button>
                                </div>
                            </div>
                            
                            <!-- Mock Order 2 -->
                            <div class="glass p-md rounded" style="padding: var(--space-md); border-radius: var(--radius-sm);">
                                <div class="flex justify-between items-center mb-md border-b pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                    <div>
                                        <span class="font-bold text-lg">Order #ORD-112344</span>
                                        <span class="text-muted text-sm ml-sm">Placed 1 week ago</span>
                                    </div>
                                    <span class="badge" style="background: rgba(46, 204, 113, 0.2); color: var(--color-success); border: 1px solid var(--color-success);">Delivered</span>
                                </div>
                                <div class="text-muted mb-md text-sm">
                                    1x Beef Shawarma, 1x French Fries, 1x Squid Shawarma
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-lg">$39.96</span>
                                    <button class="btn btn-outline btn-sm">Reorder</button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
