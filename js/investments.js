// ===== INVESTMENTS MANAGER =====

class InvestmentsManager {
    constructor() {
        this.investments = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addInvestmentBtn = document.getElementById('add-investment-btn');
        if (addInvestmentBtn) {
            addInvestmentBtn.addEventListener('click', () => {
                this.showAddInvestmentModal();
            });
        }
    }

    async loadInvestments() {
        try {
            showToast('Loading investments...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                const accountDetails = await window.googleSheetsService.getAccountDetails();
                this.investments = accountDetails.investments || [];
            } else {
                this.loadDemoInvestments();
            }

            this.updateSummary();
            this.renderInvestments();
            showToast('Investments loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading investments:', error);
            this.loadDemoInvestments();
            this.updateSummary();
            this.renderInvestments();
            showToast('Using demo data. Please configure Google Sheets for live data.', 'warning');
        }
    }

    loadDemoInvestments() {
        this.investments = [
            {
                id: 1,
                name: 'Fixed Deposit',
                type: 'Fixed Deposit',
                amount: 500000.00,
                currentValue: 525000.00,
                returns: 25000.00,
                roi: 5.0,
                date: '2024-01-15',
                maturityDate: '2025-01-15',
                status: 'active'
            },
            {
                id: 2,
                name: 'Mutual Fund - Equity',
                type: 'Mutual Fund',
                amount: 100000.00,
                currentValue: 115000.00,
                returns: 15000.00,
                roi: 15.0,
                date: '2023-06-01',
                status: 'active'
            },
            {
                id: 3,
                name: 'Stocks Portfolio',
                type: 'Stocks',
                amount: 200000.00,
                currentValue: 230000.00,
                returns: 30000.00,
                roi: 15.0,
                date: '2023-03-10',
                status: 'active'
            },
            {
                id: 4,
                name: 'PPF Account',
                type: 'PPF',
                amount: 150000.00,
                currentValue: 165000.00,
                returns: 15000.00,
                roi: 7.5,
                date: '2022-01-01',
                status: 'active'
            }
        ];
    }

    updateSummary() {
        const totalInvestments = this.investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalReturns = this.investments.reduce((sum, inv) => sum + (inv.returns || 0), 0);
        const avgROI = totalInvestments > 0 ? (totalReturns / totalInvestments) * 100 : 0;

        this.updateElement('total-investments', this.formatCurrency(totalInvestments));
        this.updateElement('investment-returns', this.formatCurrency(totalReturns));
        this.updateElement('investment-roi', `${avgROI.toFixed(2)}%`);
    }

