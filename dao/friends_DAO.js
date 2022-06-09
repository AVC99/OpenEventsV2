const GenericDAO= require('../dao/genericDAO');

class FriendsDAO extends GenericDAO {
    constructor() {
        super('friends');
    }

    async getByFirstId(id) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE user_id = ?", [this.tabla, id])
        return results;
    }

    async getBySecondID(id) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE user_id_friend = ?", [this.tabla, id])
        return results;
    }

    async getStatusByFirstID(id) {
        const [results] = await global.connection.promise.query("SELECT status FROM ?? WHERE user_id = ?", [this.tabla, email])
        return results;
    }
    async getStatusBySecondID(id) {
        const [results] = await global.connection.promise.query("SELECT status FROM ?? WHERE user_id_friend = ?", [this.tabla, email])
        return results;
    }

    async getStatusByFirstIDAndSecondID(id, idFriend) {
        const [results] = await global.connection.promise.query("SELECT status FROM ?? WHERE user_id = ? AND user_id_friend = ?", [this.tabla, id, idFriend])
        return results;
    }
    //TODO: INSERT, UPDATE, DELETE
    
}

module.exports = FriendsDAO;