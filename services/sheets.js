const { google } = require('googleapis');

async function saveToCRM(userData) {
    try {
        console.log('Saving to CRM...', userData);
        
        // Initialize Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                type: 'service_account',
                project_id: process.env.GOOGLE_PROJECT_ID,
                private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                client_id: process.env.GOOGLE_CLIENT_ID,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        
        const spreadsheetId = process.env.GOOGLE_SHEET_ID || 'fake-sheet-id';
        
        // Prepare row data
        const rowData = [
            userData.generated_at || new Date().toISOString(),
            userData.name || '',
            userData.email || '',
            userData.niche || '',
            userData.audience || '',
            userData.goal || '',
            userData.platforms || '',
            userData.timezone || '',
            userData.status || 'completed'
        ];
        
        // Append to sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A:I', // Assuming columns A through I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [rowData]
            }
        });
        
        console.log('CRM data saved successfully:', response.data.updates);
        
        return response.data;
        
    } catch (error) {
        console.error('CRM save error:', error);
        
        // Don't throw error for CRM failures - just log them
        // The main workflow should continue even if CRM fails
        console.warn('CRM save failed, but continuing workflow...');
        return null;
    }
}

module.exports = {
    saveToCRM
};
