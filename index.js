require("dotenv").config();
const mysql = require('mysql2');
const connection = mysql.createConnection(process.env.DATABASE_URL);
const express = require('express')
const morgan = require('morgan')
const helmet = require("helmet");
const app = express()
console.log('Connected to PlanetScale!');
const port = 8080
app.use(express.json()) // convierte el body (bytes) -> objeto json


/*const usersRoute = require('./routes/users_route');
const eventsRoute= require('./routes/events_route');
const friendsRoute= require('./routes/friends_route');
const assistancesRoute= require('./routes/assistances_route');
const messagesRoute= require('./routes/messages_route');

app.use("/users" , usersRoute);
app.use("/events", eventsRoute);
app.use("/friends", friendsRoute);
app.use("/assistances", assistancesRoute);
app.use("/messages", messagesRoute);*/



app.use(morgan('tiny'))
app.use(helmet());



app.get('/hi', (req, res) => {
    res.status(200).send({
        message: 'Hi there!'
    })

})
app.post('/hi/:id', (req, res) => {
    const id = req.params.id;
    const userid = req.body;

    if(!userid){
        res.status(418).send({message: 'No userid'})
    }

    res.send({message: `Hi ${id}!`})
})

app.get('*', (req, res) => {
    res.json({ error: "404"})
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})