import { getSheetData } from '../../utils/googleSheets';

export default async function handler(req, res) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  // Support both 'Bookings' and 'bookedrooms' tabs
  const range = 'bookedrooms!A1:Z';

  try {
    const data = await getSheetData(sheetId, range, apiKey);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
