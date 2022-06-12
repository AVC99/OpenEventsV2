const req = require('express')
const jwt = require('jsonwebtoken')
const router = req.Router()
const serverStatus= require('../server_status');

const EventsDAO = require("../DAO/events_DAO.js");
const eventsDAO = new EventsDAO();
const UsersDAO = require("../DAO/users_DAO.js");
const usersDAO = new UsersDAO();
const AssistenceDAO = require("../DAO/assistences_DAO.js");
const assistenceDAO = new AssistenceDAO();
const validator = require("../validator.js");


/**
 * Creates event
 */
router.post('/', async (req, res) => {
    if (await eventsDAO.isValidToken(req)) {
        let token = eventsDAO.getToken(req);
        let decodedToken = jwt.verify(token, process.env.JWT_KEY);
        let ownerId = decodedToken.id;
        
        let {name, owner_id, date, image, location, description, eventStart_date, eventEnd_date} = req.body;
        //get the current date 
         date = new Date();

        let event = {
            name: req.body.name,
            owner_id: ownerId,
            date: date,
            image: req.body.image,
            location: req.body.location,
            description: req.body.description,
            eventStart_date: req.body.eventStart_date,
            eventEnd_date: req.body.eventEnd_date,
            n_participators: req.body.n_participators,
            type: req.body.type
        }
        const isCorrectStartDate = validator(event.eventStart_date);
        const isCorrectEndDate = validator(event.eventEnd_date);

        if (event.name === undefined || event.image === undefined || event.location === undefined || event.description === undefined
            || event.eventStart_date === undefined || event.eventEnd_date === undefined || event.n_participators === undefined || event.type === undefined) {
            return res.status(serverStatus.BAD_REQUEST).send("All the fields are required")
        }

        if (isCorrectStartDate && isCorrectEndDate) {
            {
                try {
                    await eventsDAO.insertEvent(event);
                    return res.status(serverStatus.OK).json(event);

                } catch (error) {
                    return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error geting the events");
                }
            }


        }
        return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
    }
})
/**
 * Edits assistance of authenticated user for the event with matching id
 * @param {number} id - id of the event and authenticated user
 */
router.put('/:id/assistances', async (req, res) => {
    if (await eventsDAO.isValidToken(req)) {
        if (!isNaN(req.params.id)) {

            try {
                let user_id = usersDAO.getIdFromDecodedToken(req);
                let assistance= await assistenceDAO.getAssistancesByEventAndOwnerID(req.params.id, user_id);
                if (assistance) {
                    if (req.body.user_id) assistance.user_id = req.body.user_id;
                    if (req.body.event_id) assistance.event_id = req.body.event_id;
                    if (req.body.puntuation) assistance.puntuation = req.body.puntuation;
                    if (req.body.comentary) assistance.comentary = req.body.comentary;

                    await assistenceDAO.modifyAssitanceByIdAsAuthenticated(assistance,user_id, req.params.id); 
                    return res.status(serverStatus.OK).send(assistance);
                }
                return res.status(serverStatus.CREATED).send("Assistance not found");
            
                
            } catch (error) {
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error updating the event");
            }
        }
    } return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})
/**
 *  Edits specified fields of the event with matching id
 *  @param {number} id - id of the event and the authorization token
 */
