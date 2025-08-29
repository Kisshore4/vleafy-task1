import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Booking() {
  const router = useRouter();
  const hotelNameFromQuery = router.query.hotel;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rooms, setRooms] = useState([]);
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showSpinner, setShowSpinner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [children, setChildren] = useState(0);
  const [ratePlan, setRatePlan] = useState('With Breakfast');
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch('/api/hotelbooking');
        const json = await res.json();
        setRooms(json.data ? json.data.slice(1) : []); // skip header
      } catch (err) {
        setError('Failed to fetch room data');
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  function handleRoomChange(e) {
  setSelectedRoom(e.target.value);
  setPrice(null);
  setAvailability(null);
  setConfirmation(null);
  }

  function handleCheckPrice() {
    fetch(`/api/calculate?roomType=${selectedRoom}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&children=${children}&ratePlan=${ratePlan}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setPrice(null);
          setAvailability(null);
        } else {
          setPrice(data.price);
          setAvailability(data.available ? 'Available' : 'Not Available');
        }
      });
  }

  function handleBooking(e) {
    e.preventDefault();
    let errors = {};
    if (!name) errors.name = 'Name is required.';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Valid email required.';
    if (!phone || !/^\d{10,15}$/.test(phone)) errors.phone = 'Valid phone number required.';
    if (!selectedRoom) errors.selectedRoom = 'Room selection required.';
    if (!checkIn) errors.checkIn = 'Check-in date required.';
    if (!checkOut) errors.checkOut = 'Check-out date required.';
    if (guests < 1) errors.guests = 'At least 1 guest required.';
    if (children < 0) errors.children = 'Children cannot be negative.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (availability !== 'Available') {
      setConfirmation('Room not available for selected dates.');
      return;
    }
    setShowSpinner(true);
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType: selectedRoom,
        checkIn,
        checkOut,
        guests,
        children,
        ratePlan,
        price,
        name,
        email,
        phone,
        hotelName: hotelNameFromQuery || selectedRoom
      })
    })
      .then(res => res.json())
      .then(data => {
        setShowSpinner(false);
        if (data.success) {
          setConfirmation('Booking confirmed and saved!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setConfirmation('Booking failed: ' + (data.error || 'Unknown error'));
        }
      });
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="booking-container modern-card">
      <h2>{hotelNameFromQuery ? hotelNameFromQuery : 'Book a Room'}</h2>
      <form className="booking-form" onSubmit={handleBooking}>
        <div className="form-section">
          <div className="form-group">
            <label><span className="icon">🏨</span> Room</label>
            <select value={selectedRoom} onChange={handleRoomChange} required className={formErrors.selectedRoom ? 'error' : ''}>
              <option value="">Select a room</option>
              {rooms.map((r, idx) => (
                <option key={idx} value={r[1]}>{r[1]}</option>
              ))}
            </select>
            {formErrors.selectedRoom && <span className="error-msg">{formErrors.selectedRoom}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">👤</span> Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={formErrors.name ? 'error' : ''} />
            {formErrors.name && <span className="error-msg">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">✉️</span> Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={formErrors.email ? 'error' : ''} />
            {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">📞</span> Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required pattern="[0-9]{10,15}" placeholder="Enter phone number" className={formErrors.phone ? 'error' : ''} />
            {formErrors.phone && <span className="error-msg">{formErrors.phone}</span>}
          </div>
        </div>
        <div className="form-section">
          <div className="form-group">
            <label><span className="icon">🗓️</span> Check-in</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required className={formErrors.checkIn ? 'error' : ''} />
            {formErrors.checkIn && <span className="error-msg">{formErrors.checkIn}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">🗓️</span> Check-out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required className={formErrors.checkOut ? 'error' : ''} />
            {formErrors.checkOut && <span className="error-msg">{formErrors.checkOut}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">👥</span> Guests</label>
            <input type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} required className={formErrors.guests ? 'error' : ''} />
            {formErrors.guests && <span className="error-msg">{formErrors.guests}</span>}
          </div>
          <div className="form-group">
            <label><span className="icon">🧒</span> Children</label>
            <input type="number" min="0" value={children} onChange={e => setChildren(Number(e.target.value))} required className={formErrors.children ? 'error' : ''} />
            {formErrors.children && <span className="error-msg">{formErrors.children}</span>}
          </div>
        </div>
        <div className="form-section">
          <div className="form-group">
            <label><span className="icon">🍽️</span> Rate Plan</label>
            <select value={ratePlan} onChange={e => setRatePlan(e.target.value)}>
              <option value="With Breakfast">With Breakfast</option>
              <option value="Without Breakfast">Without Breakfast</option>
            </select>
          </div>
        </div>
        <button type="button" className="check-btn" onClick={handleCheckPrice}>Check Price & Availability</button>
        {showSpinner && <div className="spinner"></div>}
        {price !== null && (
          <div className="result">
            <h3>Dynamic Price: ${price.toFixed(2)}</h3>
          </div>
        )}
        {availability && (
          <div className="result">
            <h3>Availability: {availability}</h3>
          </div>
        )}
        <button type="submit" className="book-btn" disabled={availability !== 'Available'}>Book Now</button>
      </form>
      {confirmation && (
        <div className={`result ${showSuccess ? 'success' : ''}`}>
          <h3>{confirmation}</h3>
          {showSuccess && <div className="success-animation">✔️</div>}
        </div>
      )}
      <style jsx>{`
        .modern-card {
          box-shadow: 0 8px 32px rgba(0,0,0,0.14);
          border-radius: 20px;
          background: linear-gradient(135deg, #f0f4ff 80%, #e0e7ff 100%);
        }
        .booking-container {
          max-width: 540px;
          margin: 40px auto;
          padding: 40px 28px;
          background: #fff;
          border-radius: 20px;
        }
        h2 {
          font-size: 2.2rem;
          margin-bottom: 1.2em;
          text-align: center;
          color: #2d3748;
          font-weight: 700;
        }
        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 1.6em;
        }
        .form-section {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2em;
          margin-bottom: 0.5em;
        }
        .form-group {
          flex: 1 1 220px;
          display: flex;
          flex-direction: column;
          gap: 0.2em;
          background: #f8fafc;
          padding: 16px 12px;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(99,102,241,0.04);
        }
        label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 2px;
        }
        .icon {
          margin-right: 6px;
        }
        input, select {
          margin-top: 4px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 1rem;
          transition: border-color 0.2s;
          background: #fff;
        }
        input:focus, select:focus {
          border-color: #6366f1;
          outline: none;
        }
        input.error, select.error {
          border-color: #ef4444;
        }
        .error-msg {
          color: #ef4444;
          font-size: 0.9em;
          margin-top: 2px;
        }
        .check-btn, .book-btn {
          margin-top: 18px;
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg, #6366f1 60%, #60a5fa 100%);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 1.15em;
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
          transition: background 0.2s, transform 0.2s;
        }
        .check-btn:hover, .book-btn:hover {
          background: linear-gradient(90deg, #60a5fa 60%, #6366f1 100%);
          transform: translateY(-2px) scale(1.04);
        }
        .book-btn[disabled] {
          background: #cbd5e1;
          cursor: not-allowed;
        }
        .result {
          margin-top: 22px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 10px;
          text-align: center;
          font-size: 1.13em;
        }
        .result.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }
        .success-animation {
          font-size: 2.2em;
          margin-top: 8px;
          animation: pop 0.5s ease;
        }
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
        .spinner {
          margin: 16px auto;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 700px) {
          .booking-container {
            padding: 10px;
          }
          h2 {
            font-size: 1.3rem;
          }
          .form-section {
            flex-direction: column;
            gap: 0.7em;
          }
        }
      `}</style>
    </div>
  );
}

