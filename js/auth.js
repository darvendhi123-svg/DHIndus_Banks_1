// ===== AUTHENTICATION =====

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.currentPhase = 1;
        this.init();
    }

    init() {
        this.loadSavedUser();
        this.setupEventListeners();
    }

    loadSavedUser() {
        const savedUser = localStorage.getItem(CONFIG.STORAGE.USER);
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isAuthenticated = true;
                this.updateUI();
            } catch (error) {
                console.error('Error loading saved user:', error);
            }
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Phase navigation
        const nextPhaseBtn = document.getElementById('next-phase-btn');
        if (nextPhaseBtn) {
            nextPhaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPhase2();
            });
        }

        const backPhaseBtn = document.getElementById('back-phase-btn');
        if (backPhaseBtn) {
            backPhaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPhase1();
            });
        }

        // Input focus effects
        const inputs = document.querySelectorAll('.input-container input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => this.handleInputFocus(input));
            input.addEventListener('blur', () => this.handleInputBlur(input));
            input.addEventListener('input', () => this.handleInputChange(input));
        });

        // Enter key navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const phoneInput = document.getElementById('phone');
                if (phoneInput && document.activeElement === phoneInput && this.currentPhase === 1) {
                    e.preventDefault();
                    this.goToPhase2();
                }
            }
        });

        const googleSignInBtn = document.getElementById('google-signin-btn');
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => {
                this.handleGoogleSignIn();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    goToPhase2() {
        const username = document.getElementById('username')?.value;
        const phone = document.getElementById('phone')?.value;

        if (!username || !phone) {
            this.showError('Please enter both username and phone number');
            return;
        }

        // Validate phone number (basic validation)
        if (phone.length < 10) {
            this.showError('Please enter a valid phone number');
            return;
        }

        this.currentPhase = 2;
        this.updatePhaseIndicator();
        this.switchPhase(2);
    }

    goToPhase1() {
        this.currentPhase = 1;
        this.updatePhaseIndicator();
        this.switchPhase(1);
    }

    switchPhase(phase) {
        const phase1 = document.getElementById('login-phase-1');
        const phase2 = document.getElementById('login-phase-2');

        if (phase === 1) {
            phase1?.classList.add('active');
            phase2?.classList.remove('active');
        } else {
            phase1?.classList.remove('active');
            phase2?.classList.add('active');
        }
    }

    updatePhaseIndicator() {
        const phaseSteps = document.querySelectorAll('.phase-step');
        const phaseLine = document.querySelector('.phase-line');

        phaseSteps.forEach((step, index) => {
            const phaseNum = index + 1;
            if (phaseNum < this.currentPhase) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (phaseNum === this.currentPhase) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        if (phaseLine && this.currentPhase === 2) {
            phaseLine.classList.add('active');
        } else if (phaseLine) {
            phaseLine.classList.remove('active');
        }
    }

    handleInputFocus(input) {
        const container = input.closest('.input-container');
        if (container) {
            container.classList.add('focused');
            this.animateInputLine(container, true);
        }
    }

    handleInputBlur(input) {
        const container = input.closest('.input-container');
        if (container) {
            container.classList.remove('focused');
            if (!input.value) {
                this.animateInputLine(container, false);
            }
        }
    }

    handleInputChange(input) {
        const container = input.closest('.input-container');
        if (container) {
            if (input.value) {
                container.classList.add('has-value');
            } else {
                container.classList.remove('has-value');
            }
        }
    }

    animateInputLine(container, expand) {
        const line = container.querySelector('.input-line');
        if (line) {
            if (expand) {
                line.style.width = '100%';
            } else {
                line.style.width = '0';
            }
        }
    }

    async handleLogin() {
        const username = document.getElementById('username')?.value;
        const phone = document.getElementById('phone')?.value;
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const rememberMe = document.getElementById('remember')?.checked;

        if (!username || !phone || !email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading state
        const loginBtn = document.querySelector('.login-btn:not(.phase-btn)');
        if (loginBtn) {
            const originalHTML = loginBtn.innerHTML;
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            try {
                // Simulate authentication (in production, this would be a real API call)
                await this.authenticate(username, password, email, phone);

                if (rememberMe) {
                    localStorage.setItem('remember_username', username);
                }

                this.showSuccess('Login successful!');
                
                // Navigate to dashboard
                setTimeout(() => {
                    this.showDashboard();
                }, 500);
            } catch (error) {
                this.showError(error.message || 'Login failed. Please try again.');
            } finally {
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalHTML;
            }
        }
    }

    async authenticate(username, password, email, phone) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // For demo purposes, accept any credentials
                // In production, validate against your backend
                if (username && password && email && phone) {
                    this.currentUser = {
                        id: Date.now().toString(),
                        username: username,
                        name: username,
                        email: email,
                        phone: phone,
                        type: 'local'
                    };
                    this.isAuthenticated = true;
                    localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(this.currentUser));
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    async handleGoogleSignIn() {
        try {
            if (!window.googleSheetsService) {
                this.showError('Google Sheets service not initialized. Please check your configuration.');
                return;
            }

            const userData = await window.googleSheetsService.signIn();
            this.currentUser = {
                ...userData,
                type: 'google'
            };
            this.isAuthenticated = true;
            
            this.showSuccess('Signed in with Google successfully!');
            this.showDashboard();
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showError('Failed to sign in with Google. Please try again.');
        }
    }

    async handleLogout() {
        try {
            // Sign out from Google if using Google auth
            if (this.currentUser?.type === 'google' && window.googleSheetsService) {
                await window.googleSheetsService.signOut();
            }

            this.currentUser = null;
            this.isAuthenticated = false;
            localStorage.removeItem(CONFIG.STORAGE.USER);
            localStorage.removeItem(CONFIG.STORAGE.TOKEN);
            localStorage.removeItem(CONFIG.STORAGE.ACCOUNTS);
            localStorage.removeItem(CONFIG.STORAGE.TRANSACTIONS);

            this.showLogin();
            this.showSuccess('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Error during logout');
        }
    }

    showDashboard() {
        const loginScreen = document.getElementById('login-screen');
        const dashboardScreen = document.getElementById('dashboard-screen');
        const loadingScreen = document.getElementById('loading-screen');

        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }

        if (dashboardScreen) {
            dashboardScreen.classList.remove('hidden');
            this.updateUI();
            
            // Initialize dashboard
            if (window.dashboardManager) {
                window.dashboardManager.init();
            }
        }
    }

    showLogin() {
        const loginScreen = document.getElementById('login-screen');
        const dashboardScreen = document.getElementById('dashboard-screen');

        if (dashboardScreen) {
            dashboardScreen.classList.add('hidden');
        }

        if (loginScreen) {
            loginScreen.classList.remove('hidden');
            
            // Reset to phase 1
            this.currentPhase = 1;
            this.updatePhaseIndicator();
            this.switchPhase(1);
            
            // Load remembered username
            const rememberedUsername = localStorage.getItem('remember_username');
            if (rememberedUsername) {
                const usernameInput = document.getElementById('username');
                if (usernameInput) {
                    usernameInput.value = rememberedUsername;
                }
            }
        }
    }

    updateUI() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = this.currentUser.name || this.currentUser.username;
            }

            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar && this.currentUser.image) {
                userAvatar.innerHTML = `<img src="${this.currentUser.image}" alt="User Avatar">`;
            }
        }
    }


    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        }
    }

    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize Auth Manager
let authManager = null;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;
    
    // Check if user is already authenticated
    if (authManager.isUserAuthenticated()) {
        authManager.showDashboard();
    } else {
        // Hide loading screen after a delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1500);
    }
});

