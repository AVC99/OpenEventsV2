const req = require('express')
const jwt = require('jsonwebtoken')
const router = req.Router()

const EventsDAO = require("../DAO/events_DAO.js");
const eventsDAO = new EventsDAO();
const UsersDAO = require("../DAO/users_DAO.js");
const usersDAO = new UsersDAO();
const AssistenceDAO= require("../DAO/assistences_DAO.js");
const assistenceDAO = new AssistenceDAO();
const validator = require("../validator.js");

//TODO AUTHORIZATION SHENENIGANS

router.post('/', async (req, res) => {
    if (await eventsDAO.isValidToken(req)) {
        let token = eventsDAO.getToken(req);
        console.log(token);
        let decodedToken = jwt.verify(token, process.env.JWT_KEY);
        let ownerId = decodedToken.id;

        //get the current date 
        let date = new Date();

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
        console.log(event);
        const isCorrectStartDate = validator(event.eventStart_date);
        const isCorrectEndDate = validator(event.eventEnd_date);

        if (event.name === undefined || event.image === undefined || event.location === undefined || event.description === undefined
            || event.eventStart_date === undefined || event.eventEnd_date === undefined || event.n_participators === undefined || event.type === undefined) {
            res.status(400).send("All the fields are required")
        }

        if (isCorrectStartDate && isCorrectEndDate) {
            {
                try {
                    await eventsDAO.insertEvent(event);
                    res.status(200).json(event);

                } catch (error) {
                    res.status(500).send("Error geting the events");
                }
            }

            //TODO error handling

        }
        res.status(401).send("Unauthorized");
    }
})

router.put('/:id', async (req, res) => {

    if (await eventsDAO.isValidToken(req)) {

        if (!isNaN(req.params.id)) {
            console.log("entro");
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
                    return res.status(200).send(event);
                }

            } catch (error) {
                res.status(500).send("Error updating the event");
            }


        }
    }
    res.status(401).send("Unauthorized");
})



router.delete('/:id', async (req, res) => {
    if (await eventsDAO.isValidToken(req)) {
        if (!isNaN(req.params.id)) {
            let eventId = req.params.id;
            try {
                let event = await eventsDAO.getEventById(eventId);
                if (event) {
                    await eventsDAO.deleteEvent(eventId);
                    return res.status(200).send("Event deleted" + event);
                }
                return res.status(200).send("Event not found");
            } catch (error) {
                res.status(500).send("Error deleting the event");
            }
        }
    } res.status(401).send("Unauthorized");
})

router.get('/best', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {

        let currentDate = new Date();
        try {
            let events = await eventsDAO.getFutureEvents();
            //TODO que puto follon lo de ordenar por puntuacion del usuario idea subconsulta 
            //check if there are events
            if (events.length === 0) {
                res.status(404).send("No future events found")
            }
            //return events
            res.status(200).json(events);
        } catch (error) {
            //return error
            res.status(500).send("Error getting events best");
        }
    }
})

router.get('/search', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let { location = '', date = '', keyword = '' } = req.query;
        console.log(location);
        try {
            let events = await eventsDAO.getAll();
            if (events.length === 0) {
                return res.status(404).send("No events found")
            }
            console.log(events)

            events= events.filter(event => {
                if(event.name.toLowerCase().includes(keyword.toLowerCase())){
                    if(event.location.toLowerCase().includes(location.toLowerCase())){
                       
                        let eventStart= new Date(event.eventStart_date).toISOString().split('T')[0];
                        
                        return eventStart.includes(date);
                    }
                }
            })
            return res.status(200).json(events);
        } catch (error) {
            res.status(500).send("Error getting events search");
        }

    }res.status(401).send("Unauthorized");
})

/**
 * @api {get} /events/:id Get event by id
 */
router.get('/:id', async (req, res) => {
    let id = req.params.id;
    if (!isNaN(id)) {
        try {
            let event = await eventsDAO.getEventById(id);
            //check if there is an event
            if (event.length === 0) {
                res.status(404).send("No event found with : id = " + id)
            }
            //return event
            res.status(200).json(event);
        } catch (error) {
            //return error
            res.status(500).send("Error getting event with : id" + id);
        }
    } else {
        res.status(400).send("Invalid id");
    }
})

router.get('/:id/assistences', async (req, res) => {
    if (eventsDAO.isValidToken(req)) {
        let id = req.params.id;
        if (!isNaN(id)) {
            try {
                let event = await eventsDAO.getEventById(id);
                //check if there is an event
                if (event.length === 0) {
                    res.status(404).send("No event found with : id = " + id)
                }
                //return event
                res.status(200).json(event);
            } catch (error) {
                //return error
                res.status(500).send("Error getting event with : id" + id);
            }
        } else {
            res.status(400).send("Invalid id");
        }
    }
})

router.delete('/:id/assistances',async(req,res)=>{
    if (eventsDAO.isValidToken(req)) {
        let id= req.params.id;
        if (!isNaN(id)) {
            try {
                let user_id= eventsDAO.getIdFromDecodedToken(req);
                await assistenceDAO.deleteAssistanceFromEvent(id,user_id);
                //return event
                return res.status(200).send("Assistance deleted");
            } catch (error) {
                //return error
                console.log(error);
                return res.status(500).send("Error getting event with : id" + id);
            }

        }

    }
    res.status(401).send("Unauthorized");
})



router.get('/', async (req, res) => {
    try {
        console.log("get all events");
        const events = await eventsDAO.getAll();
        //check if there are events
        if (events.length === 0) {
            res.status(404).send("No events found")
        }
        //return events
        res.status(200).json(events);
    } catch (error) {
        //return error
        res.status(500).send("Error getting events");
    }

})


module.exports = router;