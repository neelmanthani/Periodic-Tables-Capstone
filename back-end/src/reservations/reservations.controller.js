/**
 * List handler for reservation resources
 */

const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/errorBoundary");
const dateFormat = /\d\d\d\d-\d\d-\d\d/;
const timeFormat = /\d\d:\d\d/;

const validFormFields = [
  "first_name",
  "last_name",
  "mobile_number", 
  "reservation_date", 
  "reservation_time", 
  "people",
  "status"
]

const validStatuses = [
  "booked",
  "seated",
  "finished",
  "cancelled"
]

async function isValidReservation(req, res, next) {
  const {data = {}} = req.body;
  if (Object.keys(data) == 0) {
    return next({status: 400, message:`Reservation data fields must be provided`});
  }
  validFormFields.forEach((field) => {
    if (!data[field] && field != 'status') {
      return next({status: 400, message:`Missing field: ${field}`});
    }
    if (field == "reservation_date") {
      if (!data[field].match(dateFormat)) {
        return next({status: 400, message:`Invalid ${field}`});
      }
      res.locals.reservation_date = data[field];
    } else if (field == "reservation_time") {
      if (!data[field].match(timeFormat)) {
        return next({status: 400, message:`Invalid ${field}`});
      }
      res.locals.reservation_time = data[field];
    } else if (field == "people") {
      if (typeof data[field] !== "number") {
        return next({status: 400, message:`people should be a number`});
      }
    } else if (field == "status") {
      if (data[field] == "seated" || data[field] == "finished") {
        return next({status: 400, message:`Status cannot be ${data[field]}`});
      }
    }
  })

  next();
}

async function isValidReservationDateTime(req, res, next) {
  reservation_date_time = new Date(`${res.locals.reservation_date}T${res.locals.reservation_time}`);
  

  const today = new Date();

  if (reservation_date_time < today) {
    return next({status: 400, message:`Date must be in the future`});
  }

  const hour = reservation_date_time.getHours();
  const minute = reservation_date_time.getMinutes();

  if ((hour < 10 || (hour === 10 && minute < 30)) 
    || (hour > 21 || (hour === 21 && minute > 30))) {
      return next({status: 400, message: 'Hours must be between 10:30 AM and 9:30 PM'});
  }

  const dayOfWeek = reservation_date_time.getDay();;

  if (dayOfWeek == 2) {
    return next({status: 400, message:`Restuarant is closed on Tuesdays`});
  }

  next();
}

async function list(req, res) {
  const filters = req.query;
  
  data = await service.list(filters);

  res.json({data});
}

async function create(req, res) {
  const newReservation = await service.create(req.body.data);

  res.status(201).json({
    data: newReservation,
  });
}

async function reservationExists(req, res, next) {
  const {reservation_id} = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
      res.locals.reservation = reservation;
      return next();
  }
  return next({status: 404, message: `reservation ${reservation_id} cannot be found.`})
}

async function read(req, res, next) {
  const reservation = res.locals.reservation;
  res.json({data: reservation});
}



function checkForValidStatus(req, res, next){
  const {data = {}} = req.body;
  if (Object.keys(data) == 0) {
    return next({status: 400, message:`A status field must be provided`});
  }
  if (!validStatuses.find((status) => status === data.status)) {
    return next({status: 400, message:`unknown status`});
  }
  if (res.locals.reservation.status === 'finished') {
    return next({status: 400, message:`Status can't be changed from finished`});
  }
  return next();
}

async function setStatus(req, res) {
  const {reservation_id} = res.locals.reservation;
  const data = await service.setStatus(reservation_id, req.body.data.status);
  res.status(200).json({data: {status: data[0].status}});
}

async function update(req, res) {
  const { reservation_id } = res.locals.reservation;
  const updatedReservation = {...req.body.data, reservation_id};
  const data = await service.update(updatedReservation);
  res.status(200).json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(isValidReservation), asyncErrorBoundary(isValidReservationDateTime), asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  setStatus: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(checkForValidStatus), asyncErrorBoundary(setStatus)],
  update: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(isValidReservation), asyncErrorBoundary(isValidReservationDateTime), asyncErrorBoundary(update),],
};
