import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today, next, previous } from "../utils/date-time";
import { useLocation } from 'react-router-dom';
import ReservationTile from '../reservations/ReservationTile';

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */


function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const date = searchParams.get('date') || today();

  async function loadReservations(abortController) {
    try {
      const resList = await listReservations({ date }, abortController.signal)
      setReservations(resList);
    } catch (error) {
      setReservationsError(error);
    }
  }

  async function loadTables(abortController) {
    try {
      const tableList = await listTables(abortController.signal)
      setTables(tableList);
    } catch (error) {
      setReservationsError(error);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    setReservationsError(null);
    
    loadTables(abortController);
    loadReservations(abortController);
    
    return () => abortController.abort();
  }, [date]);

  const finishReservation = async (table_id) => {
    const confirmFinish = window.confirm("Is this table ready to seat new guests? This cannot be undone.");

    if (!confirmFinish) return;

    const abortController = new AbortController();

    try {
      await finishTable(table_id);
      const updatedTables = await listTables(abortController.signal);
      loadTables(abortController);
      loadReservations(abortController);
    } catch (error) {
      setReservationsError(error);
    }

    return () => abortController.abort();
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div> 
      <div className="p-3 pl-4 container">
        <div className='row'>
          <a className="btn btn-secondary col mx-5" href={`/dashboard?date=${previous(date)}`}>Previous</a>
          <a className="btn btn-secondary col mx-5" href={`/dashboard?date=${today()}`}>Today</a>
          <a className="btn btn-secondary col mx-5" href={`/dashboard?date=${next(date)}`}>Next</a>
        </div>
      </div>
      <ErrorAlert error={reservationsError} />
      <div className="p-3 pl-4 container">
        <div className="row">
          <div className="col-8">
            {reservations.map((reservation) => {
              return <ReservationTile key={reservation.id} reservation={reservation} setError={setReservationsError} loadReservations={loadReservations}/>
            })}
          </div>
          <div className="border p-3 col-4">
          {tables.map((table) => {
              let availability = "Free";
              let displayFinish = false;
              if (table.reservation_id) {
                availability = "Occupied";
                displayFinish = true;
              }
              return <div key={table.table_id} className="row">
                  <div className="col-5">{table.table_name}</div>
                  <div className="col-5" data-table-id-status={table.table_id}>{availability}</div>
                  {displayFinish && 
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      data-table-id-finish={table.table_id} 
                      onClick={() => finishReservation(table.table_id)}>
                        Finish
                    </button>}
                </div>
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
