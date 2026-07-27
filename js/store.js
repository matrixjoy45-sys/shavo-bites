import { fetchMenuItems, fetchExtras } from './data.js';
import { supabase } from './supabase.js';

// State Management (Store)
class Store {
    constructor() {
        this.state = {
            cart: [],
            user: null,
            customerProfile: null,
            cartOpen: false,
            products: [],
            extras: [],
            isLoaded: false,
            authLoaded: false
        };
        
        this.listeners = [];
        this.loadState();
        this.initAuth();
    }
    
    // Core State Management
    getState() {
        return this.state;
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
        this.notify();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
    
    // Initialize Data from Supabase
    async initData() {
        try {
            const [products, extras] = await Promise.all([
                fetchMenuItems(),
                fetchExtras()
            ]);
            this.setState({ products, extras, isLoaded: true });
        } catch (e) {
            console.error('Failed to init data:', e);
            this.setState({ isLoaded: true }); // Still mark loaded to unblock UI
        }
    }
    
    // Auth Management
    async initAuth() {
        if (!supabase) {
            this.setState({ authLoaded: true });
            return;
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        await this.handleSessionChange(session);

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            await this.handleSessionChange(session);
        });
    }

    async handleSessionChange(session) {
        if (session && session.user) {
            // Fetch customer profile
            const { data: profile } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
            this.setState({ 
                user: session.user, 
                customerProfile: profile || null,
                authLoaded: true 
            });
        } else {
            this.setState({ 
                user: null, 
                customerProfile: null, 
                authLoaded: true 
            });
        }
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }

    async signup(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        if (error) throw error;
        return data;
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/login'
        });
        if (error) throw error;
    }
    
    // Persistence
    loadState() {
        try {
            const saved = localStorage.getItem('shavo_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.cart = parsed.cart || [];
            }
        } catch (e) {
            console.error('Failed to load state', e);
        }
    }
    
    saveState() {
        try {
            localStorage.setItem('shavo_state', JSON.stringify({
                cart: this.state.cart
            }));
        } catch (e) {
            console.error('Failed to save state', e);
        }
    }
    
    // Cart Actions
    toggleCart(isOpen = !this.state.cartOpen) {
        this.setState({ cartOpen: isOpen });
    }
    
    addToCart(product, quantity = 1, selectedExtras = []) {
        const cart = [...this.state.cart];
        
        // Generate a unique ID based on product and extras to combine identical configurations
        const extrasKey = selectedExtras.map(e => e.id).sort().join('_');
        const cartItemId = `${product.id}_${extrasKey}`;
        
        const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
        
        if (existingItemIndex >= 0) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                cartItemId,
                product,
                quantity,
                extras: selectedExtras
            });
        }
        
        this.setState({ cart, cartOpen: true });
    }
    
    removeFromCart(cartItemId) {
        const cart = this.state.cart.filter(item => item.cartItemId !== cartItemId);
        this.setState({ cart });
    }
    
    updateQuantity(cartItemId, delta) {
        const cart = [...this.state.cart];
        const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
        
        if (itemIndex >= 0) {
            cart[itemIndex].quantity += delta;
            
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            
            this.setState({ cart });
        }
    }
    
    clearCart() {
        this.setState({ cart: [] });
    }
    
    // Cart Selectors
    getCartTotal() {
        return this.state.cart.reduce((total, item) => {
            const extrasTotal = item.extras.reduce((sum, ext) => sum + ext.price, 0);
            const itemTotal = (item.product.price + extrasTotal) * item.quantity;
            return total + itemTotal;
        }, 0);
    }
    
    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    }
}

export const store = new Store();
