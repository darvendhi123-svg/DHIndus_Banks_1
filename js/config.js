// ===== CONFIGURATION =====
const CONFIG = {
    // Google Sheets Configuration
    // Replace these with your actual Google Sheets IDs
    GOOGLE_SHEETS: {
        SPREADSHEET_ID: '1-tJP1e_0MD3fQPRFSQHbrEUJQJiLPuLNTGVx0jvWSqM', // Replace with your Google Sheet ID
        ACCOUNTS_SHEET: 'Accounts', // Sheet name for accounts
        TRANSACTIONS_SHEET: 'Transactions', // Sheet name for transactions
        ACCOUNT_DETAILS_SHEET: 'AccountDetails' // Sheet name for account details (money, assets, etc.)
    },
    
    // Google API Configuration
    GOOGLE_API: {
        API_KEY: 'YOUR_GOOGLE_API_KEY', // Replace with your Google API Key
        CLIENT_ID: '540183516782-3v2m8cf9p12np3s6f38g8dsrnq0hb7jm.apps.googleusercontent.com', // Replace with your Google OAuth Client ID
        DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        SCOPES: 'https://www.googleapis.com/auth/spreadsheets'
    },
    
    // App Configuration
    APP: {
        NAME: 'DHIndus Banks',
        VERSION: '1.0.0',
        CURRENCY: '₹',
        DATE_FORMAT: 'DD/MM/YYYY',
        TIME_FORMAT: 'HH:mm'
    },
    
    // Local Storage Keys
    STORAGE: {
        USER: 'dhindus_user',
        TOKEN: 'dhindus_token',
        ACCOUNTS: 'dhindus_accounts',
        TRANSACTIONS: 'dhindus_transactions'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

