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
        return results[0];
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
        const {name, owner_id, date, image, location, description, eventStart_date, eventEnd_date, n_participators,  type} = event;

        await global.connection.promise().query("INSERT INTO ?? (name, owner_id, date, image, location, description, eventStart_date, " +
        " eventEnd_date, n_participators, type ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [this.tabla, name, owner_id,date, image, location,
             description, eventStart_date, eventEnd_date, n_participators, type]);
            console.log("Event inserted");
    }

    async updateEvent(event){
        await global.connection.promise().query(
            "UPDATE ?? SET name = ?, owner_id = ?, date = ?, image = ?, location = ?, description = ?, " +
        "eventStart_date = ?, eventEnd_date = ?, n_participators = ?, type = ? WHERE id = ?;" ,
         [this.tabla, event.name, event.owner_id, event.date, event.image, event.location, event.description, event.eventStart_date, event.eventEnd_date,
             event.n_participators, event.type, event.id]);
        }
    async deleteEvent(id){
        await global.connection.promise().query("DELETE FROM ?? WHERE id = ?", [this.tabla, id]);
    }
    async getAllOldEvents(){
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE eventEnd_date < NOW()", [this.tabla])
        return results;
    }

    async getAllAssistancesByID(id){
        const [results]= await global.connection.promise().query("SELECT * FROM assistance WHERE event_id = ?", [id]);
        return results;
    }

    async getBestEvents(){
        const [results]= await global.connection.promise().query("Select (AVG(a.puntuation))AS average, e.owner_id FROM assistance AS a, events AS e, users AS u WHERE " +
        "e.owner_id=u.id AND e.id=a.event_id AND e.eventEnd_Date < NOW() GROUP BY e.owner_id ORDER BY average DESC", [this.tabla]);
        return results;
    }
}

module.exports = EventsDAO;