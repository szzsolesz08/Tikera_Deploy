import { useEffect } from 'react';
import './SeatGrid.css';

function SeatGrid({ currentScreening, totalTickets, selectedSeats, onSeatsChange }) {
  useEffect(() => {
    if (selectedSeats.length > totalTickets) {
      onSeatsChange(selectedSeats.slice(0, totalTickets));
    }
  }, [totalTickets, selectedSeats, onSeatsChange]);

  const rows = currentScreening?.room?.rows || 9;
  const seatsPerRow = currentScreening?.room?.seatsPerRow || 9;
  
  console.log('Screening data for seat grid:', {
    screeningId: currentScreening?.id,
    room: currentScreening?.room,
    bookings: currentScreening?.bookings
  });
  
  const isBookedSeat = (row, seat) => {
    if (!currentScreening?.bookings || !Array.isArray(currentScreening?.bookings)) {
      return false;
    }
    
    return currentScreening.bookings.some(booking => {
      if (booking.row !== undefined && booking.seat !== undefined) {
        return booking.row === row && booking.seat === seat;
      }
      
      return booking && booking[row] && booking[row].includes(seat);
    });
  };
  
  const seatGrid = Array.from({ length: rows }, (_, rowIndex) => (
    Array.from({ length: seatsPerRow }, (_, seatIndex) => ({
      row: rowIndex + 1,
      seat: seatIndex + 1,
      isBooked: isBookedSeat(rowIndex + 1, seatIndex + 1)
    }))
  ));

  const handleSeatClick = (row, seat) => {
    const isSelected = selectedSeats.some(s => s.row === row && s.seat === seat);

    if (isSelected) {
      onSeatsChange(selectedSeats.filter(s => s.row !== row || s.seat !== seat));
    } else if (selectedSeats.length < totalTickets) {
      onSeatsChange([...selectedSeats, { row, seat }]);
    }
  };

  const isSeatSelected = (row, seat) => {
    return selectedSeats.some(s => s.row === row && s.seat === seat);
  };

  return (
    <div className="seats-container">
      <div className="seats-grid">
        {seatGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => (
              <button
                key={`${seat.row}-${seat.seat}`}
                className={`seat ${
                  seat.isBooked ? 'booked' : 
                  isSeatSelected(seat.row, seat.seat) ? 'selected' :
                  'available'
                }`}
                onClick={() => !seat.isBooked && handleSeatClick(seat.row, seat.seat)}
                disabled={seat.isBooked || (!isSeatSelected(seat.row, seat.seat) && selectedSeats.length >= totalTickets)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeatGrid;
