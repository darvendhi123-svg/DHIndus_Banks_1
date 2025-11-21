// ===== GOOGLE SHEETS API INTEGRATION =====

class GoogleSheetsService {
    constructor() {
        this.gapi = null;
        this.isSignedIn = false;
        this.spreadsheetId = CONFIG.GOOGLE_SHEETS.SPREADSHEET_ID;
        this.init();
    }

    async init() {
        try {
            await this.loadGAPI();
            await this.initGAPI();
        } catch (error) {
            console.error('Error initializing Google Sheets API:', error);
            this.showError('Failed to initialize Google Sheets. Please check your configuration.');
        }
    }

    loadGAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initGAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.GOOGLE_API.API_KEY,
                        clientId: CONFIG.GOOGLE_API.CLIENT_ID,
                        discoveryDocs: CONFIG.GOOGLE_API.DISCOVERY_DOCS,
                        scope: CONFIG.GOOGLE_API.SCOPES
                    });

                    this.gapi = gapi;
                    this.authInstance = gapi.auth2.getAuthInstance();
                    
                    // Check if user is already signed in
                    this.isSignedIn = this.authInstance.isSignedIn.get();
                    
                    resolve();
                } catch (error) {
                    console.error('Error initializing GAPI:', error);
                    reject(error);
                }
            });
        });
    }

    async signIn() {
        try {
            if (!this.authInstance) {
                await this.initGAPI();
            }
            
            const googleUser = await this.authInstance.signIn();
            this.isSignedIn = true;
            
            // Store user info
            const profile = googleUser.getBasicProfile();
            const userData = {
                id: profile.getId(),
                name: profile.getName(),
                email: profile.getEmail(),
                image: profile.getImageUrl()
            };
            
            localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            if (this.authInstance) {
                await this.authInstance.signOut();
                this.isSignedIn = false;
                localStorage.removeItem(CONFIG.STORAGE.USER);
                localStorage.removeItem(CONFIG.STORAGE.TOKEN);
            }
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    // ===== ACCOUNTS OPERATIONS =====
    async getAccounts() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.ACCOUNTS_SHEET}!A2:Z`
            });

            const rows = response.result.values || [];
            return this.parseAccounts(rows);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            // Return cached data if available
            const cached = localStorage.getItem(CONFIG.STORAGE.ACCOUNTS);
            return cached ? JSON.parse(cached) : [];
        }
    }

    parseAccounts(rows) {
        return rows.map((row, index) => ({
            id: index + 1,
            accountNumber: row[0] || '',
            accountType: row[1] || 'Savings',
            accountName: row[2] || '',
            balance: parseFloat(row[3] || 0),
            currency: row[4] || 'INR',
            status: row[5] || 'Active',
            openedDate: row[6] || '',
            branch: row[7] || ''
        })).filter(account => account.accountNumber);
    }

    async addAccount(accountData) {
        try {
            const values = [[
                accountData.accountNumber,
                accountData.accountType,
                accountData.accountName,
                accountData.balance,
                accountData.currency || 'INR',
                accountData.status || 'Active',
                new Date().toISOString().split('T')[0],
                accountData.branch || ''
            ]];

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.ACCOUNTS_SHEET}!A2`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            // Refresh accounts cache
            const accounts = await this.getAccounts();
            localStorage.setItem(CONFIG.STORAGE.ACCOUNTS, JSON.stringify(accounts));
            
            return accounts;
        } catch (error) {
            console.error('Error adding account:', error);
            throw error;
        }
    }

    async updateAccountBalance(accountNumber, newBalance) {
        try {
            // Find the row number for this account
            const accounts = await this.getAccounts();
            const accountIndex = accounts.findIndex(acc => acc.accountNumber === accountNumber);
            
            if (accountIndex === -1) {
                throw new Error('Account not found');
            }

            const rowNumber = accountIndex + 2; // +2 because header is row 1 and arrays are 0-indexed
            
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.ACCOUNTS_SHEET}!D${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[newBalance]] }
            });

            // Update cache
            accounts[accountIndex].balance = newBalance;
            localStorage.setItem(CONFIG.STORAGE.ACCOUNTS, JSON.stringify(accounts));
            
            return accounts;
        } catch (error) {
            console.error('Error updating account balance:', error);
            throw error;
        }
    }

    // ===== TRANSACTIONS OPERATIONS =====
    async getTransactions(limit = null) {
        try {
            const range = limit 
                ? `${CONFIG.GOOGLE_SHEETS.TRANSACTIONS_SHEET}!A2:Z${limit + 1}`
                : `${CONFIG.GOOGLE_SHEETS.TRANSACTIONS_SHEET}!A2:Z`;

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range
            });

            const rows = response.result.values || [];
            return this.parseTransactions(rows);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // Return cached data if available
            const cached = localStorage.getItem(CONFIG.STORAGE.TRANSACTIONS);
            return cached ? JSON.parse(cached) : [];
        }
    }

    parseTransactions(rows) {
        return rows.map((row, index) => ({
            id: index + 1,
            date: row[0] || '',
            time: row[1] || '',
            description: row[2] || '',
            category: row[3] || 'Other',
            type: row[4] || 'expense', // income, expense, transfer
            amount: parseFloat(row[5] || 0),
            accountNumber: row[6] || '',
            balance: parseFloat(row[7] || 0),
            status: row[8] || 'completed',
            notes: row[9] || ''
        })).filter(transaction => transaction.date);
    }

    async addTransaction(transactionData) {
        try {
            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const time = now.toTimeString().split(' ')[0].substring(0, 5);

            const values = [[
                date,
                time,
                transactionData.description,
                transactionData.category || 'Other',
                transactionData.type || 'expense',
                transactionData.amount,
                transactionData.accountNumber,
                transactionData.balance || 0,
                transactionData.status || 'completed',
                transactionData.notes || ''
            ]];

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.TRANSACTIONS_SHEET}!A2`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            // Update account balance
            if (transactionData.accountNumber) {
                const accounts = await this.getAccounts();
                const account = accounts.find(acc => acc.accountNumber === transactionData.accountNumber);
                
                if (account) {
                    let newBalance = account.balance;
                    if (transactionData.type === 'income') {
                        newBalance += transactionData.amount;
                    } else if (transactionData.type === 'expense') {
                        newBalance -= transactionData.amount;
                    }
                    
                    await this.updateAccountBalance(transactionData.accountNumber, newBalance);
                }
            }

            // Refresh transactions cache
            const transactions = await this.getTransactions();
            localStorage.setItem(CONFIG.STORAGE.TRANSACTIONS, JSON.stringify(transactions));
            
            return transactions;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }

    // ===== ACCOUNT DETAILS OPERATIONS =====
    async getAccountDetails() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.ACCOUNT_DETAILS_SHEET}!A2:Z`
            });

            const rows = response.result.values || [];
            return this.parseAccountDetails(rows);
        } catch (error) {
            console.error('Error fetching account details:', error);
            return {
                totalAssets: 0,
                totalLiabilities: 0,
                netWorth: 0,
                investments: [],
                loans: []
            };
        }
    }

    parseAccountDetails(rows) {
        const details = {
            totalAssets: 0,
            totalLiabilities: 0,
            netWorth: 0,
            investments: [],
            loans: []
        };

        rows.forEach(row => {
            const type = row[0] || '';
            const name = row[1] || '';
            const amount = parseFloat(row[2] || 0);
            const date = row[3] || '';

            if (type === 'Investment') {
                details.investments.push({ name, amount, date });
                details.totalAssets += amount;
            } else if (type === 'Loan') {
                details.loans.push({ name, amount, date });
                details.totalLiabilities += amount;
            } else if (type === 'Asset') {
                details.totalAssets += amount;
            }
        });

        details.netWorth = details.totalAssets - details.totalLiabilities;
        return details;
    }

    async updateAccountDetails(detailsData) {
        try {
            const values = [[
                detailsData.type,
                detailsData.name,
                detailsData.amount,
                new Date().toISOString().split('T')[0],
                detailsData.notes || ''
            ]];

            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${CONFIG.GOOGLE_SHEETS.ACCOUNT_DETAILS_SHEET}!A2`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            return await this.getAccountDetails();
        } catch (error) {
            console.error('Error updating account details:', error);
            throw error;
        }
    }

    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Initialize Google Sheets Service
let googleSheetsService = null;

document.addEventListener('DOMContentLoaded', () => {
    googleSheetsService = new GoogleSheetsService();
    window.googleSheetsService = googleSheetsService;
});

