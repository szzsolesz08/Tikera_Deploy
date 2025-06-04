import { useState } from 'react';
import SeatSelection from './components/SeatSelection';
import Summary from './components/Summary';
import './MovieDetails.css';
import { movieAPI } from './services/api';

function getNumericDayIndex(dayName) {
  const dayMap = {
    'Monday': [1],
    'Tuesday': [2],
    'Wednesday': [3],
    'Thursday': [4],
    'Friday': [5],
    'Saturday': [6],
    'Sunday': [7]
  };
  
  return dayMap[dayName] || [];
}

const weekdayMap = {
  'Hétfő': 'Monday',
  'Kedd': 'Tuesday',
  'Szerda': 'Wednesday',
  'Csütörtök': 'Thursday',
  'Péntek': 'Friday',
  'Szombat': 'Saturday',
  'Vasárnap': 'Sunday'
};

function MovieDetails({ movie, selectedDay, onBookingComplete }) {
  const [currentScreening, setCurrentScreening] = useState(null);
  const [tickets, setTickets] = useState({
    student: 0,
    adult: 0,
    senior: 0
  });
  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!movie) {
    return <></>;
  }

  const matchesDay = (screening) => {
    if (!screening) return false;
    
    const englishDay = weekdayMap[selectedDay] || selectedDay;
    
    if (typeof screening.week_day === 'number') {
      const possibleValues = getNumericDayIndex(englishDay);
      if (possibleValues.includes(screening.week_day)) {
        return true;
      }
    }
    
    if (screening.weekday === englishDay) {
      return true;
    }
    
    if (screening.date) {
      try {
        const screeningDate = new Date(screening.date);
        if (!isNaN(screeningDate)) {
          const dayOfWeek = screeningDate.getDay();
          const possibleValues = getNumericDayIndex(englishDay);
          
          const jsDayToIsoDay = dayOfWeek === 0 ? 7 : dayOfWeek; 
          
          if (possibleValues.includes(jsDayToIsoDay)) {
            return true;
          }
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    
    return false;
  };
  
  const dayScreenings = movie.screenings
    .filter(matchesDay)
    .sort((a, b) => {
      const timeA = a.start_time.split(':').map(Number);
      const timeB = b.start_time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
  const handleScreeningSelect = (screening) => {
    setCurrentScreening(screening);
    setTickets({ student: 0, adult: 0, senior: 0 });
    setSelectedSeats([]);
  };

  const handleTicketsChange = (newTickets) => {
    setTickets(newTickets);
  };

  const handleSeatsChange = (newSeats) => {
    setSelectedSeats(newSeats);
  };

  const isScreeningFull = (screening) => {
    const totalSeats = screening.room.rows * screening.room.seatsPerRow;
    const bookedSeats = screening.bookings?.length || 0;
    return bookedSeats >= totalSeats;
  };

  const ticketTypes = [
    { id: 'student', price: 2000 },
    { id: 'adult', price: 2500 },
    { id: 'senior', price: 1800 }
  ];

  const totalPrice = ticketTypes.reduce((sum, ticket) => 
    sum + (tickets[ticket.id] * ticket.price), 0
  );

  const handleBookingConfirm = async () => {
    if (!currentScreening || selectedSeats.length === 0) return;
    
    if (selectedSeats.length !== Object.values(tickets).reduce((sum, count) => sum + count, 0)) {
      alert('Please select seats for all your tickets');
      return;
    }

    try {
      const bookingData = {
        screening_id: currentScreening.id,
        seats: selectedSeats.map(seat => ({
          row: seat.row,
          seat: seat.seat
        })),
        ticket_counts: {
          student: tickets.student,
          adult: tickets.adult,
          senior: tickets.senior
        }
      };
      
      const response = await movieAPI.createBooking(currentScreening.id, bookingData);
      
      setCurrentScreening(null);
      setTickets({ student: 0, adult: 0, senior: 0 });
      setSelectedSeats([]);
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      alert('Booking successfully created!');
    } catch (error) {
      console.error('Failed to create booking:', error);
      
      const errorMessage = error.message || 'Could not complete your booking. Please try again.';
      
      if (error.message && error.message.toLowerCase().includes('unauthenticated')) {
        alert('Authentication required. You need to be logged in to make a booking.');
      } else if (error.message && error.message.toLowerCase().includes('already booked')) {
        alert('One or more of these seats are already booked. Please select different seats.');
      } else {
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="movie-details-container">
      <div className="movie-details-content">
        <div className="movie-header">
          <div className="movie-poster">
            {movie.image_path ? (
              <img 
                src={movie.image_path.startsWith('http') 
                  ? movie.image_path 
                  : movie.image_path.startsWith('/') 
                    ? `${import.meta.env.VITE_API_URL}${movie.image_path}`
                    : `${import.meta.env.VITE_API_URL}/${movie.image_path}`
                } 
                alt={movie.title}
                style={{ maxWidth: '100%', maxHeight: '350px' }}
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
          <div className="movie-title-section">
            <h2>{movie.title}</h2>
            <div className="movie-meta">
              <span>{movie.release_year}</span>
              <span>{movie.duration} min</span>
              <span>{movie.genre}</span>
            </div>
            <div className="movie-description">
              <p>{movie.description}</p>
            </div>
            <div className="screening-times">
              {dayScreenings.map(screening => {
                const full = isScreeningFull(screening);
                return (
                  <button
                    key={screening.id}
                    className={`time-button ${screening === currentScreening ? 'active' : ''} ${full ? 'full' : ''}`}
                    onClick={() => handleScreeningSelect(screening)}
                    disabled={full}
                    title={full ? 'Telt ház' : ''}
                  >
                    {screening.start_time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {currentScreening && (
          <>
            <SeatSelection 
              currentScreening={currentScreening}
              tickets={tickets}
              selectedSeats={selectedSeats}
              onTicketsChange={handleTicketsChange}
              onSeatsChange={handleSeatsChange}
            />
            <Summary 
              movie={movie}
              tickets={tickets}
              selectedSeats={selectedSeats}
              totalPrice={totalPrice}
              onBookingConfirm={handleBookingConfirm}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;
