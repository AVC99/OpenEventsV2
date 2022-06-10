const req = require('express')
const jwt = require('jsonwebtoken')
const router = req.Router()

const EventsDAO = require("../DAO/events_DAO.js");
const eventsDAO = new EventsDAO();
const UsersDAO = require("../DAO/users_DAO.js");
const usersDAO = new UsersDAO();
const validator= require("../validator.js");

//TODO AUTHORIZATION SHENENIGANS

router.post('/', async (req, res) => {
    if (eventsDAO.isValidToken(req)){

        let token = eventsDAO.getToken(req);
        console.log(token);
        let decodedToken = jwt.verify(token, process.env.JWT_KEY);
        let ownerId= decodedToken.id;

        //get the current date 
        let date = new Date();

        let event = {
            name: req.params.name,
            image: req.params.image,
            location: req.params.location,
            description: req.params.description,
            eventStart_date: req.params.eventStart_date,
            eventEnd_date: req.params.eventEnd_date,
            n_participators: req.params.n_participators,
            type: req.params.type,
            owner_id: ownerId,
            date: date
        }
        const isCorrectStartDate = validator(event.eventStart_date);
        try{
            await eventsDAO.insertEvent(event);
        }catch(error){
            res.status(500).send("Error geting the events");
        }
        
        

        //TODO error handling
        if (event.name === undefined || event.image === undefined || event.location === undefined || event.description === undefined
            || event.eventStart_date === undefined || event.eventEnd_date === undefined || event.n_participators === undefined || event.type === undefined) {
            res.status(400).send("All the fields are required")
        }
        //TODO put event on the database
        res.status(200).json(event);
    }
   

})

router.get('/best', async (req, res) => {
    let currentDate = new Date();
    console.log(req.headers.authorization.split(" ")[1]);
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

router.get('/:id/assistences',async(req, res)=>{
    if(eventsDAO.isValidToken(req)){
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