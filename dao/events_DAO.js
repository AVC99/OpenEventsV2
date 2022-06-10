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
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE location = ?", [this.tabla, location])
        return results;
    }
    
    async getEventByName(name) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE name = ?", [this.tabla, name])
        return results;
    }
    async getEventByOwnerId(ownerId) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE ownerId = ?", [this.tabla, ownerId])
        return results;
    }
    async getEventByLocation(location) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE location = ?", [this.tabla, location])
        return results;
    }
    async getEventByDate(date) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE date = ?", [this.tabla, date])
        return results;
    }
    async getEventAssistences(id) {
        const [results]= await global.connection.promise().query("SELECT u.id, u.name, u.last_name, u.email, a.puntuation, a.comentary "+
        "FROM assistance AS a, users AS u WHERE a.user_id=u.id AND a.event_id= ? ORDER BY a.puntuation DESC;", [this.tabla, id]);
        return results;
    }
    async eventExists(id){
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id]);
        if (results.length===0) return false;
        return true;
    }
    async insertEvent(event){
        const {name, ownerId,date, image, location, description, eventStart_date, eventEnd_date, n_participators, type} = event;
        
        await global.connection.promise().query("INSERT INTO ?? (name, ownerId, date, image, location, description, eventStart_date"+
        "eventEnd_date, n_participators, type ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ", [this.tabla, name, ownerId,date, image, location,
             description, eventStart_date, eventEnd_date, n_participators, type]);
    }

    //TODO: INSERT, UPDATE, DELETE
    
}

module.exports = EventsDAO;