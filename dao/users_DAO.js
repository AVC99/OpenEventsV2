const GenericDAO= require('../dao/genericDAO');

class UsersDAO extends GenericDAO {
    constructor() {
        super('users');
    }

    async getUserById(id) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results;
    }
    async getUserByEmail(email) {
        const [results] = await global.connection.promise.query("SELECT * FROM ?? WHERE email = ?", [this.tabla, email])
        return results;
    }
    //TODO: INSERT, UPDATE, DELETE

}

module.exports = UsersDAO;