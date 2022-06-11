const GenericDAO= require('../dao/genericDAO');

class AssistencesDAO extends GenericDAO {
    constructor() {
        super('assistance');
    }

    async deleteAssistanceFromEvent(id, user_id){
        await global.connection.promise().query("DELETE FROM ?? WHERE event_id = ? AND user_id = ?", [this.tabla, id, user_id]);
    }
}

module.exports= AssistencesDAO;