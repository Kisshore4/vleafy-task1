import { useEffect, useState } from 'react';

export default function Admin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        setBookings(json.data || []);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <h2>All Bookings</h2>
      {bookings.length > 1 ? (
        <table className="admin-table">
          <thead>
            <tr>
              {bookings[0]?.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.slice(1).map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cidx) => (
                  <td key={cidx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bookings found.</p>
      )}
      <style jsx>{`
        .admin-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 24px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5em;
        }
        h2 {
          margin-bottom: 1em;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2em;
        }
        .admin-table th, .admin-table td {
          border: 1px solid #ccc;
          padding: 10px 16px;
          text-align: left;
        }
        .admin-table th {
          background: #f5f5f5;
        }
        @media (max-width: 600px) {
          .admin-container {
            padding: 8px;
          }
          h1 {
            font-size: 1.5rem;
          }
          .admin-table th, .admin-table td {
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
}
