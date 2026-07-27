import { store } from '../store.js';
import { Icons } from '../components.js';
import { router } from '../router.js';

export const renderAuth = async () => {
    // If already logged in, redirect to intended page or home
    if (store.getState().user) {
        const next = sessionStorage.getItem('shavo_auth_next') || '/';
        sessionStorage.removeItem('shavo_auth_next');
        setTimeout(() => router.navigate(next), 0);
        return `<div></div>`;
    }

    return `
        <div class="page-enter section" style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
            <div class="container" style="max-width: 450px;">
                <div class="glass-card" style="padding: var(--space-xl);">
                    
                    <!-- Toggle Tabs -->
                    <div class="flex mb-lg" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <button class="flex-1 pb-sm font-bold text-center auth-tab active" data-tab="login" style="border-bottom: 2px solid var(--color-primary); color: var(--color-primary);">Login</button>
                        <button class="flex-1 pb-sm font-bold text-center auth-tab text-muted" data-tab="signup" style="border-bottom: 2px solid transparent;">Sign Up</button>
                    </div>

                    <!-- Login Form -->
                    <form id="login-form" class="auth-form active">
                        <div class="form-group mb-md">
                            <label class="form-label">Email</label>
                            <input type="email" id="login-email" class="form-input" required placeholder="your@email.com">
                        </div>
                        <div class="form-group mb-lg">
                            <label class="form-label flex justify-between">
                                <span>Password</span>
                                <a href="#" class="text-primary text-sm" id="show-forgot-link">Forgot?</a>
                            </label>
                            <input type="password" id="login-password" class="form-input" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-primary mb-md" style="width: 100%; padding: 1rem;" id="login-btn">
                            Login
                        </button>
                    </form>

                    <!-- Signup Form -->
                    <form id="signup-form" class="auth-form" style="display: none;">
                        <div class="form-group mb-md">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="signup-name" class="form-input" required placeholder="John Doe">
                        </div>
                        <div class="form-group mb-md">
                            <label class="form-label">Email</label>
                            <input type="email" id="signup-email" class="form-input" required placeholder="your@email.com">
                        </div>
                        <div class="form-group mb-lg">
                            <label class="form-label">Password</label>
                            <input type="password" id="signup-password" class="form-input" required placeholder="At least 6 characters">
                        </div>
                        <button type="submit" class="btn btn-primary mb-md" style="width: 100%; padding: 1rem;" id="signup-btn">
                            Create Account
                        </button>
                    </form>

                    <!-- Forgot Password Form -->
                    <form id="forgot-form" class="auth-form" style="display: none;">
                        <p class="text-muted text-sm mb-md">Enter your email and we'll send you a password reset link.</p>
                        <div class="form-group mb-lg">
                            <label class="form-label">Email</label>
                            <input type="email" id="forgot-email" class="form-input" required placeholder="your@email.com">
                        </div>
                        <button type="submit" class="btn btn-primary mb-md" style="width: 100%; padding: 1rem;" id="forgot-btn">
                            Send Reset Link
                        </button>
                        <div class="text-center">
                            <a href="#" class="text-primary text-sm" id="back-to-login-link">&larr; Back to Login</a>
                        </div>
                    </form>

                    <div class="text-center mb-md text-sm text-muted">
                        OR
                    </div>

                    <button type="button" class="btn btn-outline" style="width: 100%; padding: 1rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem;" id="google-login-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                </div>
            </div>
        </div>
    `;
};

renderAuth.mount = () => {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderBottomColor = 'transparent';
                t.classList.remove('text-primary');
                t.classList.add('text-muted');
            });
            forms.forEach(f => f.style.display = 'none');
            
            tab.classList.add('active');
            tab.style.borderBottomColor = 'var(--color-primary)';
            tab.classList.add('text-primary');
            tab.classList.remove('text-muted');
            
            const targetId = tab.getAttribute('data-tab') + '-form';
            document.getElementById(targetId).style.display = 'block';
        });
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('login-btn');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Logging in...';
                await store.login(email, password);
                
                // Show success toast (using components.js if possible, or simple alert)
                const next = sessionStorage.getItem('shavo_auth_next') || '/';
                sessionStorage.removeItem('shavo_auth_next');
                router.navigate(next);
            } catch (err) {
                alert(err.message || 'Login failed. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const btn = document.getElementById('signup-btn');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Creating account...';
                
                await store.signup(email, password, name);
                
                // Show success toast
                alert('Account created! You can now log in.');
                
                // Switch to login tab
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('login-email').value = email;
            } catch (err) {
                alert(err.message || 'Signup failed. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }

    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert("Google Login will be configured in the Supabase Dashboard shortly!");
        });
    }

    // Forgot Password
    const showForgotLink = document.getElementById('show-forgot-link');
    if (showForgotLink) {
        showForgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('forgot-form').style.display = 'block';
            // Hide the tabs
            document.querySelectorAll('.auth-tab').forEach(t => t.style.display = 'none');
        });
    }

    const backToLoginLink = document.getElementById('back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('forgot-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            // Show the tabs again
            document.querySelectorAll('.auth-tab').forEach(t => t.style.display = '');
        });
    }

    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const btn = document.getElementById('forgot-btn');

            try {
                btn.disabled = true;
                btn.textContent = 'Sending...';
                await store.resetPassword(email);
                alert('Password reset link sent! Check your email inbox.');
                // Go back to login
                document.getElementById('back-to-login-link').click();
            } catch (err) {
                alert(err.message || 'Failed to send reset link. Please try again.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Send Reset Link';
            }
        });
    }
};