    renderInvestments() {
        const container = document.getElementById('investments-list');
        if (!container) return;

        if (this.investments.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No investments found. Add your first investment to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.investments.map(investment => {
            const isPositive = (investment.returns || 0) >= 0;
            const returnClass = isPositive ? 'positive' : 'negative';

            return `
                <div class="investment-item">
                    <div class="investment-header">
                        <div class="investment-icon">
                            <i class="fas ${this.getInvestmentIcon(investment.type)}"></i>
                        </div>
                        <div class="investment-info">
                            <h3>${investment.name}</h3>
                            <p class="investment-type">${investment.type}</p>
                        </div>
                        <div class="investment-status ${investment.status}">
                            ${investment.status === 'active' ? 'Active' : 'Matured'}
                        </div>
                    </div>
                    <div class="investment-details">
                        <div class="investment-detail-row">
                            <span class="detail-label">Invested Amount</span>
                            <span class="detail-value">${this.formatCurrency(investment.amount)}</span>
                        </div>
                        <div class="investment-detail-row">
                            <span class="detail-label">Current Value</span>
                            <span class="detail-value">${this.formatCurrency(investment.currentValue || investment.amount)}</span>
                        </div>
                        <div class="investment-detail-row">
                            <span class="detail-label">Returns</span>
                            <span class="detail-value ${returnClass}">
                                ${isPositive ? '+' : ''}${this.formatCurrency(investment.returns || 0)}
                            </span>
                        </div>
                        <div class="investment-detail-row">
                            <span class="detail-label">ROI</span>
                            <span class="detail-value ${returnClass}">${investment.roi.toFixed(2)}%</span>
                        </div>
                        <div class="investment-detail-row">
                            <span class="detail-label">Invested Date</span>
                            <span class="detail-value">${this.formatDate(investment.date)}</span>
                        </div>
                        ${investment.maturityDate ? `
                            <div class="investment-detail-row">
                                <span class="detail-label">Maturity Date</span>
                                <span class="detail-value">${this.formatDate(investment.maturityDate)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="investment-actions">
                        <button class="btn-secondary btn-small" onclick="window.investmentsManager.viewDetails(${investment.id})">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button class="btn-secondary btn-small" onclick="window.investmentsManager.editInvestment(${investment.id})">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getInvestmentIcon(type) {
        const icons = {
            'Fixed Deposit': 'fa-certificate',
            'Mutual Fund': 'fa-chart-pie',
            'Stocks': 'fa-chart-line',
            'PPF': 'fa-piggy-bank',
            'FD': 'fa-certificate',
            'Equity': 'fa-chart-line'
        };
        return icons[type] || 'fa-chart-line';
    }

    showAddInvestmentModal() {
        const modalHTML = `
            <form id="add-investment-form" class="modal-form">
                <div class="form-group">
                    <label>Investment Name</label>
                    <input type="text" id="investment-name" class="form-input" placeholder="e.g., Fixed Deposit, Mutual Fund" required>
                </div>
                <div class="form-group">
                    <label>Investment Type</label>
                    <select id="investment-type" class="form-input" required>
                        <option value="">Select Type</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="Mutual Fund">Mutual Fund</option>
                        <option value="Stocks">Stocks</option>
                        <option value="PPF">PPF</option>
                        <option value="Equity">Equity</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Invested Amount (₹)</label>
                    <input type="number" id="investment-amount" class="form-input" placeholder="0.00" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Current Value (₹)</label>
                    <input type="number" id="investment-current-value" class="form-input" placeholder="0.00" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>ROI (%)</label>
                    <input type="number" id="investment-roi" class="form-input" placeholder="0.00" step="0.01">
                </div>
                <div class="form-group">
                    <label>Invested Date</label>
                    <input type="date" id="investment-date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Maturity Date (Optional)</label>
                    <input type="date" id="investment-maturity-date" class="form-input">
                </div>
                <button type="submit" class="btn-primary btn-large">Add Investment</button>
            </form>
        `;

        if (window.appManager) {
            window.appManager.showModal('Add Investment', modalHTML);
        }

        // Setup form handler
        const form = document.getElementById('add-investment-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddInvestment();
            });
        }
    }

    async handleAddInvestment() {
        const investmentData = {
            name: document.getElementById('investment-name').value,
            type: document.getElementById('investment-type').value,
            amount: parseFloat(document.getElementById('investment-amount').value),
            currentValue: parseFloat(document.getElementById('investment-current-value').value) || parseFloat(document.getElementById('investment-amount').value),
            roi: parseFloat(document.getElementById('investment-roi').value) || 0,
            date: document.getElementById('investment-date').value,
            maturityDate: document.getElementById('investment-maturity-date').value || null,
            status: 'active'
        };

        investmentData.returns = investmentData.currentValue - investmentData.amount;

        try {
            showToast('Adding investment...', 'info');

            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                await window.googleSheetsService.updateAccountDetails({
                    type: 'Investment',
                    name: investmentData.name,
                    amount: investmentData.amount,
                    notes: `ROI: ${investmentData.roi}%, Current Value: ${investmentData.currentValue}`
                });
                showToast('Investment added successfully!', 'success');
            } else {
                investmentData.id = Date.now();
                this.investments.push(investmentData);
                showToast('Investment added (demo mode). Sign in with Google to save permanently.', 'warning');
            }

            this.updateSummary();
            this.renderInvestments();
            if (window.appManager) {
                window.appManager.closeModal();
            }

            // Add notification
            if (window.notificationsManager) {
                window.notificationsManager.addNotification({
                    type: 'investment',
                    title: 'Investment Added',
                    message: `${investmentData.name} of ${this.formatCurrency(investmentData.amount)} has been added`,
                    icon: 'fa-chart-line',
                    color: 'success'
                });
            }
        } catch (error) {
            console.error('Error adding investment:', error);
            showToast('Failed to add investment. Please try again.', 'error');
        }
    }

    viewDetails(id) {
        const investment = this.investments.find(inv => inv.id === id);
        if (!investment) {
            showToast('Investment not found', 'error');
            return;
        }

        const detailsHTML = `
            <div class="investment-details-modal">
                <div class="detail-section">
                    <h4>Investment Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name</span>
                            <span class="detail-value">${investment.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type</span>
                            <span class="detail-value">${investment.type}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Invested Amount</span>
                            <span class="detail-value">${this.formatCurrency(investment.amount)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Current Value</span>
                            <span class="detail-value">${this.formatCurrency(investment.currentValue || investment.amount)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Returns</span>
                            <span class="detail-value">${this.formatCurrency(investment.returns || 0)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ROI</span>
                            <span class="detail-value">${investment.roi.toFixed(2)}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Invested Date</span>
                            <span class="detail-value">${this.formatDate(investment.date)}</span>
                        </div>
                        ${investment.maturityDate ? `
                            <div class="detail-item">
                                <span class="detail-label">Maturity Date</span>
                                <span class="detail-value">${this.formatDate(investment.maturityDate)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        if (window.appManager) {
            window.appManager.showModal('Investment Details', detailsHTML);
        }
    }

    editInvestment(id) {
        showToast('Edit feature coming soon!', 'info');
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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Initialize Investments Manager
let investmentsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    investmentsManager = new InvestmentsManager();
    window.investmentsManager = investmentsManager;
});

