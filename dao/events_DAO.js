const GenericDAO= require('../dao/genericDAO');

class EventsDAO extends GenericDAO {
    constructor() {
        super('events');
    }

    async getEventById(id) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results;
    }
    async getEventByName(name) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE name = ?", [this.tabla, email])
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