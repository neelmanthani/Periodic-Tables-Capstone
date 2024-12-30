const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/errorBoundary");

const validFormFields = [
    "table_name",
    "capacity"
]

async function list(req, res) {
    data = await service.list();
    res.json({data});
  }

async function isValidTable(req, res, next) {
    const {data = {}} = req.body;
    if (Object.keys(data) == 0) {
      return next({status: 400, message:`Table data fields must be provided`});
    }
    validFormFields.forEach((field) => {
      if (!data[field]) {
        return next({status: 400, message:`Missing field: ${field}`});
      }
      if (field == "table_name") {
        if (data[field].length < 2) {
          return next({status: 400, message:`table_name must be at least 2 characters`});
        }
        res.locals.table_date = data[field];
      } else if (field == "capacity") {
        if (typeof data[field] !== "number") {
            return next({status: 400, message:`capacity should be a number`});
        }
        if (data[field] < 1) {
          return next({status: 400, message:`Capacity must be at least 1`});
        }
        res.locals.capacity = data[field];
        }
    })

    next();
}

async function create(req, res) {
    const newTable = await service.create(req.body.data);
  
    res.status(201).json({
      data: newTable,
    });
}

async function assignTable(req, res, next) {
    if (!req.body.data) {
      return next({status: 400, message:`Table data fields must be provided`});
    }

    const {data={}} = req.body;

    if (!data.reservation_id) {
        return next({status: 400, message:`reservation_id missing`});
    }

    const reservation = await service.readReservation(data.reservation_id);

    if (!reservation) {
        return next({status: 404, message: `Reservation with id ${data.reservation_id} cannot be found.`})
    }

    if (reservation.status == 'seated') {
      return next({status: 400, message: `Guest already seated.`})
    }

    const table_id = req.params.table_id;

    const table = await service.readTable(table_id);

    if (!table) {
        return next({status: 404, message: "Table cannot be found."})
    }

    if (reservation.people > table.capacity) {
        return next({status: 400, message:`insufficient table capacity`});
    }


    if (table.reservation_id) {
        return next({status: 400, message:`table already occupied`});
    }

    try {
      const updatedTable = await service.assignTable(table.table_id, data.reservation_id);
      res.status(200).json({data: updatedTable});
    } catch (error) {
      throw error;
    }

    
}

async function deleteAssignment(req, res, next) {
  
  const table_id = req.params.table_id;

  const table = await service.readTable(table_id);

  if (!table) {
    return next({status: 404, message: `Table with id ${table_id} cannot be found.`})
  }

  if (!table.reservation_id) {
    return next({status: 400, message:`table is not occupied`});
  }

  await service.deleteAssignment(table_id, table.reservation_id);

  res.status(200).json({});

}

module.exports = {
    list: asyncErrorBoundary(list),
    create: [asyncErrorBoundary(isValidTable), asyncErrorBoundary(create)],
    assignTable: asyncErrorBoundary(assignTable),
    delete: asyncErrorBoundary(deleteAssignment)
  };