import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { movieAPI } from '../../services/api';
import './User.css';

function MyScreenings() {
  const { isAuthenticated } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const bookings = await movieAPI.getBookings();
        
        const now = new Date();
        const upcoming = [];
        const past = [];
        
        bookings.forEach(booking => {
          if (booking.screening && booking.screening.start_time) {
            const screeningDate = new Date(booking.screening.start_time);
            
            if (screeningDate > now) {
              upcoming.push(booking);
            } else {
              past.push(booking);
            }
          }
        });
        
        upcoming.sort((a, b) => {
          return new Date(a.screening.start_time) - new Date(b.screening.start_time);
        });
        
        past.sort((a, b) => {
          return new Date(b.screening.start_time) - new Date(a.screening.start_time);
        });
        
        setUpcomingBookings(upcoming);
        setPastBookings(past);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Nem sikerült betölteni a foglalásokat.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <div className="unauthorized-message">
        <h2>Hozzáférés megtagadva</h2>
        <p>Nem vagy bejelentkezve.</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="user-page">
        <h1>Foglalásaim</h1>
        <div className="loading-spinner">Betöltés...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="user-page">
        <h1>Foglalásaim</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <h1>Foglalásaim</h1>
      
      <h2>Közelgő foglalások</h2>
      {upcomingBookings.length > 0 ? (
        <div className="screenings-list">
          {upcomingBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} isUpcoming={true} />
          ))}
        </div>
      ) : (
        <p className="empty-list-message">Nincs közelgő foglalásod.</p>
      )}
      
      <h3>Korábbi foglalások</h3>
      {pastBookings.length > 0 ? (
        <div className="screenings-list">
          {pastBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
          ))}
        </div>
      ) : (
        <p className="empty-list-message">Nincs korábbi foglalásod.</p>
      )}
    </div>
  );
}

function BookingCard({ booking, isUpcoming }) {
  console.log(booking);
  
  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('hu-HU', options);
  };
  
  const formatDateAndDay = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = date.toLocaleDateString('hu-HU', dateOptions).replace(/\s/g, '');
    
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const dayName = days[date.getDay()];
    
    return `${formattedDate} ${dayName}`;
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { hour: '2-digit', minute: '2-digit', hour12: false };
    
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`screening-card ${!isUpcoming ? 'past-screening' : ''}`}>
      <div className="screening-movie-title">
        {booking.screening?.movie?.title || 'Ismeretlen film'}
      </div>
      
      <div className="screening-date-header">
        {formatDateAndDay(booking.screening?.start_time)}, {formatTime(booking.screening?.start_time)}
      </div>
      
      <div className="screening-room-badge">
        {booking.screening?.room?.name || 'N/A'} terem
      </div>
      
      <div className="ticket-types">
        {booking.ticket_types ? (
          (typeof booking.ticket_types === 'string' ? 
            JSON.parse(booking.ticket_types) : booking.ticket_types).map((ticket, index) => {
            let ticketName = 'Egyéb';
            let ticketPrice = '';
            
            if (ticket.type === 'normal' || ticket.type === 'adult') {
              ticketName = 'Felnőtt';
              ticketPrice = 2500;
            } else if (ticket.type === 'student') {
              ticketName = 'Diák';
              ticketPrice = 2000;
            } else if (ticket.type === 'retired' || ticket.type === 'senior') {
              ticketName = 'Nyugdíjas';
              ticketPrice = 1800;
            }
            
            return (
              <div className="ticket-type-row" key={index}>
                <span className="ticket-quantity">{ticket.quantity}x</span>
                <span className="ticket-name">{ticketName}</span>
                <span className="ticket-price">{ticket.quantity * ticketPrice} Ft</span>
              </div>
            );
          })
        ) : (
          <div className="ticket-type-row empty-tickets">
            <span>Nincs jegy információ</span>
          </div>
        )}
      </div>
      
      <hr className="ticket-divider" />
      
      {booking.seats && booking.seats.length > 0 && (
        <div className="seat-numbers">
          <span className="material-icons">chair</span>
          <span>
            {booking.seats.map((seat, index) => {
              return `${seat.row}. sor ${seat.seat}. szék`;
            }).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

export default MyScreenings;
