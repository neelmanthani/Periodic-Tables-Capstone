import React from "react";
import { formatAsTime } from "../utils/date-time";
import { setStatus } from "../utils/api";
import { useHistory} from "react-router-dom";



function ReservationTile({reservation, setError, loadReservations}) {
    const history = useHistory();

    const reservation_id = reservation.reservation_id;

    let showSeatButton = true;
    let showTile = true;
    if (reservation.status == 'seated') {
      showSeatButton = false;
    } else if (reservation.status == 'finished') {
      showTile = false;
    }

    const handleCancel = (reservation_id) => {

        const confirmFinish = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
    
        if (!confirmFinish) return;
    
        const abortController = new AbortController();
        
    
        setStatus(reservation_id, "cancelled", abortController.signal)
        .then(() => {
            loadReservations(abortController);
        })
        .catch(setError);
    }
  
    return <>{showTile && 
            <div className="border p-3 pl-4 container">
                <div className="row justify-content-center">
                    <p>{formatAsTime(reservation.reservation_time)}</p>
                </div>
                <div className="row justify-content-center">
                    <p>{reservation.first_name} {reservation.last_name}</p>
                </div>
                
                <div className="row justify-content-center">
                    <p>Group of {reservation.people}</p>
                </div>
  
                <div className="row justify-content-center" data-reservation-id-status={reservation.reservation_id}>
                    <p>Status: {reservation.status}</p>
                </div>
  
                <div className="row">
                    {showSeatButton && <a className="btn btn-primary w-100" href={`/reservations/${reservation_id}/seat`}>Seat</a>}
                    <a className="btn btn-secondary w-100" href={`/reservations/${reservation_id}/edit`}>Edit</a>
                    {reservation.status !== 'cancelled' && <button 
                        className="btn btn-secondary w-100" 
                        data-reservation-id-cancel={reservation.reservation_id} 
                        onClick={() => handleCancel(reservation_id)}>
                            Cancel
                    </button>}
                </div>
  
            </div>
          }</>
  }

export default ReservationTile;