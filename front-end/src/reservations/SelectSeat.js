
import React, { useEffect, useState } from "react";
import { listTables, assignTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from "react-router-dom";



function SelectSeat() {
    const history = useHistory();
    
    const { reservation_id } = useParams();

    const [tables, setTables] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadTables() {
            try {
              const tableList = await listTables(abortController.signal)
              setTables(tableList);
              if (tableList.length > 0){
                setSelectedTableId(tableList[0].table_id);
              }
            } catch (error) {
              setError(error);
            }
          }
          
          loadTables();

          return () => abortController.abort();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(null);

        const abortController = new AbortController();

        assignTable(selectedTableId, reservation_id, abortController.signal)
        .then(() => {
            history.push('/');
        })
        .catch(setError);

        return () => abortController.abort();
    }
    return (
        <div>
            <ErrorAlert error={error} />
            <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="table_id">Table number</label>
                <select 
                name="table_id"
                value={selectedTableId}
                onChange={(event) => { 
                    setSelectedTableId(event.target.value);
                    }}> 
                {tables.map((table) => {
                    return (
                    <option key={table.table_id} value={table.table_id}>
                        {`${table.table_name} - ${table.capacity}`}
                    </option>
                )}
                )} 
                </select>
            </div>
        
            <button type="submit" className="btn-primary">Submit</button>

            <button type="button" className="btn-secondary" onClick={() => history.go(-1)}>Cancel </button>
        
            </form>
        </div>
      );
}

export default SelectSeat;