import { google } from 'googleapis';

export async function getSheetData(sheetId, range, apiKey) {
  const sheets = google.sheets({ version: 'v4', auth: apiKey });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  return response.data.values;
}
