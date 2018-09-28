require('dotenv').config()

const http = require('http');
const express = require('express')
const app = express()
const morgan = require('morgan')
const terminus = require('@godaddy/terminus');
const prometheus = require('prom-client');

const Scheduler = require('./models/scheduler');
const Employee = require('./models/employee');

process.env.NODE_ENV === "development" ? app.use(morgan('dev')) : app.use(morgan('combined'))

/**
 * Health check
 */
const server = http.createServer(app);
terminus(server, {
  healthChecks: {
   '/healthcheck': async () => {
     return Promise.resolve()
   },
 },
});

/**
 * Metrics endpoint
 */
app.get('/metrics', (req, res) => {
	res.set('Content-Type', prometheus.register.contentType);
	res.end(prometheus.register.metrics());
});

const histogram = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'measures how long a GET request takes',
  labelNames: ['method', 'handler']
});

const scheduler = new Scheduler();

app.get('/shifts', async (req, res) => {
  const end_timer = histogram.startTimer({method: 'GET', handler: '/shifts'});

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

  end_timer();
});

server.listen(process.env.PORT);
