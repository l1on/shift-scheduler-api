module.exports = Object.freeze({
    WEEK_DAYS: [1,2,3,4,5,6,7],
    JUNE_WEEKS: [23, 24, 25, 26],
    SHIFT_RULE_ID: 7,
    MIN_SHIFT_RULE_ID: 4,
    MAX_SHIFT_RULE_ID: 2,
    DEFAULT_MIN_SHIFTS: 0,
    DEFAULT_MAX_SHIFTS: 7,

    EMPLOYEES_URL: `http://${process.env.ADMIN_SERVICE_NAME}/api/admin/employees`, 
    RULES_URL: `http://${process.env.ADMIN_SERVICE_NAME}/api/admin/shift-rules`, 
    TIMEOFFS_URL: `http://${process.env.ADMIN_SERVICE_NAME}/api/admin/time-offs` 
});