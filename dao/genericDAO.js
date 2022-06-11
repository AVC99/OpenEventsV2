class GenericDAO {

    constructor(table) {
        this.tabla = table;
    }

    async getAll() {
        //select all form table
        const [results] = await global.connection.promise().query("SELECT * FROM ??", [this.tabla])
        return results;
    }

    async get(id) {
        // SELECT * FROM ?? WHERE id = 'params.id'
        const [results]= await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results;
    }

    async post(user) {
        // INSERT INTO ?? (??) values (??)
        const [results] = await global.connection.promise().query("INSERT INTO ?? ?? values ?", [this.tabla, Object.keys(user), Object.values(user)])
        if (results.affectedRows === 0) {
            return next (new Error('Could not insert user'));
        }
        return results;
    }

    async update(id, data) {
        // UPDATE ?? SET ?? = ? WHERE id = ?
        const [results] = await global.connection.promise().query("UPDATE ?? SET ?? = ? WHERE id = ?", [this.tabla, data.name, data.value, id])
        return results;
    }

    async delete(id) {
        // DELETE FROM ?? WHERE id = ?
        const [results] = await global.connection.promise().query("DELETE FROM ?? WHERE id = ?", [this.tabla, id])
        if (results.affectedRows === 0) {
            return next (new Error("Could not delete user"));
        }
        return results;
    }

    async isValidToken(req) {
        if (!req.headers.authorization) {
            console.log("No token");
            return false;
        }
        const token = req.headers['authorization'].split(' ')[1]
        const jwt = require('jsonwebtoken')
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            let user = await this.get(decoded.id);
            return user.length !== 0;
        }
        catch (error) {
            return false
        }
    }

    getToken(req){
        if (!req.headers.authorization) {
            console.log("No token");
            return false;
        }
        const token = req.headers.authorization.split(" ")[1];
        return token;
    }

    getIdFromDecodedToken(req){
        const token = req.headers['authorization'].split(' ')[1]

        const jwt = require('jsonwebtoken')
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            return decoded.id;
        } catch (error) {
            return false
        }
    }

}

module.exports = GenericDAO