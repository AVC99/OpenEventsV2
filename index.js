require("dotenv").config();
const mysql = require('mysql2');
const express = require('express')
const morgan = require('morgan')
const helmet = require("helmet");


try {
    global.connection = mysql.createConnection(process.env.DATABASE_URL);
}catch (error){
    console.log("Error al conectar a la base de datos");
}

const app = express()
const port = 8080

// parses incoming requests with JSON
app.use(express.json()) // convierte el body (bytes) -> objeto json

// ROUTES 
const usersRoute = require('./routes/users.route');
const eventsRoute= require('./routes/events.route');
const friendsRoute= require('./routes/friends.route');
const assistancesRoute= require('./routes/assistances.route');
const messagesRoute= require('./routes/messages.route');


// logs requests to console
app.use(morgan('tiny'));
// sets security headers
app.use(helmet());


app.use("/users" , usersRoute);
app.use("/events", eventsRoute);
app.use("/friends", friendsRoute);
app.use("/assistances", assistancesRoute);
app.use("/messages", messagesRoute);


app.get('/', (req, res) => {
    res.send('Open Events API!')
})

app.get('*', (req, res) => {
    res.json({ error: "serverStatus.NOT_FOUND"})
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})