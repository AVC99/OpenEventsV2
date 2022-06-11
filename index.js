require("dotenv").config();
const mysql = require('mysql2');
global.connection = mysql.createConnection(process.env.DATABASE_URL);
const express = require('express')
const morgan = require('morgan')
const helmet = require("helmet");

const app = express()
const port = 8080

// parses incoming requests with JSON
app.use(express.json()) // convierte el body (bytes) -> objeto json

// ROUTES 
const usersRoute = require('./routes/users.route');
const eventsRoute= require('./routes/events.route');
const friendsRoute= require('./routes/friends.route');
//const assistancesRoute= require('./routes/assistances_route');
//const messagesRoute= require('./routes/messages_route');

// logs requests to console
app.use(morgan('tiny'))
// sets security headers
app.use(helmet());



app.use("/users" , usersRoute);
app.use("/events", eventsRoute);
app.use("/friends", friendsRoute);
//app.use("/assistances", assistancesRoute);
//app.use("/messages", messagesRoute);




app.get('/', (req, res) => {
    res.send('Open Events API!')
})

app.get('*', (req, res) => {
    res.json({ error: "404"})
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})