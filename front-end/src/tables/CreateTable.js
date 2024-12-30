import React, { useState } from "react";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";

function CreateTable() {
    const history = useHistory();

    const [error, setError] = useState(null);

    const initialFormState = {
        table_name: '',
        capacity: '',
    }

    const [table, setTable] = useState({...initialFormState});

    const handleChange = (event) => {
        setTable({...table, 
            [event.target.name]: event.target.value});
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);

        const abortController = new AbortController();

        createTable(table, abortController.signal)
        .then(() => {
            history.push('/');
        })
        .catch(setError);
    }

    return (
        <div>
            <ErrorAlert error={error} />
            <form onSubmit={handleSubmit}>
                <div>
                    <div>
                    <label htmlFor="table_name">First Name</label>
                    <input
                        type="text"
                        name="table_name"
                        onChange={handleChange}
                        value={table.table_name}
                        required
                        minLength="2"
                    />
                    </div>
                </div>
            
                <div>
                    <label htmlFor="capacity">Capacity</label>
                    <input
                    type="number"
                    name="capacity"
                    onChange={handleChange}
                    value={table.capacity}
                    min="1"
                    required
                    />
                </div>
            
                <button type="submit" className="btn-primary">Submit</button>

                <button type="button" className="btn-secondary" onClick={() => history.go(-1)}>Cancel </button>
            
                </form>
        </div>
    )

}



export default CreateTable;