router.put('/:id', async (req, res) => {

    if (await eventsDAO.isValidToken(req)) {

        if (!isNaN(req.params.id)) {
            let eventId = req.params.id;
            try {
                let event = await eventsDAO.getEventById(eventId);
                if (event) {
                    if (req.body.name) event.name = req.body.name
                    if (req.body.image) event.image = req.body.image
                    if (req.body.location) event.location = req.body.location
                    if (req.body.description) event.description = req.body.description
                    if (req.body.eventStart_date) event.eventStart_date = req.body.eventStart_date
                    if (req.body.eventEnd_date) event.eventEnd_date = req.body.eventEnd_date
                    if (req.body.n_participators) event.n_participators = req.body.n_participators
                    if (req.body.type) event.type = req.body.type
                    await eventsDAO.updateEvent(event);
                    return res.status(serverStatus.OK).send(event);
                }

            } catch (error) {
                res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error updating the event");
            }


        }
    }
    res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Deletes event with matching id
 * @param {number} id - id of the event and the authorization token
 */
router.delete('/:id', async (req, res) => {
    if (await eventsDAO.isValidToken(req)) {
        if (!isNaN(req.params.id)) {
            let eventId = req.params.id;
            try {
                let event = await eventsDAO.getEventById(eventId);
                if (event) {
                    await eventsDAO.deleteEvent(eventId);
                    return res.status(serverStatus.OK).json({message: event.id + " has been deleted"});
                }
                return res.status(serverStatus.OK).send("Event not found");
            } catch (error) {
                res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error deleting the event");
            }
        }
    } res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets all future events in descending order based on the average score of the creator's old events
 * @param {*} req with authorization token
 */
router.get('/best', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        try {
           let bestOldEventOwners = await eventsDAO.getBestEvents();
            let futureEvents= await eventsDAO.getFutureEvents();
            let bestEvents = [];

            for (const event of futureEvents) {
                for (const owner of bestOldEventOwners) {
                    if (event.owner_id === owner.owner_id ) {
                        bestEvents.push(event);
                    }
                }
            }
            return res.status(serverStatus.OK).send(bestEvents) 
        }catch(error){
            return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting the users");
        }
    }
    res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Searches events with location, keyword in name, or date containing or matching the values of the query
 * parameters.
 * @param {*} req with authorization token
 */
router.get('/search', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let { location = '', date = '', keyword = '' } = req.query;
        try {
            let events = await eventsDAO.getAll();
            if (events.length === 0) {
                return res.status(serverStatus.NOT_FOUND).send("No events found")
            }
            events = events.filter(event => {
                if (event.name.toLowerCase().includes(keyword.toLowerCase())) {
                    if (event.location.toLowerCase().includes(location.toLowerCase())) {

                        let eventStart = new Date(event.eventStart_date).toISOString().split('T')[0];

                        return eventStart.includes(date);
                    }
                }
            })
            return res.status(serverStatus.OK).json(events);
        } catch (error) {
            res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting events search");
        }

    } res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets event by id
 * @param {*} req with authorization token
 */
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    if (!isNaN(id)) {
        try {
            let event = await eventsDAO.getEventById(id);
            //check if there is an event
            if (!event) {
                res.status(serverStatus.NOT_FOUND).send("No event found with : id = " + id)
            }
            //return event
            res.status(serverStatus.OK).json(event);
        } catch (error) {
            //return error
            res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting event with : id" + id);
        }
    } else {
        res.status(serverStatus.BAD_REQUEST).send("Invalid id");
    }
})
/**
 * Gets all assistances for event with matching id
 * @param {*} req with authorization token and event id
 */
router.get('/:id/assistances', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let id = req.params.id;
        if (!isNaN(id)) {
            try {
                let assistance = await assistenceDAO.getAssistancesByEventID(id);
                //check if there is an event
                if (assistance.length === 0) {
                    res.status(serverStatus.NOT_FOUND).send("No event found with : id = " + id)
                }
                //return event
                res.status(serverStatus.OK).json(assistance);
            } catch (error) {
                //return error
                res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting event with : id" + id);
            }
        } else {
            res.status(serverStatus.BAD_REQUEST).send("Invalid id");
        }
    }
})
/**
 * Deletes assistance of authenticated user for event with matching id
 * @param {*} req with authorization token and event id
 */
router.delete('/:id/assistances', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let id = req.params.id;
        if (!isNaN(id)) {
            try {
                let user_id = eventsDAO.getIdFromDecodedToken(req);
                let assistance = await assistenceDAO.getAssistencesByAuthUserIdEventId(user_id, id);
                if (assistance.length!==0){
                    await assistenceDAO.deleteAssistanceFromEvent(id, user_id);
                    //return event
                    return res.status(serverStatus.OK).send("Assistance deleted");
                }

                return res.status(serverStatus.CREATED).send("Assistance not found");
               
            } catch (error) {
                //return error
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting event with : id" + id);
            }

        }

    }
    res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets assistance of user with matching id for event with matching id
 * @param {*} req with authorization token and event id and user id
 */
router.get('/:id/assistances/:user_id', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let id = req.params.id;
        let user_id = req.params.user_id;

        if (!isNaN(id) && !isNaN(user_id)) {
            try {
                let event = await assistenceDAO.getAssistencesByEventIdUserId(req);
                //check if there is an event
                if (event.length === 0) {
                    return res.status(serverStatus.NOT_FOUND).send("No event found with : id = " + id)
                }
                //return event
               return  res.status(serverStatus.OK).json(event);
            } catch (error) {
                //return error
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting event with : id" + id);
            }
        } else {
            return res.status(serverStatus.BAD_REQUEST).send("Invalid id");
        }
    }
    return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");

})
/**
 * Creates assistance of authenticated user for event with matching id
 * @param {*} req with authorization token and event id
 */
router.post('/:id/assistances', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let id = await assistenceDAO.getIdFromDecodedToken(req);
        let user_id = req.params.user_id;

        if (!isNaN(id) && !isNaN(user_id)) {
            try {
                let assistance = await assistenceDAO.getAssistencesByEventIdUserId(event_id, user_id);
                //check if there is an event
                if (assistance.length === 0) {
                   await assistenceDAO.addAssistance(req);
                   return res.status(serverStatus.OK).send("Assistance created");
                }
                //return event
             return res.status(serverStatus.CREATED).send("Assistance was already added");
            } catch (error) {
                //return error
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting event with : id" + id);
            }
        } else {
            return res.status(serverStatus.BAD_REQUEST).send("Invalid id");
        }
    }
    res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})  

/**
 * Gets all future events
 * @param {Object} req with authorization token
 */
router.get('/', async (req, res) => {
    try {
        const events = await eventsDAO.getAll();
        //check if there are events
        if (events.length === 0) {
            return res.status(serverStatus.NOT_FOUND).send("No events found")
        }
        //return events
       return  res.status(serverStatus.OK).json(events);
    } catch (error) {
        //return error
        return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error getting events");
    }

})


module.exports = router;