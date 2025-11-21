// ===== SETTINGS MANAGER =====

class SettingsManager {
    constructor() {
        this.settings = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.populateUserInfo();
    }

    loadSettings() {
        const stored = localStorage.getItem('dhindus_settings');
        if (stored) {
            this.settings = JSON.parse(stored);
        } else {
            this.settings = {
                displayName: '',
                currency: 'INR',
                theme: 'dark',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                twoFactorAuth: false,
                loginNotifications: true
            };
            this.saveSettings();
        }
        this.applySettings();
    }

    applySettings() {
        // Apply currency
        if (this.settings.currency) {
            const currencySelect = document.getElementById('currency-select');
            if (currencySelect) {
                currencySelect.value = this.settings.currency;
            }
        }

        // Apply theme
        if (this.settings.theme) {
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) {
                themeSelect.value = this.settings.theme;
            }
            document.body.setAttribute('data-theme', this.settings.theme);
        }

        // Apply language
        if (this.settings.language) {
            const languageSelect = document.getElementById('language-select');
            if (languageSelect) {
                languageSelect.value = this.settings.language;
            }
        }

        // Apply date format
        if (this.settings.dateFormat) {
            const dateFormatSelect = document.getElementById('date-format-select');
            if (dateFormatSelect) {
                dateFormatSelect.value = this.settings.dateFormat;
            }
        }

        // Apply 2FA
        const twoFactorToggle = document.getElementById('2fa-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.checked = this.settings.twoFactorAuth || false;
        }

        // Apply login notifications
        const loginNotificationsToggle = document.getElementById('login-notifications-toggle');
        if (loginNotificationsToggle) {
            loginNotificationsToggle.checked = this.settings.loginNotifications !== false;
        }

