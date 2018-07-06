const chai = require('chai');
const Scheduler = require('../../models/scheduler');

describe('Scheduler', () => {
    const scheduler = new Scheduler();

    describe('#generateSchedules()', () => {
        it("should return the correct schedule when the daysToFill is just one 7-day and the single employee is available all days", () => {
            daysToFill = [[1,2,3,4,5,6,7]];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,3,4,5,6,7
                ]}
            ]

            expectedResult = {
                remainingDaysToFill: [[]],
                schedules: [
                    {employee_id: 13, schedule: [1,2,3,4,5,6,7]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });

        it("should return the correct schedule when the daysToFill is just one 7-day and the single employee is available some days", () => {
            daysToFill = [[1,2,3,4,5,6,7]];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    4,3,6
                ]}
            ]

            expectedResult = {
                remainingDaysToFill: [[1,2,5,7]],
                schedules: [
                    {employee_id: 13, schedule: [4,3,6]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });

        it("should return the correct schedule  when the daysToFill is just one 7-day and the two employees combined are avaiable for all week", () => {
            daysToFill = [[1,2,3,4,5,6,7]];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,4,7
                ]},{
                employeeId: 5,
                availableDays: 
                    [5,3,6]
                }
            ]

            expectedResult = {
                remainingDaysToFill: [[]],
                schedules:[
                    {employee_id: 13, schedule: [1,2,4,7]},
                    {employee_id: 5, schedule: [5,3,6]}
                ]
            }

            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });

        it("should return the correct schedule  when the daysToFill is just one 7-day and the two employees combined are still not avaiable for all week", () => {
            daysToFill = [[1,2,3,4,5,6,7]];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,4,7
                ]},{
                employeeId: 5,
                availableDays: 
                    [1,3,6]
                }
            ]

            expectedResult = {
                remainingDaysToFill: [[5]],
                schedules:[
                    {employee_id: 13, schedule: [1,2,4,7]},
                    {employee_id: 5, schedule: [3,6]}
                ]
            }

            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });

        it("should return the correct schedule when the daysToFill is just 3* 7-day and only 1 employee is available all days", () => {
            daysToFill = [
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7]
            ];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,3,4,5,6,7
                ]},
            ]

            expectedResult = {
                remainingDaysToFill: [
                    [],
                    [1,2,3,4,5,6,7],
                    [1,2,3,4,5,6,7]
                ],
                schedules: [
                    {employee_id: 13, schedule: [1,2,3,4,5,6,7]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });  
        
        it("should return the correct schedule when the daysToFill is just 3* 7-day and three employees are available all days", () => {
            daysToFill = [
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7]
            ];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,3,4,5,6,7
                ]},{
                    employeeId: 3,
                    availableDays: [
                    1,2,3,4,5,6,7
                ]},{
                    employeeId: 1,
                    availableDays: [
                    1,2,3,4,5,6,7
                ]},
            ]

            expectedResult = {
                remainingDaysToFill: [
                    [],
                    [],
                    []
                ],
                schedules: [
                    {employee_id: 13, schedule: [1,2,3,4,5,6,7]},
                    {employee_id: 3, schedule: [1,2,3,4,5,6,7]},
                    {employee_id: 1, schedule: [1,2,3,4,5,6,7]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });   

        it("should return the correct schedule with a complicated case but fillable", () => {
            daysToFill = [
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7]
            ];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,4,3,5
                ]},{
                    employeeId: 3,
                    availableDays: [
                    1,2,6,7,4
                ]},{
                    employeeId: 1,
                    availableDays: [
                    2,3,4,5,6,7
                ]},
            ]

            expectedResult = {
                remainingDaysToFill: [
                    [],
                    []
                ],
                schedules: [
                    {employee_id: 13, schedule: [1,4,3,5]},
                    {employee_id: 3, schedule: [1,2,6,7,4]},
                    {employee_id: 1, schedule: [2,3,5,6,7]},
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });


        it("should return the correct schedule with a complicated case but unfillable", () => {
            daysToFill = [
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7]
            ];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,4,5
                ]},{
                    employeeId: 3,
                    availableDays: [
                    1,2,6,7,4
                ]},{
                    employeeId: 1,
                    availableDays: [
                    2,3,4,5,6,7
                ]},
            ]

            expectedResult = {
                remainingDaysToFill: [
                    [],
                    [3]
                ],
                schedules: [
                    {employee_id: 13, schedule: [1,4,5]},
                    {employee_id: 3, schedule: [1,2,6,7,4]},
                    {employee_id: 1, schedule: [2,3,5,6,7]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });

        it("should return the correct schedule with a complicated case but fillable with one employee nothing assigned", () => {
            daysToFill = [
                [1,2,3,4,5,6,7],
                [1,2,3,4,5,6,7]
            ];
            availableDaysFromEmployees = [{
                employeeId: 13,
                availableDays: [
                    1,2,3,4,5,6,7
                ]},{
                    employeeId: 3,
                    availableDays: [
                    1,2,3,4,5,6
                ]},{
                    employeeId: 1,
                    availableDays: [
                    1,2,3,4,5,6,7
                ]},
            ]

            expectedResult = {
                remainingDaysToFill: [
                    [],
                    []
                ],
                schedules: [
                    {employee_id: 13, schedule: [1,2,3,4,5,6,7]},
                    {employee_id: 3, schedule: [1,2,3,4,5,6]},
                    {employee_id: 1, schedule: [7]}
                ]
            }
               
            chai.assert.deepEqual(scheduler.generateSchedules(daysToFill, availableDaysFromEmployees, []), expectedResult);
        });
    });
    
    describe('#generateAvailableDays()', () => {
        it('should return the correct shifts when no restrictions', () => {
            minShifts = 0;
            maxShifts = 7;
            timeoffs = [];

            correctShifts = 
                [1, 2, 3, 4, 5, 6, 7]
            
            chai.assert.deepEqual(scheduler.generateAvailableDays(minShifts, maxShifts, timeoffs), correctShifts);
        });

        
        it('should return the correct shifts when the only restriction is timeoffs', () => {
            minShifts = 0;
            maxShifts = 7;
            timeoffs = [4, 7];

            correctShifts = 
                [1, 2, 3, 5, 6]
            
            
            chai.assert.deepEqual(scheduler.generateAvailableDays(minShifts, maxShifts, timeoffs), correctShifts);
        });
    });
});