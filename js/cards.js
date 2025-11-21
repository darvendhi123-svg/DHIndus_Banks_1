// ===== CARDS MANAGER =====

class CardsManager {
    constructor() {
        this.cards = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addCardBtn = document.getElementById('add-card-btn');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', () => {
                this.showAddCardModal();
            });
        }
    }

    async loadCards() {
        try {
            showToast('Loading cards...', 'info');

            // Load from localStorage or use demo data
            const stored = localStorage.getItem('dhindus_cards');
            if (stored) {
                this.cards = JSON.parse(stored);
            } else {
                this.loadDemoCards();
            }

            this.renderCards();
            showToast('Cards loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading cards:', error);
            this.loadDemoCards();
            this.renderCards();
        }
    }

    loadDemoCards() {
        this.cards = [
            {
                id: 1,
                cardNumber: '4532 **** **** 1234',
                cardType: 'Debit',
                bankName: 'DHIndus Banks',
                holderName: 'John Doe',
                expiryDate: '12/25',
                cvv: '***',
                status: 'active',
                balance: 125450.00,
                accountNumber: '****1234'
            },
            {
                id: 2,
                cardNumber: '5500 **** **** 5678',
                cardType: 'Credit',
                bankName: 'DHIndus Banks',
                holderName: 'John Doe',
                expiryDate: '08/26',
                cvv: '***',
                status: 'active',
                creditLimit: 100000.00,
                availableCredit: 75000.00
            }
        ];
        this.saveCards();
    }

    renderCards() {
        const container = document.getElementById('cards-grid');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-id-card" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No cards found. Add your first card to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.cards.map(card => {
            const isCredit = card.cardType === 'Credit';
            const cardClass = isCredit ? 'credit-card' : 'debit-card';

            return `
                <div class="card-item ${cardClass}">
                    <div class="card-header">
                        <div class="card-chip">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="card-status ${card.status}">
                            ${card.status === 'active' ? 'Active' : 'Blocked'}
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-number">${card.cardNumber}</div>
                        <div class="card-details">
                            <div class="card-holder">
                                <span class="card-label">Card Holder</span>
                                <span class="card-value">${card.holderName}</span>
                            </div>
                            <div class="card-expiry">
                                <span class="card-label">Expires</span>
                                <span class="card-value">${card.expiryDate}</span>
                            </div>
                        </div>
                        ${isCredit ? `
                            <div class="card-credit-info">
                                <div class="credit-limit">
                                    <span class="credit-label">Credit Limit</span>
                                    <span class="credit-value">${this.formatCurrency(card.creditLimit)}</span>
                                </div>
                                <div class="available-credit">
                                    <span class="credit-label">Available</span>
                                    <span class="credit-value">${this.formatCurrency(card.availableCredit)}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="card-balance">
                                <span class="balance-label">Account Balance</span>
                                <span class="balance-value">${this.formatCurrency(card.balance)}</span>
                            </div>
                        `}
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary btn-small" onclick="window.cardsManager.viewCardDetails(${card.id})">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        ${card.status === 'active' ? `
                            <button class="btn-danger btn-small" onclick="window.cardsManager.blockCard(${card.id})">
                                <i class="fas fa-ban"></i>
                                Block Card
                            </button>
                        ` : `
                            <button class="btn-primary btn-small" onclick="window.cardsManager.unblockCard(${card.id})">
                                <i class="fas fa-unlock"></i>
                                Unblock Card
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    showAddCardModal() {
        const modalHTML = `
            <form id="add-card-form" class="modal-form">
                <div class="form-group">
                    <label>Card Type</label>
                    <select id="card-type" class="form-input" required>
                        <option value="">Select Card Type</option>
                        <option value="Debit">Debit Card</option>
                        <option value="Credit">Credit Card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" id="card-number" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                <div class="form-group">
                    <label>Card Holder Name</label>
                    <input type="text" id="card-holder" class="form-input" placeholder="John Doe" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" id="card-expiry" class="form-input" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" id="card-cvv" class="form-input" placeholder="123" maxlength="3" required>
                    </div>
                </div>
                <div class="form-group" id="account-select-group">
                    <label>Linked Account</label>
                    <select id="card-account" class="form-input">
                        <option value="">Select Account</option>
                    </select>
                </div>
                <div class="form-group" id="credit-limit-group" style="display: none;">
                    <label>Credit Limit (₹)</label>
                    <input type="number" id="credit-limit" class="form-input" placeholder="0.00" min="0" step="0.01">
                </div>
                <button type="submit" class="btn-primary btn-large">Add Card</button>
            </form>
        `;

        if (window.appManager) {
            window.appManager.showModal('Add Card', modalHTML);
        }

        // Setup form handlers
        const cardTypeSelect = document.getElementById('card-type');
        if (cardTypeSelect) {
            cardTypeSelect.addEventListener('change', (e) => {
                const isCredit = e.target.value === 'Credit';
                document.getElementById('account-select-group').style.display = isCredit ? 'none' : 'block';
                document.getElementById('credit-limit-group').style.display = isCredit ? 'block' : 'none';
            });
        }

        // Format card number input
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formatted;
            });
        }

        // Format expiry date
        const expiryInput = document.getElementById('card-expiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Populate accounts
        this.populateAccounts();

        // Setup form handler
        const form = document.getElementById('add-card-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleAddCard();
            });
        }
    }

    async populateAccounts() {
        const select = document.getElementById('card-account');
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
                    `<option value="${acc.accountNumber}">${acc.accountName} (${acc.accountNumber})</option>`
                ).join('');
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }

    async handleAddCard() {
        const cardData = {
            cardType: document.getElementById('card-type').value,
            cardNumber: document.getElementById('card-number').value,
            holderName: document.getElementById('card-holder').value,
            expiryDate: document.getElementById('card-expiry').value,
            cvv: document.getElementById('card-cvv').value,
            accountNumber: document.getElementById('card-account').value,
            creditLimit: parseFloat(document.getElementById('credit-limit').value) || null
        };

        // Mask card number
        const cardNumberParts = cardData.cardNumber.replace(/\s/g, '').match(/.{1,4}/g) || [];
        if (cardNumberParts.length >= 2) {
            cardData.cardNumber = cardNumberParts[0] + ' **** **** ' + cardNumberParts[cardNumberParts.length - 1];
        }

        try {
            showToast('Adding card...', 'info');

            cardData.id = Date.now();
            cardData.bankName = 'DHIndus Banks';
            cardData.status = 'active';
            cardData.cvv = '***';

            if (cardData.cardType === 'Credit') {
                cardData.availableCredit = cardData.creditLimit;
            } else {
                // Get account balance
                let accounts = [];
                if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                    accounts = await window.googleSheetsService.getAccounts();
                } else if (window.accountsManager) {
                    accounts = window.accountsManager.accounts || [];
                }
                const account = accounts.find(acc => acc.accountNumber === cardData.accountNumber);
                cardData.balance = account ? account.balance : 0;
            }

            this.cards.push(cardData);
            this.saveCards();
            this.renderCards();

            showToast('Card added successfully!', 'success');
            if (window.appManager) {
                window.appManager.closeModal();
            }

            // Add notification
            if (window.notificationsManager) {
                window.notificationsManager.addNotification({
                    type: 'card',
                    title: 'Card Added',
                    message: `${cardData.cardType} card ending in ${cardData.cardNumber.split(' ').pop()} has been added`,
                    icon: 'fa-credit-card',
                    color: 'success'
                });
            }
        } catch (error) {
            console.error('Error adding card:', error);
            showToast('Failed to add card. Please try again.', 'error');
        }
    }

    viewCardDetails(id) {
        const card = this.cards.find(c => c.id === id);
        if (!card) {
            showToast('Card not found', 'error');
            return;
        }

        const detailsHTML = `
            <div class="card-details-modal">
                <div class="detail-section">
                    <h4>Card Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Card Number</span>
                            <span class="detail-value">${card.cardNumber}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Card Type</span>
                            <span class="detail-value">${card.cardType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Card Holder</span>
                            <span class="detail-value">${card.holderName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expiry Date</span>
                            <span class="detail-value">${card.expiryDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status</span>
                            <span class="detail-value" style="color: var(--success);">${card.status}</span>
                        </div>
                        ${card.cardType === 'Credit' ? `
                            <div class="detail-item">
                                <span class="detail-label">Credit Limit</span>
                                <span class="detail-value">${this.formatCurrency(card.creditLimit)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Available Credit</span>
                                <span class="detail-value">${this.formatCurrency(card.availableCredit)}</span>
                            </div>
                        ` : `
                            <div class="detail-item">
                                <span class="detail-label">Linked Account</span>
                                <span class="detail-value">${card.accountNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Account Balance</span>
                                <span class="detail-value">${this.formatCurrency(card.balance)}</span>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        if (window.appManager) {
            window.appManager.showModal('Card Details', detailsHTML);
        }
    }

    blockCard(id) {
        const card = this.cards.find(c => c.id === id);
        if (card) {
            card.status = 'blocked';
            this.saveCards();
            this.renderCards();
            showToast('Card blocked successfully', 'success');

            if (window.notificationsManager) {
                window.notificationsManager.addNotification({
                    type: 'security',
                    title: 'Card Blocked',
                    message: `Your ${card.cardType} card ending in ${card.cardNumber.split(' ').pop()} has been blocked`,
                    icon: 'fa-ban',
                    color: 'warning'
                });
            }
        }
    }

    unblockCard(id) {
        const card = this.cards.find(c => c.id === id);
        if (card) {
            card.status = 'active';
            this.saveCards();
            this.renderCards();
            showToast('Card unblocked successfully', 'success');
        }
    }

    saveCards() {
        localStorage.setItem('dhindus_cards', JSON.stringify(this.cards));
    }

    formatCurrency(amount) {
        return `${CONFIG.APP.CURRENCY}${amount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    }
}

// Initialize Cards Manager
let cardsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    cardsManager = new CardsManager();
    window.cardsManager = cardsManager;
});

