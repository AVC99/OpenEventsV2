const GenericDAO= require('../dao/genericDAO');

class AssistencesDAO extends GenericDAO {
    constructor() {
        super('assistance');
    }

    async deleteAssistanceFromEvent(id, user_id){
        await global.connection.promise().query("DELETE FROM ?? WHERE event_id = ? AND user_id = ?", [this.tabla, id, user_id]);
    }
    async getAssistancesByEventAndOwnerID(event_id, user_id){
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE event_id= ? AND user_id = ?", [this.tabla, event_id, user_id]);
        return results[0];
    }
    async getAssistancesByEventID(id){
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE event_id = ?", [this.tabla, id]);
        return results;
    }
    async getAssistencesByAuthUserIdEventId(event_id, user_id){
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE user_id = ? AND event_id = ?", [this.tabla, event_id, user_id]);
        return results;
    }
    async getAssistencesByEventIdUserId(req){
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE event_id = ? AND user_id = ?", [this.tabla, req.params.id, req.params.user_id]);
        return results;
    }
    async modifyAssitanceByIdAsAuthenticated(assistance, user_id, id){
        await global.connection.promise().query("UPDATE ?? SET user_id = ?, event_id = ?, puntuation = ?, comentary = ? "+
        "WHERE user_id = ? AND event_id = ?", 
        [this.tabla, assistance.user_id, assistance.event_id, assistance.puntuation, assistance.comentary, user_id, id ]);
    }
    async createAssistance(req){
        await global.connection.promise().query("INSERT INTO ?? (user_id, event_id) VALUES (?, ?)",[this.tabla, req.params.user_id, req.params.event_id]);
    }

    async addAssistance(req){
        await global.connection.promise().query("INSERT INTO ?? (user_id, event_id) VALUES (?, ?)",[this.tabla, req.params.user_id, req.params.id]);
    }
}

module.exports= AssistencesDAO;