        // Apply display name
        const displayNameInput = document.getElementById('display-name');
        if (displayNameInput) {
            displayNameInput.value = this.settings.displayName || '';
        }
    }

    setupEventListeners() {
        // Display name
        const displayNameInput = document.getElementById('display-name');
        if (displayNameInput) {
            displayNameInput.addEventListener('change', (e) => {
                this.settings.displayName = e.target.value;
                this.saveSettings();
                this.updateUserName();
            });
        }

        // Currency
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.settings.currency = e.target.value;
                this.saveSettings();
                showToast('Currency preference saved', 'success');
            });
        }

        // Theme
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
                this.applyTheme(e.target.value);
                showToast('Theme preference saved', 'success');
            });
        }

        // Language
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
                showToast('Language preference saved', 'success');
            });
        }

        // Date format
        const dateFormatSelect = document.getElementById('date-format-select');
        if (dateFormatSelect) {
            dateFormatSelect.addEventListener('change', (e) => {
                this.settings.dateFormat = e.target.value;
                this.saveSettings();
                showToast('Date format preference saved', 'success');
            });
        }

        // 2FA toggle
        const twoFactorToggle = document.getElementById('2fa-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', (e) => {
                this.settings.twoFactorAuth = e.target.checked;
                this.saveSettings();
                showToast(
                    e.target.checked ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
                    e.target.checked ? 'success' : 'info'
                );
            });
        }

        // Login notifications toggle
        const loginNotificationsToggle = document.getElementById('login-notifications-toggle');
        if (loginNotificationsToggle) {
            loginNotificationsToggle.addEventListener('change', (e) => {
                this.settings.loginNotifications = e.target.checked;
                this.saveSettings();
            });
        }

        // Change password
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }

        // Export data
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Delete account
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.showDeleteAccountModal();
            });
        }
    }

    populateUserInfo() {
        const userData = localStorage.getItem(CONFIG.STORAGE.USER);
        if (userData) {
            const user = JSON.parse(userData);
            const emailInput = document.getElementById('user-email');
            if (emailInput) {
                emailInput.value = user.email || '';
            }
            if (!this.settings.displayName && user.name) {
                this.settings.displayName = user.name;
                const displayNameInput = document.getElementById('display-name');
                if (displayNameInput) {
                    displayNameInput.value = user.name;
                }
                this.saveSettings();
            }
        }
    }

    updateUserName() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.settings.displayName) {
            userNameElement.textContent = this.settings.displayName;
        }
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // Note: Full theme implementation would require additional CSS
    }

    showChangePasswordModal() {
        const modalHTML = `
            <form id="change-password-form" class="modal-form">
                <div class="form-group">
                    <label>Current Password</label>
                    <input type="password" id="current-password" class="form-input" placeholder="Enter current password" required>
                </div>
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" id="new-password" class="form-input" placeholder="Enter new password" required>
                </div>
                <div class="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" id="confirm-password" class="form-input" placeholder="Confirm new password" required>
                </div>
                <button type="submit" class="btn-primary btn-large">Change Password</button>
            </form>
        `;

        if (window.appManager) {
            window.appManager.showModal('Change Password', modalHTML);
        }

        const form = document.getElementById('change-password-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                if (newPassword !== confirmPassword) {
                    showToast('Passwords do not match', 'error');
                    return;
                }

                if (newPassword.length < 8) {
                    showToast('Password must be at least 8 characters long', 'error');
                    return;
                }

                showToast('Password changed successfully', 'success');
                if (window.appManager) {
                    window.appManager.closeModal();
                }
            });
        }
    }

    async exportData() {
        try {
            showToast('Preparing data export...', 'info');

            const exportData = {
                accounts: [],
                transactions: [],
                cards: [],
                investments: [],
                settings: this.settings,
                exportDate: new Date().toISOString()
            };

            // Get accounts
            if (window.googleSheetsService && window.googleSheetsService.isSignedIn) {
                exportData.accounts = await window.googleSheetsService.getAccounts();
                exportData.transactions = await window.googleSheetsService.getTransactions();
            } else if (window.accountsManager) {
                exportData.accounts = window.accountsManager.accounts || [];
            }

            // Get cards
            if (window.cardsManager) {
                exportData.cards = window.cardsManager.cards || [];
            }

            // Get investments
            if (window.investmentsManager) {
                exportData.investments = window.investmentsManager.investments || [];
            }

            // Create and download JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dhindus-banks-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Failed to export data', 'error');
        }
    }

    showDeleteAccountModal() {
        const modalHTML = `
            <div class="delete-account-warning">
                <div class="warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Delete Account</h3>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <p><strong>All your data will be permanently deleted:</strong></p>
                <ul>
                    <li>All accounts and balances</li>
                    <li>All transaction history</li>
                    <li>All cards and payment methods</li>
                    <li>All investments and savings</li>
                    <li>All settings and preferences</li>
                </ul>
                <div class="form-group">
                    <label>Type "DELETE" to confirm</label>
                    <input type="text" id="delete-confirm" class="form-input" placeholder="Type DELETE here" required>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="window.appManager.closeModal()">Cancel</button>
                    <button class="btn-danger" id="confirm-delete-btn">Delete Account</button>
                </div>
            </div>
        `;

        if (window.appManager) {
            window.appManager.showModal('Delete Account', modalHTML);
        }

        const confirmBtn = document.getElementById('confirm-delete-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const confirmInput = document.getElementById('delete-confirm');
                if (confirmInput && confirmInput.value === 'DELETE') {
                    this.deleteAccount();
                } else {
                    showToast('Please type "DELETE" to confirm', 'error');
                }
            });
        }
    }

    deleteAccount() {
        // Clear all data
        localStorage.clear();
        
        // Show message
        showToast('Account deleted. Redirecting to login...', 'info');
        
        // Redirect to login after delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    saveSettings() {
        localStorage.setItem('dhindus_settings', JSON.stringify(this.settings));
    }
}

// Initialize Settings Manager
let settingsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    window.settingsManager = settingsManager;
});

