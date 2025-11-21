.# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Create Google Sheet (2 minutes)

1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Create 3 sheets named:
   - `Accounts`
   - `Transactions` 
   - `AccountDetails`
4. Add headers to each sheet (see README.md for details)
5. Copy the Spreadsheet ID from URL

### 2. Get Google API Keys (2 minutes)

1. Go to https://console.cloud.google.com
2. Create project → Enable "Google Sheets API"
3. Create API Key → Copy it
4. Create OAuth Client ID → Copy Client ID
5. Configure OAuth consent screen

### 3. Configure App (1 minute)

1. Open `js/config.js`
2. Replace:
   - `SPREADSHEET_ID` with your sheet ID
   - `API_KEY` with your API key
   - `CLIENT_ID` with your OAuth client ID

### 4. Run the App

Open `index.html` in browser or use a local server.

## 📋 Google Sheet Headers

### Accounts Sheet (Row 1):
```
Account Number | Account Type | Account Name | Balance | Currency | Status | Opened Date | Branch
```

### Transactions Sheet (Row 1):
```
Date | Time | Description | Category | Type | Amount | Account Number | Balance | Status | Notes
```

### AccountDetails Sheet (Row 1):
```
Type | Name | Amount | Date | Notes
```

## ✅ Test Credentials

- **Local Login**: Any username/password works (demo mode)
- **Google Sign-In**: Use your Google account

## 🎨 Features

- ✅ Modern, responsive UI
- ✅ Google Sheets integration
- ✅ Real-time data sync
- ✅ Interactive charts
- ✅ Transaction management
- ✅ Account management
- ✅ Transfer money
- ✅ Export data

## ⚠️ Important Notes

1. **Demo Mode**: Works without Google Sheets (uses demo data)
2. **Production**: Configure Google Sheets for real data storage
3. **Security**: Keep API keys secure, never commit to Git
4. **Sharing**: Share your Google Sheet with your Google account

## 🐛 Troubleshooting

**"Failed to load resource"**: Check API keys in config.js

**"Sheets API not enabled"**: Enable it in Google Cloud Console

**"Access denied"**: Share the Google Sheet with your account

**Charts not showing**: Check browser console for Chart.js errors

---

For detailed instructions, see README.md

