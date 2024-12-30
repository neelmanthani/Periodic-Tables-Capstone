const knex = require("../db/connection")

function list(filters) {
    if (filters.date) {
        return knex("reservations")
            .select("*")
            .where({"reservation_date": filters.date})
            .andWhereNot({ status: "finished" })
            .orderBy('reservation_time', 'asc')
    } else {
        return knex("reservations")
            .select("*")
            .where("mobile_number", "like", `%${filters.mobile_number}%`)
            .andWhereNot({ status: "finished" })
            .orderBy('reservation_time', 'asc')
    }
}

function create(newReservation) {
    return knex("reservations")
        .insert(newReservation)
        .returning("*")
        .then((newReservationArray) => newReservationArray[0]);
}

function read(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({reservation_id: reservation_id})
        .first();
}

function setStatus(reservation_id, status) {
    return knex("reservations")
        .where({reservation_id: reservation_id})
        .update({status: status})
        .returning("*");
}

function update(updatedReservation) {
    return knex("reservations")
        .where({reservation_id: updatedReservation.reservation_id})
        .update(updatedReservation)
        .returning("*")
        .then((newReservationArray) => newReservationArray[0]);
}

module.exports = {
    list,
    create,
    read,
    setStatus,
    update
}