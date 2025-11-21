# DHIndus Banks - Digital Banking Platform

A modern, secure banking web application with Google Sheets integration for data storage.

## Features

- 🏦 **Complete Banking Dashboard** - View balances, transactions, and account summaries
- 📊 **Google Sheets Integration** - All banking data stored in Google Sheets
- 💳 **Account Management** - Manage multiple accounts (Savings, Current, Fixed Deposits)
- 💸 **Transaction Management** - Track income, expenses, and transfers
- 📈 **Interactive Charts** - Visualize your financial data
- 🔐 **Secure Authentication** - Local login and Google Sign-In
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful, intuitive interface

## Google Sheets Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "DHIndus Banks Data" (or any name you prefer)
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 2: Create Three Sheets

Create three sheets with the following names and headers:

#### Sheet 1: "Accounts"
Headers (Row 1):
- Account Number
- Account Type
- Account Name
- Balance
- Currency
- Status
- Opened Date
- Branch

#### Sheet 2: "Transactions"
Headers (Row 1):
- Date
- Time
- Description
- Category
- Type
- Amount
- Account Number
- Balance
- Status
- Notes

#### Sheet 3: "AccountDetails"
Headers (Row 1):
- Type
- Name
- Amount
- Date
- Notes

### Step 3: Get Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API Key

5. Create OAuth 2.0 Client ID:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5500` (or your domain)
   - Authorized redirect URIs: `http://localhost:5500` (or your domain)
   - Copy the Client ID 
   #####@@@@@@-----------"540183516782-3v2m8cf9p12np3s6f38g8dsrnq0hb7jm.apps.googleusercontent.com"

6. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in required information
   - Add scopes: `https://www.googleapis.com/auth/spreadsheets`
   - Add test users (your Google account)

### Step 4: Share Google Sheet

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (if using service account) OR
4. Make the sheet accessible to anyone with the link (for testing) OR
5. Share with your Google account email

### Step 5: Update Configuration

1. Open `js/config.js`
2. Replace the following values:
   ```javascript
   GOOGLE_SHEETS: {
       SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // From Step 1
       ACCOUNTS_SHEET: 'Accounts',
       TRANSACTIONS_SHEET: 'Transactions',
       ACCOUNT_DETAILS_SHEET: 'AccountDetails'
   },
   GOOGLE_API: {
       API_KEY: 'YOUR_GOOGLE_API_KEY', // From Step 3
       CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // From Step 3
       // ... rest of config
   }
   ```

## Installation

1. **Clone or download** this repository

2. **Open the project** in your code editor

3. **Update configuration** in `js/config.js` with your Google Sheets and API credentials

4. **Set up Google Sheets** as described above

5. **Open `index.html`** in a web browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 5500
   
   # Using Node.js (http-server)
   npx http-server -p 5500
   
   # Using PHP
   php -S localhost:5500
   ```

6. **Access the application** at `http://localhost:5500`

## Usage

### Login

- **Local Login**: Use any username and password (demo mode)
- **Google Sign-In**: Click "Sign in with Google" to use Google Sheets integration

### Dashboard

- View your account balances
- See recent transactions
- Quick actions for common banking tasks
- Interactive charts showing financial trends

### Accounts

- View all your accounts
- Add new accounts
- View account details and statements

### Transactions

- View complete transaction history
- Filter by type (Income, Expenses, Transfers)
- Export transactions to CSV
- Search transactions

### Transfer Money

- Transfer funds between accounts
- Add notes to transactions
- Real-time balance updates

## Data Storage

All banking data is stored in Google Sheets:

- **Accounts Sheet**: Account information and balances
- **Transactions Sheet**: All transaction records
- **Account Details Sheet**: Assets, investments, and liabilities

## Security Notes

⚠️ **Important**: This is a demo application. For production use:

1. Use proper backend authentication
2. Implement proper encryption for sensitive data
3. Use service accounts instead of OAuth for server-side operations
4. Implement rate limiting and API security
5. Use HTTPS in production
6. Implement proper access controls

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Google Sheets not loading

1. Check that API credentials are correct in `config.js`
2. Verify Google Sheets API is enabled
3. Check browser console for errors
4. Ensure the spreadsheet is shared correctly

### Charts not displaying

1. Ensure Chart.js is loaded (check browser console)
2. Check that transactions data is available
3. Verify canvas element exists in DOM

### Authentication issues

1. Clear browser cache and localStorage
2. Check OAuth consent screen configuration
3. Verify redirect URIs match your domain

## Development

### File Structure

```
DHIndus Banks/
├── index.html          # Main HTML file
├── css/
│   ├── main.css        # Global styles
│   ├── dashboard.css   # Dashboard styles
│   ├── transactions.css # Transactions styles
│   └── accounts.css    # Accounts styles
├── js/
│   ├── config.js        # Configuration
│   ├── googleSheets.js # Google Sheets API
│   ├── auth.js         # Authentication
│   ├── main.js         # Main app logic
│   ├── dashboard.js    # Dashboard functionality
│   ├── transactions.js # Transactions
│   ├── accounts.js     # Accounts management
│   └── charts.js       # Chart functionality
└── README.md           # This file
```

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions, please check:
1. Browser console for errors
2. Google Sheets API documentation
3. Configuration in `js/config.js`

## Future Enhancements

- [ ] Real-time notifications
- [ ] Bill payment integration
- [ ] Investment tracking
- [ ] Budget planning
- [ ] Multi-currency support
- [ ] Mobile app version
- [ ] Advanced analytics
- [ ] Export to PDF

---

**Note**: Remember to keep your API keys and credentials secure. Never commit them to version control.

