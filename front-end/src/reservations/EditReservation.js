import React, { useState, useEffect} from "react";
import { updateReservation, readReservation } from "../utils/api";
import { formatAsDate } from "../utils/date-time";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from "react-router-dom";

function validateReservationDateTime(reservation) {
    const reservation_date_time = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
    let errorMessage = '';
    const today = new Date();
    if (reservation_date_time < today) {
        errorMessage = "Date is in the past";
    }

    const hour = reservation_date_time.getHours();
    const minute = reservation_date_time.getMinutes();

    
    if ((hour < 10 || (hour === 10 && minute < 30)) 
        || (hour > 21 || (hour === 21 && minute > 30))) {
            if (errorMessage !== ''){
                errorMessage += ', '
            }
            errorMessage += 'Hours must be between 10:30 AM and 9:30 PM';
    }

    const dayOfWeek = reservation_date_time.getDay();

    if (dayOfWeek === 2) {
        if (errorMessage !== ''){
            errorMessage += ', '
        }
        errorMessage += 'Restaurant is closed on Tuesdays';
    }

    return errorMessage;
}

function EditReservation() {
    const history = useHistory();
    const { reservation_id } = useParams();

    const [error, setError] = useState(null);

    const initialFormState = {
        first_name: '',
        last_name: '',
        mobile_number: '',
        reservation_date: '',
        reservation_time: '',
        people: ''
    }

    const [reservation, setReservation] = useState({...initialFormState});

    useEffect(() => {
        const abortController = new AbortController();
        setError(null);

        async function loadReservation(abortController) {
            try {
                const res = await readReservation(reservation_id, abortController.signal)
                res.reservation_date = formatAsDate(res.reservation_date);
                setReservation(res);
            } catch (error) {
                setError(error);
            }
        }
        
        loadReservation(abortController);
        
        return () => abortController.abort();
      }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);


        const errorMessage = validateReservationDateTime(reservation);

        if (errorMessage !== '') {
            console.log(errorMessage);
            setError({message: errorMessage});
            return;
        }


        const abortController = new AbortController();

        updateReservation(reservation_id, reservation, abortController.signal)
        .then((updatedReservation) => {
            history.push(`/dashboard?date=${updatedReservation.reservation_date}`);
        })
        .catch(setError);
    }

    return (
        <div>
            <ErrorAlert error={error} />
            <ReservationForm reservation={reservation} setReservation={setReservation} handleSubmit={handleSubmit}/>
        </div>
    )

}



export default EditReservation;