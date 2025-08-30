import { useEffect, useState } from 'react';

export default function Home() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('/api/hotelbooking');
        const json = await res.json();
        setRooms(json.data || []);
        setRaw(JSON.stringify(json, null, 2));
      } catch (err) {
        setError('Failed to fetch room data');
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <span className="nav-logo">🏨</span> booking.com
        </div>
        <div className="navbar-right">
          <a href="/" className="nav-btn">Home</a>
          <a href="/booking" className="nav-btn">Book a Room</a>
        </div>
      </nav>
      <div className="search-bar-mmt-advanced">
        <input type="text" className="search-field-mmt" placeholder="City, Property name or Location" />
        <input type="date" className="search-field-mmt" placeholder="Check-In" />
        <input type="date" className="search-field-mmt" placeholder="Check-Out" />
        <select className="search-field-mmt">
          <option>1 Room, 2 Adults</option>
          <option>2 Rooms, 4 Adults</option>
          <option>3 Rooms, 6 Adults</option>
        </select>
        <button className="search-btn-mmt">SEARCH</button>
      </div>
      <div className="search-bar-mmt">
        <input
          type="text"
          placeholder="Search by room type, hotel, or extras..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="search-input-mmt"
        />
        <button className="search-btn-mmt">SEARCH</button>
      </div>
      <div className="container enhanced-bg">
        <div className="room-card-list">
          {rooms
            .slice(1)
            .filter(row =>
              row.some(cell => cell && cell.toLowerCase().includes(search.toLowerCase()))
            )
            .slice((page-1)*pageSize, page*pageSize)
            .map((row, idx) => {
              const imgIdx = rooms[0]?.indexOf('Image URL');
              const nameIdx = rooms[0]?.indexOf('Hotel Name');
              const locationIdx = rooms[0]?.indexOf('Location');
              const priceIdx = rooms[0]?.indexOf('Price');
              const ratingIdx = rooms[0]?.indexOf('Rating');
              // Fallbacks for demo if columns missing
              const hotelName = nameIdx !== -1 ? row[nameIdx] : `Hotel ${idx+1}`;
              const location = locationIdx !== -1 ? row[locationIdx] : "Location";
              const price = priceIdx !== -1 ? row[priceIdx] : "₹6,175";
              const rating = ratingIdx !== -1 ? row[ratingIdx] : "4.2";
              // Map hotel names to specific images
              const hotelImageMap = {
                'Taj Palace': '/images/Blog-6-scaled.jpg',
                'Hyatt': '/images/Freesia-God-23.jpg',
                'ITC Grand': '/images/Studio_Bedroom_dr07gd.avif',
                'VPN Regency': '/images/guide-to-design-luxury-bedroom-2.webp',
                'Sterling Ooty Elk Hill': '/images/image4.jpg',
                'Luxury Room': '/images/Luxury-Room-08.webp'
              };
              const sampleImgs = [
                '/images/Blog-6-scaled.jpg',
                '/images/Freesia-God-23.jpg',
                '/images/Studio_Bedroom_dr07gd.avif',
                '/images/guide-to-design-luxury-bedroom-2.webp',
                '/images/image4.jpg',
                '/images/Luxury-Room-08.webp'
              ];
              let imgSrc = hotelImageMap[hotelName] || sampleImgs[idx % sampleImgs.length] || sampleImgs[0];
              return (
                <div key={idx} className="mm-card">
                  <div className="mm-img-wrap">
                    <img src={imgSrc} alt="Room" className="mm-img" />
                  </div>
                  <div className="mm-details">
                    <div className="mm-hotel-name">{hotelName}</div>
                    <div className="mm-location">{location}</div>
                    <div className="mm-features">
                      <span className="mm-feature">Free Cancellation</span>
                      <span className="mm-feature">Book with ₹0 Payment</span>
                      <span className="mm-feature">Breakfast Included</span>
                    </div>
                    <div className="mm-desc">Perfect valley views, charming staff hospitality, engaging activities for kids and adults.</div>
                  </div>
                  <div className="mm-right">
                    <div className="mm-rating">
                      <span className="mm-rating-score">{rating}</span>
                      <span className="mm-rating-label">Very Good</span>
                    </div>
                    <div className="mm-price">₹{price}</div>
                    <button className="mm-book-btn" onClick={() => window.location.href = `/booking?hotel=${encodeURIComponent(hotelName)}`}>Book Now</button>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="pagination enhanced-pagination">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage(p => p+1)}
            disabled={((rooms.length-1) - (search ? rooms.slice(1).filter(row => row.some(cell => cell && cell.toLowerCase().includes(search.toLowerCase()))).length : rooms.length-1)) <= page*pageSize-1}
          >Next</button>
        </div>
      </div>
      {showToast && <div className="toast">{toastMsg}</div>}
      {loading && <div className="skeleton-list">{Array.from({length: 5}).map((_,i) => <div key={i} className="skeleton-card" />)}</div>}
      <style jsx>{`
        .dark-navbar {
          background: #222 !important;
          color: #fff !important;
        }
        .sort-select {
          margin-left: 12px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e0eafc;
          font-size: 1rem;
        }
        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin: 40px 0;
        }
        .skeleton-card {
          height: 170px;
          border-radius: 12px;
          background: linear-gradient(90deg,#e0eafc 30%,#f6f8fa 70%);
          animation: skeleton 1.2s infinite linear alternate;
        }
        @keyframes skeleton {
          0% { opacity: 0.7; }
                    .room-card-list {
                      gap: 18px;
                    }
                    .mm-card {
                      flex-direction: column;
                      min-height: unset;
                      align-items: stretch;
                    }
                    .mm-img-wrap {
                      width: 100%;
                      height: 180px;
                      border-radius: 12px 12px 0 0;
                    }
                    .mm-img {
                      width: 100%;
                      height: 180px;
                      object-fit: cover;
                      border-radius: 12px 12px 0 0;
                    }
                    .mm-details {
                      padding: 14px 10px 8px 10px;
                    }
                    .mm-right {
                      width: 100%;
                      border-radius: 0 0 12px 12px;
                      flex-direction: row;
                      justify-content: space-between;
                      align-items: center;
                      padding: 10px;
                    }
                    .mm-book-btn {
                      width: 100%;
                      font-size: 1.1rem;
                      padding: 12px 0;
                    }
          background: #2d6cdf;
          color: #fff;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 1.1em;
          box-shadow: 0 2px 8px rgba(45,108,223,0.18);
          z-index: 9999;
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .navbar {
          width: 100%;
          background: #fff;
          box-shadow: 0 4px 16px rgba(45,108,223,0.10);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 64px;
          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 22px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0070f3;
          font-size: 1.35rem;
          font-weight: 700;
        }
        .nav-logo {
          font-size: 2rem;
          margin-right: 6px;
        }
        .navbar-right {
          display: flex;
          gap: 22px;
        }
        .nav-btn {
          background: #2d6cdf;
          color: #fff;
          padding: 10px 22px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05rem;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(45,108,223,0.08);
        }
        .nav-btn:hover {
          background: #0070f3;
          box-shadow: 0 4px 16px rgba(45,108,223,0.18);
        }
        .enhanced-bg {
          background: #f6f8fa;
        }
        .enhanced-title {
          font-size: 2.7rem;
          margin-bottom: 0.7em;
          color: #2d6cdf;
          font-weight: 700;
          text-align: center;
          letter-spacing: -1px;
        }
        .enhanced-summary {
          background: #f7b32b;
          color: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border: 2px solid #2d6cdf;
        }
        .enhanced-desc {
          font-size: 1.15rem;
          color: #333;
          text-align: center;
          margin-bottom: 1.2em;
        }
        .enhanced-list {
          margin-bottom: 2em;
          color: #2d6cdf;
          font-weight: 500;
        }
        .search-bar-mmt {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 24px 0 18px 0;
          margin-bottom: 0;
        }
        .search-bar-mmt-advanced {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 18px 0 8px 0;
          margin-bottom: 0;
        }
        .search-input-mmt {
          width: 420px;
          padding: 14px 18px;
          border-radius: 8px 0 0 8px;
          border: 2px solid #2d6cdf;
          font-size: 1.15rem;
          outline: none;
          font-family: inherit;
        }
        .search-field-mmt {
          width: 220px;
          padding: 12px 14px;
          border: 2px solid #e0eafc;
          border-right: none;
          border-radius: 8px 0 0 8px;
          font-size: 1.05rem;
          outline: none;
          font-family: inherit;
          background: #f6f8fa;
        }
        .search-field-mmt + .search-field-mmt {
          border-radius: 0;
          border-left: none;
        }
        .search-field-mmt:last-of-type {
          border-radius: 0 8px 8px 0;
          border-right: 2px solid #e0eafc;
        }
        .search-btn-mmt {
          padding: 12px 28px;
          border-radius: 0 8px 8px 0;
          border: none;
          background: linear-gradient(90deg,#2d6cdf 60%,#0070f3 100%);
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(45,108,223,0.08);
          transition: background 0.2s;
        }
        .search-btn-mmt:hover {
          background: linear-gradient(90deg,#0070f3 60%,#2d6cdf 100%);
        }
        .summary-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 18px;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 24px;
        }
        .summary-card div {
          font-size: 1rem;
          color: #333;
        }
        .booking-link {
          display: inline-block;
          margin-top: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          background: #2d6cdf;
          color: #fff;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: background 0.2s;
        }
        .booking-link:hover {
          background: #0070f3;
        }
        .room-card-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 32px;
        }
        .mm-card {
          display: flex;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          border: 1.5px solid #e0eafc;
          padding: 0;
          align-items: stretch;
          min-height: 170px;
        }
        .mm-img-wrap {
          flex: 0 0 180px;
          height: 170px;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          overflow: hidden;
        }
        .mm-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mm-details {
          flex: 1;
          padding: 18px 18px 12px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .mm-hotel-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 4px;
        }
        .mm-location {
          font-size: 1rem;
          color: #2d6cdf;
          margin-bottom: 8px;
        }
        .mm-features {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }
        .mm-feature {
          background: #eaf1fb;
          color: #2d6cdf;
          font-size: 0.95rem;
          border-radius: 6px;
          padding: 2px 10px;
          font-weight: 500;
        }
        .mm-desc {
          font-size: 0.98rem;
          color: #444;
          margin-top: 6px;
        }
        .mm-right {
          flex: 0 0 140px;
          background: #f6f8fa;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 18px 12px;
        }
        .mm-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .mm-rating-score {
          background: #2d6cdf;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          border-radius: 6px;
          padding: 2px 10px;
        }
        .mm-rating-label {
          color: #43a047;
          font-size: 1rem;
          font-weight: 600;
        }
        .mm-price {
          font-size: 1.25rem;
          color: #0070f3;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .mm-book-btn {
          background: linear-gradient(90deg,#2d6cdf 60%,#0070f3 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(45,108,223,0.08);
          transition: background 0.2s;
        }
        .mm-book-btn:hover {
          background: linear-gradient(90deg,#0070f3 60%,#2d6cdf 100%);
        }
        .enhanced-pagination {
          margin-top: 1em;
          display: flex;
          justify-content: center;
          gap: 1em;
        }
        .enhanced-pagination button {
          padding: 10px 22px;
          border-radius: 16px;
          border: none;
          background: #2d6cdf;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transition: background 0.2s;
        }
        .enhanced-pagination button:disabled {
          background: #eee;
          color: #aaa;
          cursor: not-allowed;
        }
        .no-rooms {
          text-align: center;
          color: #d32f2f;
          font-weight: 600;
          font-size: 1.2rem;
        }
        @media (max-width: 600px) {
          .navbar {
            padding: 0 8px;
            font-size: 1rem;
            height: 48px;
          }
          .navbar-left {
            font-size: 1rem;
          }
          .nav-logo {
            font-size: 1.3rem;
          }
          .nav-btn {
            padding: 7px 12px;
            font-size: 0.95rem;
          }
          .container {
            padding: 8px;
          }
          .enhanced-title {
            font-size: 1.5rem;
          }
          .room-card-list {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .mm-img-wrap {
            height: 120px;
          }
        }
        @media (max-width: 700px) {
          .search-input-mmt {
            width: 100%;
            font-size: 1rem;
          }
          .search-btn-mmt {
            font-size: 1rem;
            padding: 12px 18px;
          }
        }
        @media (max-width: 900px) {
          .search-bar-mmt-advanced {
            flex-direction: column;
            gap: 8px;
            padding: 12px 0 8px 0;
          }
          .search-field-mmt {
            width: 100%;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          .search-btn-mmt {
            width: 100%;
            border-radius: 8px;
          }
        }
      `}</style>
    </>
  );
}
