import { getSheetData } from '../../utils/googleSheets';

export default async function handler(req, res) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const range = 'booking!A1:Z';

  const { roomType, checkIn, checkOut, guests, children, ratePlan } = req.query;

  try {
    const data = await getSheetData(sheetId, range, apiKey);
    const [header, ...rows] = data;
    const room = rows.find(r => r[1] === roomType);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Find column indices by header name for flexibility
    const idxPrice = header.indexOf('Price');
    const idxExtraPerson = header.indexOf('Extra Person');
    const idxExtraChild = header.indexOf('Extra Child');
    const idxRatePlan = header.indexOf('Rate Plan');
    const idxAvailability = header.indexOf('Availability');

    // Base price
    let price = parseFloat(room[idxPrice]);
    // Extra person pricing
    if (idxExtraPerson !== -1 && guests > 2) {
      price += parseFloat(room[idxExtraPerson] || 0) * (guests - 2);
    }
    // Extra child pricing
    if (idxExtraChild !== -1 && children > 0) {
      price += parseFloat(room[idxExtraChild] || 0) * children;
    }
    // Rate plan pricing
    if (ratePlan === 'With Breakfast') {
      price += 200;
    }
    // Availability
    const available = idxAvailability !== -1 ? room[idxAvailability] === 'yes' : true;
    res.status(200).json({ price, available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
