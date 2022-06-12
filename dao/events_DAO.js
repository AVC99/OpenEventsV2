const GenericDAO= require('../dao/genericDAO');

class EventsDAO extends GenericDAO {
    constructor() {
        super('events');
    }

    async getEventById(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results[0];
    }

    async getFutureEvents() {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE eventStart_date > NOW()", [this.tabla])
        return results;
    }

    async insertEvent(event){
        const {name, owner_id, date, image, location, description, eventStart_date, eventEnd_date, n_participators,  type} = event;

        await global.connection.promise().query("INSERT INTO ?? (name, owner_id, date, image, location, description, eventStart_date, " +
        " eventEnd_date, n_participators, type ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [this.tabla, name, owner_id,date, image, location,
             description, eventStart_date, eventEnd_date, n_participators, type]);
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

    async getBestEvents(){
        const [results]= await global.connection.promise().query("Select (AVG(a.puntuation))AS average, e.owner_id FROM assistance AS a, events AS e, users AS u WHERE " +
        "e.owner_id=u.id AND e.id=a.event_id AND e.eventEnd_Date < NOW() GROUP BY e.owner_id ORDER BY average DESC", [this.tabla]);
        return results;
    }
}

module.exports = EventsDAO;