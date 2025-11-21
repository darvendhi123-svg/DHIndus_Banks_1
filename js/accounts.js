// ===== ACCOUNTS MANAGER =====

class AccountsManager {
    constructor() {
        this.accounts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addAccountBtn = document.getElementById('add-account-btn');
        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', () => {
                this.showAddAccountModal();
            });
        }
    }

    async loadAccounts() {
        try {
            showToast('Loading accounts...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                this.accounts = await window.googleSheetsService.getAccounts();
            } else {
                this.loadDemoAccounts();
            }

            this.renderAccounts();
            showToast('Accounts loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.loadDemoAccounts();
            this.renderAccounts();
            showToast('Using demo data. Please configure Google Sheets for live data.', 'warning');
        }
    }

    loadDemoAccounts() {
        this.accounts = [
            {
                id: 1,
                accountNumber: '****1234',
                accountType: 'Savings',
                accountName: 'Primary Savings Account',
                balance: 125450.00,
                currency: 'INR',
                status: 'Active',
                openedDate: '2020-01-15',
                branch: 'Main Branch'
            },
            {
                id: 2,
                accountNumber: '****5678',
                accountType: 'Current',
                accountName: 'Current Account',
                balance: 45000.00,
                currency: 'INR',
                status: 'Active',
                openedDate: '2021-03-20',
                branch: 'Main Branch'
            },
            {
                id: 3,
                accountNumber: 'FD-001234',
                accountType: 'Fixed Deposit',
                accountName: 'Fixed Deposit Account',
                balance: 500000.00,
                currency: 'INR',
                status: 'Active',
                openedDate: '2024-01-15',
                branch: 'Main Branch'
            }
        ];
    }

    renderAccounts() {
        const container = document.getElementById('accounts-grid');
        if (!container) return;

        if (this.accounts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-wallet" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No accounts found. Add your first account to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.accounts.map(account => {
            const iconClass = account.accountType.toLowerCase();
            const icon = this.getAccountIcon(account.accountType);

            return `
                <div class="account-card">
                    <div class="account-card-header">
                        <div class="account-type">
                            <div class="account-type-icon ${iconClass}">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div class="account-type-info">
                                <h3>${account.accountName}</h3>
                                <p>${account.accountType} Account</p>
                            </div>
                        </div>
                    </div>
                    <div class="account-number">${account.accountNumber}</div>
                    <div class="account-balance">
                        <p class="account-balance-label">Available Balance</p>
                        <h3 class="account-balance-amount">${this.formatCurrency(account.balance)}</h3>
                    </div>
                    <div class="account-details">
                        <div class="account-detail-item">
                            <span class="account-detail-label">Status</span>
                            <span class="account-detail-value" style="color: var(--success);">${account.status}</span>
                        </div>
                        <div class="account-detail-item">
                            <span class="account-detail-label">Opened</span>
                            <span class="account-detail-value">${this.formatDate(account.openedDate)}</span>
                        </div>
                        <div class="account-detail-item">
                            <span class="account-detail-label">Branch</span>
                            <span class="account-detail-value">${account.branch}</span>
                        </div>
                    </div>
                    <div class="account-actions">
                        <button class="account-action-btn" onclick="window.accountsManager.viewAccountDetails('${account.accountNumber}')">
                            View Details
                        </button>
                        <button class="account-action-btn primary" onclick="window.accountsManager.viewStatement('${account.accountNumber}')">
                            Statement
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getAccountIcon(type) {
        const icons = {
            'Savings': 'fa-piggy-bank',
            'Current': 'fa-wallet',
            'Fixed Deposit': 'fa-certificate',
            'Loan': 'fa-hand-holding-usd'
        };
        return icons[type] || 'fa-university';
    }

    showAddAccountModal() {
        const modalHTML = `
            <form id="add-account-form" class="modal-form">
                <div class="form-group">
                    <label>Account Number</label>
                    <input type="text" id="new-account-number" class="form-input" placeholder="Enter account number" required>
                </div>
                <div class="form-group">
                    <label>Account Type</label>
                    <select id="new-account-type" class="form-input" required>
                        <option value="">Select Account Type</option>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Account Name</label>
                    <input type="text" id="new-account-name" class="form-input" placeholder="Enter account name" required>
                </div>
                <div class="form-group">
                    <label>Initial Balance (₹)</label>
                    <input type="number" id="new-account-balance" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Branch</label>
                    <input type="text" id="new-account-branch" class="form-input" placeholder="Branch name">
                </div>
                <button type="submit" class="btn-primary btn-large">Add Account</button>
            </form>
        `;

        if (window.appManager) {
            window.appManager.showModal('Add New Account', modalHTML);
        }

        // Setup form handler
        const form = document.getElementById('add-account-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddAccount();
            });
        }
    }

    async handleAddAccount() {
        const accountData = {
            accountNumber: document.getElementById('new-account-number').value,
            accountType: document.getElementById('new-account-type').value,
            accountName: document.getElementById('new-account-name').value,
            balance: parseFloat(document.getElementById('new-account-balance').value),
            branch: document.getElementById('new-account-branch').value || 'Main Branch'
        };

        try {
            showToast('Adding account...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                await window.googleSheetsService.addAccount(accountData);
                showToast('Account added successfully!', 'success');
            } else {
                // Add to local array
                accountData.id = this.accounts.length + 1;
                accountData.status = 'Active';
                accountData.openedDate = new Date().toISOString().split('T')[0];
                this.accounts.push(accountData);
                showToast('Account added (demo mode). Sign in with Google to save permanently.', 'warning');
            }

            this.renderAccounts();
            if (window.appManager) {
                window.appManager.closeModal();
            }

            // Reload dashboard
            if (window.dashboardManager) {
                window.dashboardManager.loadDashboard();
            }
        } catch (error) {
            console.error('Error adding account:', error);
            showToast('Failed to add account. Please try again.', 'error');
        }
    }

    async viewAccountDetails(accountNumber) {
        const account = this.accounts.find(acc => acc.accountNumber === accountNumber);
        if (!account) {
            showToast('Account not found', 'error');
            return;
        }

        // Get account transactions
        let transactions = [];
        try {
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                const allTransactions = await window.googleSheetsService.getTransactions();
                transactions = allTransactions.filter(t => t.accountNumber === accountNumber).slice(0, 10);
            } else if (window.transactionsManager) {
                const allTransactions = window.transactionsManager.transactions || [];
                transactions = allTransactions.filter(t => t.accountNumber === accountNumber).slice(0, 10);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }

        // Calculate account statistics
        const accountTransactions = transactions;
        const totalIncome = accountTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = accountTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = accountTransactions.length;

        const detailsHTML = `
            <div class="account-details-modal">
                <div class="account-details-header">
                    <div class="account-header-icon">
                        <i class="fas ${this.getAccountIcon(account.accountType)}"></i>
                    </div>
                    <div class="account-header-info">
                        <h3>${account.accountName}</h3>
                        <p>${account.accountType} Account • ${account.accountNumber}</p>
                    </div>
                    <div class="account-header-balance">
                        <p class="balance-label">Available Balance</p>
                        <h2 class="balance-amount">${this.formatCurrency(account.balance)}</h2>
                    </div>
                </div>

                <div class="account-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon income">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="stat-content">
                            <p class="stat-label">Total Income</p>
                            <h4 class="stat-value">${this.formatCurrency(totalIncome)}</h4>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon expense">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="stat-content">
                            <p class="stat-label">Total Expenses</p>
                            <h4 class="stat-value">${this.formatCurrency(totalExpenses)}</h4>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div class="stat-content">
                            <p class="stat-label">Transactions</p>
                            <h4 class="stat-value">${transactionCount}</h4>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Account Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Account Number</span>
                            <span class="detail-value">${account.accountNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Account Type</span>
                            <span class="detail-value">${account.accountType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Account Name</span>
                            <span class="detail-value">${account.accountName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Balance</span>
                            <span class="detail-value">${this.formatCurrency(account.balance)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Currency</span>
                            <span class="detail-value">${account.currency || 'INR'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value" style="color: var(--success);">${account.status}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Opened Date</span>
                            <span class="detail-value">${this.formatDate(account.openedDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Branch</span>
                            <span class="detail-value">${account.branch || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                ${transactions.length > 0 ? `
                    <div class="detail-section">
                        <div class="section-header-row">
                            <h4>Recent Transactions</h4>
                            <button class="btn-secondary btn-small" onclick="window.appManager.navigateToScreen('transactions'); window.appManager.closeModal();">
                                View All
                            </button>
                        </div>
                        <div class="transactions-mini-list">
                            ${transactions.map(transaction => {
                                const iconClass = transaction.type === 'income' ? 'income' : 'expense';
                                const icon = transaction.type === 'income' 
                                    ? 'fa-arrow-down' 
                                    : transaction.type === 'expense' 
                                        ? 'fa-arrow-up' 
                                        : 'fa-exchange-alt';
                                
                                return `
                                    <div class="transaction-mini-item">
                                        <div class="transaction-mini-icon ${iconClass}">
                                            <i class="fas ${icon}"></i>
                                        </div>
                                        <div class="transaction-mini-details">
                                            <span class="transaction-mini-title">${transaction.description}</span>
                                            <span class="transaction-mini-date">${this.formatDate(transaction.date)} • ${transaction.time || ''}</span>
                                        </div>
                                        <div class="transaction-mini-amount ${iconClass}">
                                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="account-details-actions">
                    <button class="btn-primary" onclick="window.accountsManager.viewStatement('${account.accountNumber}'); window.appManager.closeModal();">
                        <i class="fas fa-file-alt"></i>
                        View Statement
                    </button>
                    <button class="btn-secondary" onclick="window.appManager.navigateToScreen('transfer'); window.appManager.closeModal();">
                        <i class="fas fa-paper-plane"></i>
                        Transfer Money
                    </button>
                </div>
            </div>
        `;

        if (window.appManager) {
            window.appManager.showModal('Account Details', detailsHTML, true);
        }
    }

    viewStatement(accountNumber) {
        showToast('Statement feature coming soon!', 'info');
        // Navigate to transactions filtered by account
        if (window.appManager) {
            window.appManager.navigateToScreen('transactions');
        }
    }

    formatCurrency(amount) {
        return `${CONFIG.APP.CURRENCY}${amount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Initialize Accounts Manager
let accountsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    accountsManager = new AccountsManager();
    window.accountsManager = accountsManager;
});

