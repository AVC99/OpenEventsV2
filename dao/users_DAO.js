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

    
    async isExistingUser(email) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE email = ?" , [this.tabla, email])
        // checking if email is exactly the same as the one in the database
        if (results.length === 0) {
            return false;
        } else {
            return true;
        }
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

    //TODO: INSERT, UPDATE, DELETE

}

module.exports = UsersDAO;