// ===== PAYMENTS MANAGER =====

class PaymentsManager {
    constructor() {
        this.payments = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addBillBtn = document.getElementById('add-bill-btn');
        if (addBillBtn) {
            addBillBtn.addEventListener('click', () => {
                this.showPayBillModal();
            });
        }
    }

    async loadPayments() {
        try {
            showToast('Loading payments...', 'info');

            // Load from Google Sheets or use demo data
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                const transactions = await window.googleSheetsService.getTransactions();
                this.payments = transactions.filter(t => t.category === 'Utilities' || t.category === 'Bills');
            } else {
                this.loadDemoPayments();
            }

            this.renderPayments();
            showToast('Payments loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading payments:', error);
            this.loadDemoPayments();
            this.renderPayments();
            showToast('Using demo data. Please configure Google Sheets for live data.', 'warning');
        }
    }

    loadDemoPayments() {
        this.payments = [
            {
                id: 1,
                billType: 'Electricity',
                provider: 'State Electricity Board',
                amount: 2500.00,
                dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                status: 'pending',
                accountNumber: 'EB-123456789',
                lastPaid: new Date(Date.now() - 2592000000).toISOString().split('T')[0]
            },
            {
                id: 2,
                billType: 'Water',
                provider: 'Municipal Corporation',
                amount: 800.00,
                dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                status: 'pending',
                accountNumber: 'WC-987654321',
                lastPaid: new Date(Date.now() - 2592000000).toISOString().split('T')[0]
            },
            {
                id: 3,
                billType: 'Internet',
                provider: 'Broadband Provider',
                amount: 1200.00,
                dueDate: new Date(Date.now() + 432000000).toISOString().split('T')[0],
                status: 'paid',
                accountNumber: 'INT-456789123',
                lastPaid: new Date(Date.now() - 86400000).toISOString().split('T')[0]
            },
            {
                id: 4,
                billType: 'Mobile',
                provider: 'Telecom Provider',
                amount: 500.00,
                dueDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
                status: 'pending',
                accountNumber: 'MOB-789123456',
                lastPaid: new Date(Date.now() - 2592000000).toISOString().split('T')[0]
            }
        ];
    }

    renderPayments() {
        const container = document.getElementById('payments-grid');
        if (!container) return;

        if (this.payments.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-file-invoice-dollar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No bills found. Add your first bill to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.payments.map(payment => {
            const isOverdue = new Date(payment.dueDate) < new Date() && payment.status === 'pending';
            const daysUntilDue = Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

            return `
                <div class="payment-card ${payment.status} ${isOverdue ? 'overdue' : ''}">
                    <div class="payment-header">
                        <div class="payment-icon ${payment.billType.toLowerCase()}">
                            <i class="fas ${this.getBillIcon(payment.billType)}"></i>
                        </div>
                        <div class="payment-status-badge ${payment.status}">
                            ${payment.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                        </div>
                    </div>
                    <div class="payment-content">
                        <h3>${payment.billType}</h3>
                        <p class="payment-provider">${payment.provider}</p>
                        <p class="payment-account">Account: ${payment.accountNumber}</p>
                        <div class="payment-amount">
                            <span class="amount-label">Amount Due</span>
                            <span class="amount-value">${this.formatCurrency(payment.amount)}</span>
                        </div>
                        <div class="payment-due">
                            <i class="fas fa-calendar"></i>
                            <span>Due: ${this.formatDate(payment.dueDate)}</span>
                            ${!isOverdue && payment.status === 'pending' ? `<span class="due-days">(${daysUntilDue} days left)</span>` : ''}
                        </div>
                    </div>
                    <div class="payment-actions">
                        ${payment.status === 'pending' ? `
                            <button class="btn-primary btn-small" onclick="window.paymentsManager.payBill(${payment.id})">
                                <i class="fas fa-credit-card"></i>
                                Pay Now
                            </button>
                        ` : `
                            <button class="btn-secondary btn-small" onclick="window.paymentsManager.viewReceipt(${payment.id})">
                                <i class="fas fa-receipt"></i>
                                View Receipt
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    getBillIcon(billType) {
        const icons = {
            'Electricity': 'fa-bolt',
            'Water': 'fa-tint',
            'Gas': 'fa-fire',
            'Internet': 'fa-wifi',
            'Mobile': 'fa-mobile-alt',
            'Insurance': 'fa-shield-alt',
            'Credit Card': 'fa-credit-card'
        };
        return icons[billType] || 'fa-file-invoice-dollar';
    }

    showPayBillModal() {
        const modalHTML = `
            <form id="pay-bill-form" class="modal-form">
                <div class="form-group">
                    <label>Bill Type</label>
                    <select id="bill-type" class="form-input" required>
                        <option value="">Select Bill Type</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water</option>
                        <option value="Gas">Gas</option>
                        <option value="Internet">Internet</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Credit Card">Credit Card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Provider Name</label>
                    <input type="text" id="bill-provider" class="form-input" placeholder="Provider name" required>
                </div>
                <div class="form-group">
                    <label>Account Number</label>
                    <input type="text" id="bill-account" class="form-input" placeholder="Bill account number" required>
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="bill-amount" class="form-input" placeholder="0.00" min="0.01" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="bill-due-date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Select Account</label>
                    <select id="payment-account" class="form-input" required>
                        <option value="">Select Account</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary btn-large">Pay Bill</button>
            </form>
        `;

        if (window.appManager) {
            window.appManager.showModal('Pay Bill', modalHTML);
        }

        // Populate accounts
        this.populateAccounts('payment-account');

        // Setup form handler
        const form = document.getElementById('pay-bill-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePayBill();
            });
        }
    }

    async populateAccounts(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        try {
            let accounts = [];
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                accounts = await window.googleSheetsService.getAccounts();
            } else if (window.accountsManager) {
                accounts = window.accountsManager.accounts || [];
            }

            select.innerHTML = '<option value="">Select Account</option>' + 
                accounts.map(acc => 
                    `<option value="${acc.accountNumber}">${acc.accountName} (${acc.accountNumber}) - ${this.formatCurrency(acc.balance)}</option>`
                ).join('');
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }

    async handlePayBill() {
        const billData = {
            billType: document.getElementById('bill-type').value,
            provider: document.getElementById('bill-provider').value,
            accountNumber: document.getElementById('bill-account').value,
            amount: parseFloat(document.getElementById('bill-amount').value),
            dueDate: document.getElementById('bill-due-date').value,
            paymentAccount: document.getElementById('payment-account').value
        };

        try {
            showToast('Processing payment...', 'info');

            // Create transaction
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                await window.googleSheetsService.addTransaction({
                    description: `${billData.billType} Bill - ${billData.provider}`,
                    category: 'Bills',
                    type: 'expense',
                    amount: billData.amount,
                    accountNumber: billData.paymentAccount,
                    notes: `Bill Account: ${billData.accountNumber}`
                });
            }

            // Add notification
            if (window.notificationsManager) {
                window.notificationsManager.addNotification({
                    type: 'payment',
                    title: 'Bill Paid Successfully',
                    message: `Your ${billData.billType} bill of ${this.formatCurrency(billData.amount)} has been paid`,
                    icon: 'fa-check-circle',
                    color: 'success'
                });
            }

            showToast('Bill paid successfully!', 'success');
            if (window.appManager) {
                window.appManager.closeModal();
            }

            // Reload payments
            await this.loadPayments();

            // Reload dashboard
            if (window.dashboardManager) {
                window.dashboardManager.loadDashboard();
            }
        } catch (error) {
            console.error('Error paying bill:', error);
            showToast('Failed to pay bill. Please try again.', 'error');
        }
    }

    async payBill(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) {
            showToast('Payment not found', 'error');
            return;
        }

        this.showPayBillModal();
        // Pre-fill form with payment data
        setTimeout(() => {
            document.getElementById('bill-type').value = payment.billType;
            document.getElementById('bill-provider').value = payment.provider;
            document.getElementById('bill-account').value = payment.accountNumber;
            document.getElementById('bill-amount').value = payment.amount;
            document.getElementById('bill-due-date').value = payment.dueDate;
        }, 100);
    }

    viewReceipt(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) {
            showToast('Payment not found', 'error');
            return;
        }

        showToast('Receipt feature coming soon!', 'info');
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
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize Payments Manager
let paymentsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    paymentsManager = new PaymentsManager();
    window.paymentsManager = paymentsManager;
});

