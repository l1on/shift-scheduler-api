module.exports = Object.freeze({
    WEEK_DAYS: [1,2,3,4,5,6,7],
    JUNE_WEEKS: [23, 24, 25, 26],
    SHIFT_RULE_ID: 7,
    MIN_SHIFT_RULE_ID: 4,
    MAX_SHIFT_RULE_ID: 2,
    DEFAULT_MIN_SHIFTS: 0,
    DEFAULT_MAX_SHIFTS: 7,

    EMPLOYEES_URL: 'http://interviewtest.replicon.com/employees', // example: [{"id":1,"name":"Lanny McDonald"},{"id":2,"name":"Allen Pitts"},{"id":3,"name":"Gary Roberts"},{"id":4,"name":"Dave Sapunjis"},{"id":5,"name":"Mike Vernon"}]
    RULES_URL: 'http://interviewtest.replicon.com/shift-rules', // example: [{"rule_id":4,"employee_id":1,"value":3},{"rule_id":4,"employee_id":2,"value":5},{"rule_id":2,"employee_id":1,"value":5},{"rule_id":2,"employee_id":2,"value":5},{"rule_id":2,"value":6},{"rule_id":4,"value":2},{"rule_id":7,"value":2}]
    TIMEOFFS_URL: 'http://interviewtest.replicon.com/time-off/requests' // example: [{"employee_id":1,"week":23,"days":[1,2,3]},{"employee_id":2,"week":23,"days":[5,6,7]},{"employee_id":3,"week":23,"days":[6,7]},{"employee_id":4,"week":24,"days":[3,4]},{"employee_id":5,"week":24,"days":[5,6,7]},{"employee_id":4,"week":24,"days":[1]},{"employee_id":1,"week":25,"days":[1,2,3]},{"employee_id":1,"week":25,"days":[7]},{"employee_id":4,"week":25,"days":[5,6,7]},{"employee_id":3,"week":25,"days":[6,7]},{"employee_id":5,"week":26,"days":[1,2,3]},{"employee_id":2,"week":26,"days":[3,4]},{"employee_id":4,"week":26,"days":[1,2,3,4]},{"employee_id":2,"week":26,"days":[1]}]
});