import { google } from 'googleapis';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const {
    roomType,
    checkIn,
    checkOut,
    guests,
    children,
    ratePlan,
    price,
    name,
    email,
    phone,
    hotelName
  } = req.body;

  try {
    // Read service account credentials from environment variable
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
    }
    const credentials = JSON.parse(serviceAccount);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const bookingRow = [
      new Date().toISOString(),
      hotelName,
      roomType,
      checkIn,
      checkOut,
      guests,
      children,
      ratePlan,
      price,
      name,
      email,
      phone
    ];
    let success = false;
    let errors = [];
    // Try to append to both tabs, but ignore errors if one fails
    for (const tab of ['Bookings', 'bookedrooms']) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${tab}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [bookingRow] }
        });
        success = true;
      } catch (err) {
        errors.push(`Tab ${tab}: ${err.message}`);
      }
    }
    if (success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: errors.join('; ') });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

