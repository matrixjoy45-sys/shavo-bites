// Vanilla SPA Router
import { renderHome } from './views/home.js';
import { renderMenu } from './views/menu.js';
import { renderCheckout } from './views/checkout.js';
import { renderProfile } from './views/profile.js';

class Router {
    constructor() {
        this.routes = {
            '/': renderHome,
            '/menu': renderMenu,
            '/checkout': renderCheckout,
            '/profile': renderProfile
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
        
        // Handle github pages / local subfolder routing if needed
        // For local development, assume root is /
        if (!this.routes[path]) {
            path = '/'; // fallback to home
        }
        
        const renderFunction = this.routes[path];
        
        // Fade out current content
        this.rootElement.style.opacity = '0';
        
        setTimeout(async () => {
            // Render new content
            const html = await renderFunction();
            this.rootElement.innerHTML = html;
            
            // Re-bind events for the new view (if the view has a mount function)
            if (renderFunction.mount) {
                renderFunction.mount();
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
