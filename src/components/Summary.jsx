import './Summary.css';

function Summary({ movie, tickets, selectedSeats, totalPrice, onBookingConfirm }) {
  const getTicketSummary = () => {
    return Object.entries(tickets)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => {
        const ticketType = {
          student: 'Diák',
          adult: 'Felnőtt',
          senior: 'Nyugdíjas'
        }[type];
        return `${count}× ${ticketType}`;
      });
  };

  const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);
  const isBookingValid = selectedSeats.length === totalTickets && totalTickets > 0;

  const formatSeatLabel = (seat) => {
    return `${seat.row}. sor ${seat.seat}. szék`;
  };

  return (
    <div className="summary">
      <div className="summary-container">
        <div className="summary-header">
          <h3>{movie?.title}</h3>
        </div>
        <div className="summary-content">
          <div className="tickets-summary">
            {getTicketSummary().map((ticket, index) => (
              <div key={index} className="ticket-line">
                {ticket}
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="seats-section">
            <div className="seats-header">Helyek</div>
            <div className="seats-list">
              {selectedSeats.map((seat, index) => (
                <div key={index} className="seat-item">
                  {formatSeatLabel(seat)}
                </div>
              ))}
            </div>
          </div>
          <div className="total-section">
            <span>Összesen:</span>
            <span>{totalPrice} Ft</span>
          </div>
        </div>
        <button 
          className="confirm-button" 
          disabled={!isBookingValid}
          onClick={onBookingConfirm}
        >
          Foglalás véglegesítése
        </button>
      </div>
    </div>
  );
}

export default Summary;