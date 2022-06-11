const GenericDAO= require('../dao/genericDAO');

class FriendsDAO extends GenericDAO {
    constructor() {
        super('friends');
    }

    async getAllFriendsByUserId(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM users WHERE id = (SELECT user_id_friend FROM ?? WHERE user_id = ? AND status = 1)", [this.tabla, id])
        return results;
    }

    async createFriendRequest(id, idFriend) {
        const [results] = await global.connection.promise()
        .query("INSERT INTO ?? (user_id, user_id_friend, status) VALUES (?, ?, ?)",
        [this.tabla, id, idFriend, 0])

        return results;
    }

    async getAllFriendRequestsByUserId(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM users WHERE id = (SELECT user_id_friend FROM ?? WHERE user_id = ? AND status = 0)", [this.tabla, id])
        return results;
    }

    async acceptFriendRequest(id, idFriend) {
        const [results] = await global.connection.promise()
        .query("UPDATE ?? SET status = 1 WHERE user_id = ? AND user_id_friend = ?",
        [this.tabla, idFriend, id])

        return results;
    }

    async insertAcceptedFriend(id, idFriend) {
        const [results] = await global.connection.promise()
        .query("INSERT INTO ?? (user_id, user_id_friend, status) VALUES (?, ?, ?)",
        [this.tabla, id, idFriend, 1])

        return results;
    }

    async declineFriendRequest(id, idFriend) {
        const [results] = await global.connection.promise()
        .query("DELETE FROM ?? WHERE user_id = ? AND user_id_friend = ?",
        [this.tabla, idFriend, id])

        return results;
    }
}

module.exports = FriendsDAO;