const GenericDAO= require('../dao/genericDAO');

class UsersDAO extends GenericDAO {
    constructor() {
        super('users');
    }

    async getUserByEmail(email) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE email = ?", [this.tabla, email])
        return results[0];
    }

    async getUserById(id) {
        const [results] = await global.connection.promise().query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id])
        return results[0];
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

    async updateUser(user){
        await global.connection.promise().query("UPDATE ?? SET name = ?, last_name = ?, email = ?, password = ?, image = ? WHERE id = ?",
        [this.tabla, user.name, user.last_name, user.email, user.password, user.image, user.id]) // updating the user       
    }

    // get average of the ratings of a user in assistance table
    async getUserStatisticsNumComments(id) {
        const [results] = await global.connection.promise()
            .query("SELECT COUNT(*) as num_comments FROM assistance WHERE user_id = ? AND comentary IS NOT NULL",
            [id])

        return results;
    }

    // get average of the ratings of a user in assistance table
    async getUserStatisticsAvgScore(id) {
        const [results] = await global.connection.promise()
            .query("SELECT ROUND(AVG(puntuation), 2) as avg_score FROM assistance WHERE user_id = ?", [id])

        return results;
    }
    async getUserStatisticsAvgScoreOfOldEvents(user_id, event_id) {
        const [results] = await global.connection.promise()
            .query("SELECT AVG(a.puntuation)FROM assistance AS a, events AS e WHERE a.user_id = ? AND e.id = ? AND "+
            " e.eventEnd_date < NOW()", 
            [user_id, event_id])
        return results;
    }

    // get the percentage of users with less comments than the user
    async getUserStatisticsPercentageComments(id) {
        // get of all the users
        this.num_users = await this.getAll();
        let numberOfCommenterBelow = 0;

        let num_comments = await this.getUserStatisticsNumComments(id);

        for (const user of this.num_users) {
            if (user.id !== id) {
                const [results] = await global.connection.promise()
                    .query(`SELECT COUNT(*) AS num_comments FROM assistance WHERE user_id = ${user.id} AND comentary IS NOT NULL`)
                let numOtherUserComments = results[0]

                if (num_comments[0].num_comments > numOtherUserComments['num_comments']) {
                    numberOfCommenterBelow++;
                }
            }
        }
        return (numberOfCommenterBelow * 100) / this.num_users.length
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
        .query("SELECT * FROM ?? WHERE id = (SELECT user_id_friend FROM friends WHERE user_id = ? AND status = 1)", [this.tabla, id])

        return results;
    }

    async deleteUser(id) {
        const [results] = await global.connection.promise()
        .query("DELETE FROM ?? WHERE id = ?", [this.tabla, id])

        return results;
    }

    async getUserAssistanceEvents(id) {
        const [results] = await global.connection.promise()
        .query("SELECT e.* FROM events AS e, assistance as a WHERE e.id = a.event_id AND a.user_id = ?;", [id])

        return results;
    }

    async getUserFutureAssistanceEvents(id) {
        const [results] = await global.connection.promise()
        .query("SELECT e.* FROM events AS e, assistance as a WHERE e.id = a.event_id AND a.user_id = ? AND e.eventStart_date > NOW();", [id])

        return results;
    }

    async getUserPastAssistanceEvents(id) {
        const [results] = await global.connection.promise()
        .query("SELECT e.* FROM events AS e, assistance as a WHERE e.id = a.event_id AND a.user_id = ? AND e.eventEnd_date < NOW();", [id])

        return results;
    }

    async getUserAssistanceComments(id) {
        const [results] = await global.connection.promise()
        .query("SELECT puntuation, comentary from assistance WHERE user_id = ?", [id])

        return results;
    }

    async getUserAssistanceCommentsByEvent(id) {
        const [results] = await global.connection.promise()
        .query("SELECT puntuation, comentary from assistance WHERE event_id = ?", [id])

        return results;
    }
}

module.exports = UsersDAO;