// ===== DASHBOARD MANAGER =====

class DashboardManager {
    constructor() {
        this.accounts = [];
        this.transactions = [];
        this.accountDetails = null;
        this.init();
    }

    async init() {
        await this.loadDashboard();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboard();
            });
        }
    }

    async loadDashboard() {
        try {
            showToast('Loading dashboard data...', 'info');

            // Load data from Google Sheets
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                this.accounts = await window.googleSheetsService.getAccounts();
                this.transactions = await window.googleSheetsService.getTransactions(10); // Last 10 transactions
                this.accountDetails = await window.googleSheetsService.getAccountDetails();
            } else {
                // Use demo data if Google Sheets is not configured
                this.loadDemoData();
            }

            this.updateBalanceCards();
            this.updateRecentTransactions();
            this.updateAccountSummary();

            showToast('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.loadDemoData();
            showToast('Using demo data. Please configure Google Sheets for live data.', 'warning');
        }
    }

    loadDemoData() {
        // Demo accounts
        this.accounts = [
            {
                id: 1,
                accountNumber: '****1234',
                accountType: 'Savings',
                accountName: 'Primary Savings Account',
                balance: 125450.00,
                currency: 'INR',
                status: 'Active'
            },
            {
                id: 2,
                accountNumber: '****5678',
                accountType: 'Current',
                accountName: 'Current Account',
                balance: 45000.00,
                currency: 'INR',
                status: 'Active'
            }
        ];

        // Demo transactions
        this.transactions = [
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                time: '10:30',
                description: 'Salary Credit',
                category: 'Salary',
                type: 'income',
                amount: 45000.00,
                accountNumber: '****1234',
                balance: 125450.00,
                status: 'completed'
            },
            {
                id: 2,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                time: '14:15',
                description: 'Electricity Bill Payment',
                category: 'Utilities',
                type: 'expense',
                amount: 2500.00,
                accountNumber: '****1234',
                balance: 122950.00,
                status: 'completed'
            },
            {
                id: 3,
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
                time: '16:45',
                description: 'Online Purchase',
                category: 'Shopping',
                type: 'expense',
                amount: 1250.00,
                accountNumber: '****1234',
                balance: 121700.00,
                status: 'completed'
            }
        ];

        // Demo account details
        this.accountDetails = {
            totalAssets: 625450.00,
            totalLiabilities: 250000.00,
            netWorth: 375450.00,
            investments: [
                { name: 'Fixed Deposit', amount: 500000.00, date: '2024-01-15' }
            ],
            loans: [
                { name: 'Home Loan', amount: 250000.00, date: '2023-06-01' }
            ]
        };
    }

    updateBalanceCards() {
        // Calculate totals
        const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const savingsAccount = this.accounts.find(acc => acc.accountType === 'Savings') || this.accounts[0];
        
        // Calculate monthly income and expenses
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });

        const monthIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Update UI
        this.updateElement('total-balance', this.formatCurrency(totalBalance));
        this.updateElement('savings-balance', this.formatCurrency(savingsAccount.balance));
        this.updateElement('month-income', this.formatCurrency(monthIncome));
        this.updateElement('month-expense', this.formatCurrency(monthExpense));
    }

    updateRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="transaction-item">
                    <div class="transaction-details">
                        <span class="transaction-title">No transactions yet</span>
                        <span class="transaction-date">Start by making your first transaction</span>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.slice(0, 5).map(transaction => {
            const iconClass = transaction.type === 'income' ? 'income' : 'expense';
            const icon = transaction.type === 'income' 
                ? 'fa-arrow-down' 
                : transaction.type === 'expense' 
                    ? 'fa-arrow-up' 
                    : 'fa-exchange-alt';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-title">${transaction.description}</span>
                        <span class="transaction-date">${this.formatDate(transaction.date)} • ${transaction.time}</span>
                    </div>
                    <div class="transaction-amount ${iconClass}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAccountSummary() {
        if (!this.accountDetails) return;

        // Update chart if available
        if (window.chartManager) {
            window.chartManager.updateChart(this.transactions);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return `${CONFIG.APP.CURRENCY}${amount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    }
}

// Initialize Dashboard Manager
let dashboardManager = null;

document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager;
});

