const req = require('express')
const router = req.Router()

const EventsDAO = require("../DAO/events_DAO.js");
const eventsDAO = new EventsDAO();
const UsersDAO = require("../DAO/users_DAO.js");
const usersDAO = new UsersDAO();
const auth = null;
//TODO AUTHORIZATION SHENENIGANS

router.post('/', async (req, res) => {
    let ownerId = req.body.ownerId;
    //get the current date 
    let date = new Date();
    let event = {
        name: req.body.name,
        image: req.body.image,
        location: req.body.location,
        description: req.body.description,
        eventStart_date: req.body.eventStart_date,
        eventEnd_date: req.body.eventEnd_date,
        n_participators: req.body.n_participators,
        type: req.body.type,
        owner_id: ownerId,
        date: date
    }
    //TODO error handling
    if (event.name === undefined || event.image === undefined || event.location === undefined || event.description === undefined
        || event.eventStart_date === undefined || event.eventEnd_date === undefined || event.n_participators === undefined || event.type === undefined) {
        res.status(400).send("All the fields are required")
    }
    //TODO put event on the database
    res.status(200).json(event);

})


router.get('/best', async (req, res) => {
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
})
router.get('/search', async (req, res) => {
    const { location, keyword, date } = req.query;

    if (location !== undefined) {
       
        res.send("location stuff")
    }
    if (keyword !== undefined) {
        res.send("keyword stuff")
    }
    if (date !== undefined) {
        res.send("date stuff")
    }


})
/**
 * @api {get} /events/:id Get event by id
 */
router.get('/:id', async (req, res) => {
    let id = req.query.id;
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