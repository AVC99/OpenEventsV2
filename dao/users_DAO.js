const GenericDAO= require('../dao/genericDAO');

class UsersDAO extends GenericDAO {
    constructor() {
        super('users');
    }

    async getUserByEmail(email) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE email = ?", [this.tabla, email])
        return results;
    }

    async getUserById(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results;
    }

    async isExistingUser(email) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE email = ?" , [this.tabla, email])
        // checking if email is exactly the same as the one in the database
        return results.length !== 0;
    }

    async getUserByKeyWord(keyWord) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE name LIKE ? OR last_name LIKE ? OR email LIKE ?" , 
        [this.tabla, "%" + keyWord + "%", "%" + keyWord + "%", "%" + keyWord + "%"])
        return results;
    }

    // get average of the ratings of a user in assistance table
    async getUserStatistics(id) {
        /* 💢💢💢💢 */ 
            TODO
        /* 💢💢💢💢 */
    }
    
    async createUser(user) {

        const [results] = await global.connection.promise()
        .query("INSERT INTO ?? (name, last_name, email, password, image) VALUES (?, ?, ?, ?, ?)",
        [this.tabla, user.name, user.last_name, user.email, user.password, user.image])

        return results;
    }

    async getUserEvents (id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM events WHERE owner_id = ?", [id])

        return results;
    }

    async getUserFutureEvents (id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM events WHERE owner_id = ? AND eventStart_date > NOW()", [id])

        return results;
    }

    async getUserPastEvents (id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM events WHERE owner_id = ? AND eventEnd_date < NOW()", [id])

        return results;
    }

    async getUserCurrentEvents (id) {
        const [results] = await global.connection.promise()
          .query("SELECT * FROM events WHERE owner_id = ? AND eventStart_date < NOW() AND eventEnd_date > NOW()", [id])

        return results;
    }

    async getUserFriends (id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM users WHERE id = (SELECT user_id_friend FROM friends WHERE user_id = ? AND status = 1)", [id])

        return results;
    }
}

module.exports = UsersDAO;