import { getSheetData } from '../../utils/googleSheets';

export default async function handler(req, res) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const range = 'booking!A1:E'; // Updated tab name and range

  try {
    const data = await getSheetData(sheetId, range, apiKey);
    console.log('Google Sheets API response:', data);
    res.status(200).json({ data });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    res.status(500).json({ error: error.message });
  }
}
