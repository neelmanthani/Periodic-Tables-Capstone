const knex = require("../db/connection")

function list() {
    return knex("tables")
        .select("*")
        .orderBy('table_name', 'asc')
}

function create(newTable) {
    return knex("tables")
        .insert(newTable)
        .returning("*")
        .then((newTableArray) => newTableArray[0]);
}

function readReservation(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({reservation_id: reservation_id})
        .first();
}

function readTable(table_id) {
    return knex("tables")
        .select("*")
        .where({table_id: table_id})
        .first();
}

function assignTable(table_id, reservation_id){
    return knex
    .transaction(function (trx) {
        return trx("reservations")
        .where({reservation_id: reservation_id})
        .update({status: 'seated'})
        .returning("*")
        .then(() => { 
            return trx("tables")
            .where({table_id: table_id})
            .update({reservation_id: reservation_id})
            .returning("*"); })
    }).then((updatedTable) => { 
        return updatedTable;
    }).catch((error) => {
        console.error('rolling back:', error);
    });
}

function deleteAssignment(table_id, reservation_id){
    return knex.transaction(function (trx) {
        return trx("reservations")
        .where({reservation_id: reservation_id})
        .update({status: 'finished'})
        .returning("*")
        .then(() => { 
            return trx("tables")
            .where({table_id: table_id})
            .update({reservation_id: null})
            .returning("*"); })
        }).then((updatedTable) => { 
            return updatedTable;
        }).catch((error) => {
            console.error('rolling back:', error);
        });
}

module.exports = {
    list,
    create,
    readReservation,
    readTable,
    assignTable,
    deleteAssignment
}