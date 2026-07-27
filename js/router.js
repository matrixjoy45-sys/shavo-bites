// Vanilla SPA Router
import { renderHome } from './views/home.js';
import { renderMenu } from './views/menu.js';
import { renderCheckout } from './views/checkout.js';
import { renderProfile } from './views/profile.js';
import { renderAuth } from './views/auth.js';
import { renderMyOrders } from './views/orders.js';
import { renderOrderDetails } from './views/order-details.js';
import { renderAddresses } from './views/addresses.js';
import { renderAdminLogin } from './views/admin/login.js';
import { renderAdminDashboard } from './views/admin/dashboard.js';
import { renderAdminMenu } from './views/admin/menu.js';
import { renderAdminSettings } from './views/admin/settings.js';
import { renderAdminBanners } from './views/admin/banners.js';
import { supabase } from './supabase.js';

class Router {
    constructor() {
        this.routes = {
            '/': renderHome,
            '/menu': renderMenu,
            '/checkout': renderCheckout,
            '/profile': renderProfile,
            '/addresses': renderAddresses,
            '/my-orders': renderMyOrders,
            '/login': renderAuth,
            '/admin': renderAdminLogin,
            '/admin/dashboard': renderAdminDashboard,
            '/admin/menu': renderAdminMenu,
            '/admin/settings': renderAdminSettings,
            '/admin/banners': renderAdminBanners
        };
        
        this.rootElement = document.getElementById('router-view');
        
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Intercept link clicks
        document.body.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            } else if (e.target.closest('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.closest('[data-link]').getAttribute('href'));
            }
        });
    }
    
    navigate(path) {
        window.history.pushState(null, null, path);
        this.handleRoute();
    }
    
    async handleRoute() {
        let path = window.location.pathname;
        let renderFunction;
        let params = {};
        
        const orderMatch = path.match(/^\/my-orders\/([a-zA-Z0-9-]+)$/);
        
        if (orderMatch) {
            params.id = orderMatch[1];
            renderFunction = renderOrderDetails;
        } else if (this.routes[path]) {
            renderFunction = this.routes[path];
        } else {
            path = '/'; // fallback to home
            renderFunction = this.routes['/'];
        }
        
        // Admin Auth Middleware
        if (path.startsWith('/admin')) {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (path === '/admin') {
                if (session) {
                    this.navigate('/admin/dashboard');
                    return;
                }
            } else {
                if (!session) {
                    this.navigate('/admin');
                    return;
                }
            }
        }
        
        // Customer Auth Middleware
        const protectedRoutes = ['/checkout', '/profile', '/my-orders', '/addresses'];
        if (protectedRoutes.includes(path) || path.startsWith('/my-orders/')) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Save intended destination
                sessionStorage.setItem('shavo_auth_next', path);
                this.navigate('/login');
                return;
            }
        }
        
        // Auto-close cart drawer on navigation
        if (window.appActions && typeof window.appActions.toggleCart === 'function') {
            window.appActions.toggleCart(false);
        }
        
        
        // Fade out current content
        this.rootElement.style.opacity = '0';
        
        setTimeout(async () => {
            // Render new content
            const html = await renderFunction(params);
            this.rootElement.innerHTML = html;
            
            // Re-bind events for the new view (if the view has a mount function)
            if (renderFunction.mount) {
                renderFunction.mount(params);
            }
            
            // Fade in
            this.rootElement.style.opacity = '1';
            window.scrollTo(0, 0);
            
            // Update active nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') === path) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }, 150); // wait for fade out
    }
    
    init() {
        this.rootElement.style.transition = 'opacity 0.15s ease';
        this.handleRoute();
    }
}

export const router = new Router();
