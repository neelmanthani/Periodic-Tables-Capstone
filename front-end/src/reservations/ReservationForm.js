import React from "react";
import { useHistory } from "react-router-dom";

function ReservationForm({reservation, setReservation, handleSubmit}) {
    const history = useHistory();

    const handleChange = (event) => {
        setReservation({...reservation, 
            [event.target.name]: event.target.value});
    }


    return (
        <form onSubmit={handleSubmit}>
          <div>
            <div>
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                name="first_name"
                onChange={handleChange}
                value={reservation.first_name}
                required
              />
            </div>
            <div>
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                name="last_name"
                onChange={handleChange}
                value={reservation.last_name}
                required
              />
            </div>
          </div>
    
          <div>
            <label htmlFor="mobile_number">Mobile Number</label>
            <input
              type="tel"
              name="mobile_number"
              onChange={handleChange}
              value={reservation.mobile_number}
              required
            />
          </div>
    
          <div>
            <label htmlFor="date">Date</label>
            <input 
              type="date"
              name="reservation_date" 
              onChange={handleChange}
              value={reservation.reservation_date}
              placeholder="YYYY-MM-DD" 
              pattern="\d{4}-\d{2}-\d{2}"
              required
            />
          </div>
    
          <div>
            <label htmlFor="time">Time</label>
            <input 
              type="time" 
              name="reservation_time"
              onChange={handleChange}
              value={reservation.reservation_time}
              placeholder="HH:MM" 
              pattern="[0-9]{2}:[0-9]{2}"
              required
            />
          </div>
    
          <div>
            <label htmlFor="people">Number of Guests</label>
            <input
              type="number"
              name="people"
              onChange={handleChange}
              value={reservation.people}
              min="1"
              max="8"
              required
            />
          </div>
    
          <button type="submit" className="btn-primary">Submit</button>

          <button type="button" className="btn-secondary" onClick={() => history.go(-1)}>Cancel </button>
    
        </form>
      );
}

export default ReservationForm;