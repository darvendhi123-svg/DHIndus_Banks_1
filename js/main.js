// ===== MAIN APPLICATION LOGIC =====

class AppManager {
    constructor() {
        this.currentScreen = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupGlobalSearch();
    }

    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (sidebar && sidebar.classList.contains('active')) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            }
        });

        // Quick actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session data
            if (window.googleSheetsService) {
                window.googleSheetsService.signOut();
            }
            
            // Show login screen
            const loginScreen = document.getElementById('login-screen');
            const dashboardScreen = document.getElementById('dashboard-screen');
            
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (dashboardScreen) dashboardScreen.classList.add('hidden');
            
            showToast('Logged out successfully', 'success');
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = item.getAttribute('data-screen');
                this.navigateToScreen(screen);
            });
        });

        // Update active nav item
        this.updateActiveNav();
    }

    navigateToScreen(screenName) {
        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(`${screenName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentScreen = screenName;
            this.updateActiveNav();

            // Initialize screen-specific functionality
            this.initScreen(screenName);
        } else {
            console.error(`Screen section not found: ${screenName}-section`);
        }
    }

    initScreen(screenName) {
        switch (screenName) {
            case 'dashboard':
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
                break;
            case 'accounts':
                if (window.accountsManager) {
                    window.accountsManager.loadAccounts();
                }
                break;
            case 'transactions':
                if (window.transactionsManager) {
                    window.transactionsManager.loadTransactions();
                }
                break;
            case 'transfer':
                if (window.transactionsManager) {
                    window.transactionsManager.initTransferForm();
                }
                break;
            case 'payments':
                if (window.paymentsManager) {
                    window.paymentsManager.loadPayments();
                }
                break;
            case 'investments':
                if (window.investmentsManager) {
                    window.investmentsManager.loadInvestments();
                }
                break;
            case 'cards':
                if (window.cardsManager) {
                    window.cardsManager.loadCards();
                }
                break;
            case 'settings':
                if (window.settingsManager) {
                    // Settings are already initialized
                }
                break;
        }
    }

    updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-screen') === this.currentScreen) {
                item.classList.add('active');
            }
        });
    }

    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length > 2) {
                    searchTimeout = setTimeout(() => {
                        this.performSearch(query);
                    }, 300);
                }
            });
        }
    }

    async performSearch(query) {
        try {
            if (!window.googleSheetsService) {
                return;
            }

            const transactions = await window.googleSheetsService.getTransactions();
            const accounts = await window.googleSheetsService.getAccounts();

            const results = {
                transactions: transactions.filter(t => 
                    t.description.toLowerCase().includes(query.toLowerCase()) ||
                    t.category.toLowerCase().includes(query.toLowerCase())
                ),
                accounts: accounts.filter(a =>
                    a.accountName.toLowerCase().includes(query.toLowerCase()) ||
                    a.accountNumber.includes(query)
                )
            };

            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        // This would show search results in a modal or dropdown
        console.log('Search results:', results);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'transfer':
                this.navigateToScreen('transfer');
                break;
            case 'deposit':
                this.showModal('Deposit Money', this.getDepositFormHTML());
                break;
            case 'withdraw':
                this.showModal('Withdraw Money', this.getWithdrawFormHTML());
                break;
            case 'pay-bills':
                this.showModal('Pay Bills', this.getPayBillsFormHTML());
                break;
            case 'invest':
                this.navigateToScreen('investments');
                break;
            case 'cards':
                this.navigateToScreen('cards');
                break;
            default:
                showToast(`Action "${action}" is coming soon!`, 'info');
        }
    }

    getDepositFormHTML() {
        return `
            <form id="deposit-form" class="modal-form">
                <div class="form-group">
                    <label>Select Account</label>
                    <select id="deposit-account" class="form-input" required></select>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="deposit-amount" class="form-input" placeholder="0.00" min="0.01" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="deposit-description" class="form-input" placeholder="Deposit description" required>
                </div>
                <button type="submit" class="btn-primary btn-large">Deposit Money</button>
            </form>
        `;
    }

    getWithdrawFormHTML() {
        return `
            <form id="withdraw-form" class="modal-form">
                <div class="form-group">
                    <label>Select Account</label>
                    <select id="withdraw-account" class="form-input" required></select>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="withdraw-amount" class="form-input" placeholder="0.00" min="0.01" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="withdraw-description" class="form-input" placeholder="Withdrawal description" required>
                </div>
                <button type="submit" class="btn-primary btn-large">Withdraw Money</button>
            </form>
        `;
    }

    getPayBillsFormHTML() {
        return `
            <form id="pay-bills-form" class="modal-form">
                <div class="form-group">
                    <label>Bill Type</label>
                    <select id="bill-type" class="form-input" required>
                        <option value="">Select Bill Type</option>
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="gas">Gas</option>
                        <option value="internet">Internet</option>
                        <option value="mobile">Mobile</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Account</label>
                    <select id="bill-account" class="form-input" required></select>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="bill-amount" class="form-input" placeholder="0.00" min="0.01" step="0.01" required>
                </div>
                <button type="submit" class="btn-primary btn-large">Pay Bill</button>
            </form>
        `;
    }

    showModal(title, content, large = false) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalOverlay = document.getElementById('modal-overlay');

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (modalOverlay) modalOverlay.classList.remove('hidden');
        
        // Add large class if needed
        if (modal) {
            if (large) {
                modal.classList.add('large');
            } else {
                modal.classList.remove('large');
            }
        }

        // Setup form handlers
        this.setupModalForms();
    }

    setupModalForms() {
        // Deposit form
        const depositForm = document.getElementById('deposit-form');
        if (depositForm) {
            depositForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Handle deposit
                showToast('Deposit feature will be implemented', 'info');
                this.closeModal();
            });
        }

        // Withdraw form
        const withdrawForm = document.getElementById('withdraw-form');
        if (withdrawForm) {
            withdrawForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Handle withdrawal
                showToast('Withdrawal feature will be implemented', 'info');
                this.closeModal();
            });
        }

        // Pay bills form
        const payBillsForm = document.getElementById('pay-bills-form');
        if (payBillsForm) {
            payBillsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Handle bill payment
                showToast('Bill payment feature will be implemented', 'info');
                this.closeModal();
            });
        }
    }

    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    }
}

// Toast Notification Function
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
}

// Modal close handlers
document.addEventListener('DOMContentLoaded', () => {
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }
});

// Initialize App Manager
let appManager = null;

document.addEventListener('DOMContentLoaded', () => {
    appManager = new AppManager();
    window.appManager = appManager;
    window.showToast = showToast;
});

