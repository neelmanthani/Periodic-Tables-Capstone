import React, { useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import ReservationTile from '../reservations/ReservationTile';

function Search() {
  const history = useHistory();
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  

  async function loadReservations(abortController) {
    try {
      const resList = await listReservations({ mobile_number: mobileNumber }, abortController.signal)
      setReservations(resList);
      setSearched(true);
    } catch (error) {
      setError(error);
    }
  }


  const handleSearch = (event) => {
    event.preventDefault();
    setError(null);

    const abortController = new AbortController();

    loadReservations(abortController)

    return () => abortController.abort();
  };

  return (
    <div>
      <ErrorAlert error={error} />
      <form onSubmit={handleSearch}>
        <div>
          <label htmlFor="mobile_number">Search by Phone Number</label>
          <input
            id="mobile_number"
            name="mobile_number"
            type="text"
            placeholder="Enter a customer's phone number"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn-primary mt-2">Find</button>
      </form>

      {searched && (
        <div className="mt-4">
          {reservations.length > 0 ? (
            <div>
              <h4>Reservations Found:</h4>
                <div className="col-8">
                    {reservations.map((reservation) => {
                        return <ReservationTile key={reservation.id} reservation={reservation} setError={setError} loadReservations={loadReservations}/>
                    })}
                </div>
            </div>
          ) : (
            <h4>No reservations found</h4>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;