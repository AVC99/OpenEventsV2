const GenericDAO= require('../dao/genericDAO');

class MessagesDAO extends GenericDAO {
    constructor () {
      super('message');
    }

    // POST of a message between two users via body (content, sender_id, receiver_id)
    async postMessage(message) {
        const [results] = await global.connection.promise()
        .query("INSERT INTO ?? (content, user_id_send, user_id_recived, timeStamp) VALUES (?, ?, ?, NOW())",
        [this.tabla, message.content, message.user_id_send, message.user_id_recived])

        return results;
    }

    async getUsersMessaging (id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM users WHERE id = (SELECT user_id_send FROM ?? WHERE user_id_recived = ?)", [this.tabla, id])

        return results;
    }
    async getMessagesBetweenAuthenticatedUserAndUser(user_id, id) {
        const [results] = await global.connection.promise()
        .query("SELECT * FROM ?? WHERE (user_id_send = ? AND user_id_recived = ?) OR (user_id_send = ? AND user_id_recived = ?)", [this.tabla,user_id, id, id, user_id])

        return results;
    }
}

module.exports = MessagesDAO;