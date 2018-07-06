require('dotenv').config()

const express = require('express')
const app = express()
const morgan = require('morgan')

const Scheduler = require('./models/scheduler');
const Employee = require('./models/employee');

const scheduler = new Scheduler();
// Create schedules asynchronously when the server starts.
scheduler.createSchedules();

process.env.NODE_ENV === "development" ? app.use(morgan('dev')) : app.use(morgan('combined'))

app.get('/api/shifts', (req, res) => {
  if (req.query.employeeId) {
    // If the requested URL is in the form of /shifts?employeeId=, 
    // send back schedules specific to the requested employee.
    const employee = new Employee(parseInt(req.query.employeeId));
    res.json(employee.retrieveShifts(scheduler.getSchedules()));
  }
  else { // Otherwise, we'll get schedules for all employees.
    res.json(scheduler.getSchedules());
  }
});

app.listen(process.env.PORT);