// ===== TRANSACTIONS MANAGER =====

class TransactionsManager {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const filterSelect = document.getElementById('transaction-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterTransactions();
            });
        }

        const exportBtn = document.getElementById('export-transactions');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTransactions();
            });
        }

        const transferForm = document.getElementById('transfer-form');
        if (transferForm) {
            transferForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTransfer();
            });
        }
    }

    async loadTransactions() {
        try {
            showToast('Loading transactions...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                this.transactions = await window.googleSheetsService.getTransactions();
            } else {
                this.loadDemoTransactions();
            }

            this.filterTransactions();
            showToast('Transactions loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.loadDemoTransactions();
            this.filterTransactions();
            showToast('Using demo data. Please configure Google Sheets for live data.', 'warning');
        }
    }

    loadDemoTransactions() {
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
            },
            {
                id: 4,
                date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
                time: '11:20',
                description: 'Refund Received',
                category: 'Refund',
                type: 'income',
                amount: 850.00,
                accountNumber: '****1234',
                balance: 122550.00,
                status: 'completed'
            },
            {
                id: 5,
                date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
                time: '09:15',
                description: 'Transfer to John Doe',
                category: 'Transfer',
                type: 'transfer',
                amount: 5000.00,
                accountNumber: '****1234',
                balance: 117550.00,
                status: 'completed'
            }
        ];
    }

    filterTransactions() {
        if (this.currentFilter === 'all') {
            this.filteredTransactions = this.transactions;
        } else {
            this.filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }

        this.renderTransactions();
    }

    renderTransactions() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        if (this.filteredTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No transactions found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredTransactions.map(transaction => {
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            return `
                <tr>
                    <td class="transaction-date-cell">${formattedDate}<br><small style="color: var(--text-muted);">${transaction.time}</small></td>
                    <td class="transaction-desc-cell">${transaction.description}</td>
                    <td>
                        <span class="transaction-category-cell ${transaction.type}">${transaction.category}</span>
                    </td>
                    <td class="transaction-amount-cell ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}${this.formatCurrency(transaction.amount)}
                    </td>
                    <td class="transaction-balance-cell">${this.formatCurrency(transaction.balance)}</td>
                    <td>
                        <span class="transaction-status-cell ${transaction.status}">
                            <i class="fas fa-circle" style="font-size: 0.5rem;"></i>
                            ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async handleTransfer() {
        const fromAccount = document.getElementById('from-account').value;
        const toAccount = document.getElementById('to-account').value;
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const notes = document.getElementById('transfer-notes').value;

        if (!fromAccount || !toAccount || !amount || amount <= 0) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            showToast('Processing transfer...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                // Get account balance
                const accounts = await window.googleSheetsService.getAccounts();
                const account = accounts.find(acc => acc.accountNumber === fromAccount);

                if (!account) {
                    showToast('Account not found', 'error');
                    return;
                }

                if (account.balance < amount) {
                    showToast('Insufficient balance', 'error');
                    return;
                }

                // Add transaction
                await window.googleSheetsService.addTransaction({
                    description: `Transfer to ${toAccount}`,
                    category: 'Transfer',
                    type: 'expense',
                    amount: amount,
                    accountNumber: fromAccount,
                    balance: account.balance - amount,
                    notes: notes
                });

                showToast('Transfer completed successfully!', 'success');
                
                // Reset form
                document.getElementById('transfer-form').reset();
                
                // Reload dashboard
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
            } else {
                showToast('Please sign in with Google to use this feature', 'warning');
            }
        } catch (error) {
            console.error('Transfer error:', error);
            showToast('Transfer failed. Please try again.', 'error');
        }
    }

    async initTransferForm() {
        const fromAccountSelect = document.getElementById('from-account');
        if (!fromAccountSelect) return;

        try {
            let accounts = [];
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                accounts = await window.googleSheetsService.getAccounts();
            } else {
                accounts = window.dashboardManager?.accounts || [];
            }

            fromAccountSelect.innerHTML = '<option value="">Select Account</option>' +
                accounts.map(acc => 
                    `<option value="${acc.accountNumber}">${acc.accountName} (${acc.accountNumber}) - ${this.formatCurrency(acc.balance)}</option>`
                ).join('');
        } catch (error) {
            console.error('Error loading accounts for transfer:', error);
        }
    }

    exportTransactions() {
        if (this.filteredTransactions.length === 0) {
            showToast('No transactions to export', 'warning');
            return;
        }

        // Convert to CSV
        const headers = ['Date', 'Time', 'Description', 'Category', 'Type', 'Amount', 'Account', 'Balance', 'Status'];
        const rows = this.filteredTransactions.map(t => [
            t.date,
            t.time,
            t.description,
            t.category,
            t.type,
            t.amount,
            t.accountNumber,
            t.balance,
            t.status
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        showToast('Transactions exported successfully', 'success');
    }

    formatCurrency(amount) {
        return `${CONFIG.APP.CURRENCY}${amount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }
}

// Initialize Transactions Manager
let transactionsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    transactionsManager = new TransactionsManager();
    window.transactionsManager = transactionsManager;
});

