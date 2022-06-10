const GenericDAO= require('../dao/genericDAO');

class EventsDAO extends GenericDAO {
    constructor() {
        super('events');
    }
    async getAllEvents() {
        const [results] = await global.connection.promise().query("SELECT * FROM ??", [this.tabla])
        if(results===0)return next(new Error('No events found'));
        return results;
    }

    async getEventById(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results;
    }

    async getFutureEvents() {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE eventStart_date > NOW()", [this.tabla])
        return results;
    }

    async getEventByLocation(location){
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE location = ?", [this.tabla, location])
        return results;
    }
    
    async getEventByName(name) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE name = ?", [this.tabla, name])
        return results;
    }
    async getEventByOwnerId(ownerId) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE ownerId = ?", [this.tabla, ownerId])
        return results;
    }
    async getEventByLocation(location) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE location = ?", [this.tabla, location])
        return results;
    }
    async getEventByDate(date) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE date = ?", [this.tabla, date])
        return results;
    }
    //TODO: INSERT, UPDATE, DELETE
    
}

module.exports = EventsDAO;