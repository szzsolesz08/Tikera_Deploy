import { useCallback } from 'react';
import SeatGrid from './SeatGrid';
import './SeatSelection.css';

const ticketTypes = [
  { id: 'student', label: 'Diák', price: 2000 },
  { id: 'adult', label: 'Felnőtt', price: 2500 },
  { id: 'senior', label: 'Nyugdíjas', price: 1800 },
];

function SeatSelection({ currentScreening, tickets, selectedSeats, onTicketsChange, onSeatsChange }) {
  const handleTicketChange = useCallback((type, increment) => {
    onTicketsChange({
      ...tickets,
      [type]: Math.max(0, tickets[type] + increment)
    });
  }, [tickets, onTicketsChange]);

  const handleSeatChange = useCallback((seats) => {
    onSeatsChange(seats);
  }, [onSeatsChange]);

  const totalPrice = ticketTypes.reduce((sum, ticket) => 
    sum + (tickets[ticket.id] * ticket.price), 0
  );

  const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);

  return (
    <div className="seat-selection">
      <div className="selection-container">
        <div className="ticket-selector">
          <div className="ticket-selection">
            <div className="ticket-types">
              {ticketTypes.map(ticket => (
                <div key={ticket.id} className="ticket-type">
                  <div className="ticket-info">
                    <span className="ticket-label">{ticket.label}</span>
                    <span className="ticket-price">{ticket.price} Ft</span>
                  </div>
                  <div className="ticket-counter">
                    <button
                      className="counter-button"
                      onClick={() => handleTicketChange(ticket.id, -1)}
                      disabled={tickets[ticket.id] === 0}
                    >
                      -
                    </button>
                    <span className="ticket-count">{tickets[ticket.id]}</span>
                    <button
                      className="counter-button"
                      onClick={() => handleTicketChange(ticket.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="total-price">
              Összesen: {totalPrice} Ft
            </div>
            {totalTickets > 0 && (
              <div className="seat-selection-prompt">
                <div>Válaszd ki az ülőhelyeket!</div>
                <div className="seat-count">{selectedSeats.length}/{totalTickets} kiválasztva</div>
              </div>
            )}
          </div>
        </div>
        <SeatGrid 
          currentScreening={currentScreening}
          totalTickets={totalTickets}
          selectedSeats={selectedSeats}
          onSeatsChange={handleSeatChange}
        />
      </div>
    </div>
  );
}

export default SeatSelection;
