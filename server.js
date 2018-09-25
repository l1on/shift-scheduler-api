require('dotenv').config()

const http = require('http');
const express = require('express')
const app = express()
const morgan = require('morgan')
const terminus = require('@godaddy/terminus');

const Scheduler = require('./models/scheduler');
const Employee = require('./models/employee');

const scheduler = new Scheduler();

process.env.NODE_ENV === "development" ? app.use(morgan('dev')) : app.use(morgan('combined'))

app.get('/shifts', async (req, res) => {
  const schedules = await scheduler.createSchedules();
  if (req.query.employeeId) {
    // If the requested URL is in the form of /shifts?employeeId=, 
    // send back schedules specific to the requested employee.
    const employee = new Employee(parseInt(req.query.employeeId));
    res.json(employee.retrieveShifts(schedules));
  }
  else { // Otherwise, we'll get schedules for all employees.
    res.json(schedules);
  }
});

const server = http.createServer(app);

terminus(server, {
  healthChecks: {
   '/healthcheck': async () => {
     return Promise.resolve()
   },
 },
})

server.listen(process.env.PORT);