const fetch = require('node-fetch');
const _ = require('lodash');
const constants = require('../lib/constants');

module.exports = class Scheduler {
    /**
     * This method returns a promise that will get resolved with all the conditions
     * to be met by the scheduler.
     */
    getConstraints() {
        const apis = [constants.EMPLOYEES_URL, constants.RULES_URL, constants.TIMEOFFS_URL];
        return Promise.all(apis.map(api => {
            return fetch(api)
            .then(res => res.json())
            .then(
                (result) => {return result;},
                (error) => {throw error;}
            )
        }));
    }

    /**
     * This method will feed all the conditions into the scheduling engine and
     * save the resulting schedules into a cache.
     */
    async createSchedules() {
        const [employees, rules, timeoffs] = await this.getConstraints();

        return this.createMonthlySchedules(employees.map(employee => employee.id), rules, timeoffs);
    }

    /**
     * This method will return schedules for a whole month. It relies on 
     * a helper method to generate weekly schedules.
     * @param {*} employeeIds 
     * @param {*} rules 
     * @param {*} timeoffs 
     */
    createMonthlySchedules(employeeIds, rules, timeoffs) {
        return constants.JUNE_WEEKS.map(week => {
            return {
                week: week,
                schedules: this.createWeeklySchedules(employeeIds, rules, timeoffs.filter(employeeTimeoffs => employeeTimeoffs.week === week))  
            }
        });
    }

    /**
     * This method gets employees available days and then feed them to 
     * a helper method with the EMPLOYEES_PER_SHIFT rule. It returns a weekly
     * schedule for all employees. 
     * @param {*} employeeIds 
     * @param {*} rules 
     * @param {*} timeoffs 
     */
    createWeeklySchedules(employeeIds, rules, timeoffs) {
        const availableDaysFromEmployees = employeeIds.map(employeeId => {
            const employeeTimeOffs = this.retrieveEmployeeTimeoffs(employeeId, timeoffs);
            const {minShifts, maxShifts} = this.retrieveEmployeeRules(employeeId, rules);

            return {
                employeeId: employeeId,
                availableDays: this.generateAvailableDays(minShifts, maxShifts, employeeTimeOffs)
            }
        });

        return this.makeSchedules(availableDaysFromEmployees, rules.find(rule => rule.rule_id === constants.SHIFT_RULE_ID).value);
    }

    /**
     * This helper returns employee specific timeoff requests.
     * @param {*} employeeId 
     * @param {*} timeoffs 
     */
    retrieveEmployeeTimeoffs(employeeId, timeoffs) {
        return timeoffs.filter(employeeTimeoffs => employeeTimeoffs.employee_id === employeeId).reduce((timeoffsSofar, timeoffs) => {
            return timeoffsSofar.concat(timeoffs.days)
        }, []);
    }

    /**
     * This helper returns MIN_SHITF and MAX_SHIFT rules applicable to an employee, 
     * taking into account both the personal and the corp rules.
     * @param {*} employeeId 
     * @param {*} rules 
     */
    retrieveEmployeeRules(employeeId, rules) {        
        const minRule = this.getRule(constants.MIN_SHIFT_RULE_ID, rules, employeeId);
        const maxRule = this.getRule(constants.MAX_SHIFT_RULE_ID, rules, employeeId);

        return {
            minShifts: minRule ? minRule.value : constants.DEFAULT_MIN_SHIFTS,
            maxShifts: maxRule ? maxRule.value : constants.DEFAULT_MAX_SHIFTS
        }
    }

    /**
     * A helper for returning either the corp or the personal rule.
     */
    getRule(ruleId, rules, employeeId) {
        const rule = rules.find(rule => rule.rule_id === ruleId && rule.employee_id === employeeId);
        if (rule) return rule;
        else return rules.find(rule => rule.rule_id === ruleId);
    }

    /**
     * This method returns all the weekly available days. Right now it only takes into account the time off requests.
     * @param {*} minShifts 
     * @param {*} maxShifts 
     * @param {*} timeoffs 
     */
    generateAvailableDays(minShifts, maxShifts, timeoffs) {  
        return constants.WEEK_DAYS.filter(day => timeoffs.find(timeoffDay => timeoffDay === day) === undefined);
    }

    /**
     * This method will first generate all the days that need to be filled, and then delegate to generateSchedules()
     * for actual schedule generation. Returns the generated schedule if all days are filled.If it cannot have all days filled, 
     * it will attemp to force-schedule unfulfilled days without regard to timeoff requests. If all the days are filled, it merges
     * the returned schedule with the previously generated schedule. Otherwise, throws an error. 
     * @param {*} availableDaysFromEmployees 
     * @param {*} employeesNumPerShift 
     */
    makeSchedules(availableDaysFromEmployees, employeesNumPerShift) {
        // Create an array of 7-integer arrays to model the multi-employee per shift requirement.
        const daysToFill = Array(employeesNumPerShift).fill().map((_) => constants.WEEK_DAYS);

        // Put employees with most available days first.
        availableDaysFromEmployees.sort((a, b) => a.availableDays.length < b.availableDays.length);

        const {remainingDaysToFill, schedules} = this.generateSchedules(daysToFill, availableDaysFromEmployees, []);
       
        if (_.last(remainingDaysToFill).length > 0) {
            const {remainingDaysToFillAfterForceScheduling, forcedSchedules} = this.generateForcedSchedules(availableDaysFromEmployees.map((_)=>_.employeeId), schedules, remainingDaysToFill);
            if (_.last(remainingDaysToFillAfterForceScheduling).length > 0) {
                throw 'Cannot make schedules under current rules!';
            } else {
                return this.mergeSchedules(schedules, forcedSchedules);
            }
        } else {
            return schedules;
        }
    }

    /**
     * The acutal scheduling algorithm. Runs recursively. 
     * 
     * @param {*} daysToFill 
     * @param {*} availableDaysFromEmployees 
     * @param {*} schedulesSofar 
     */
    generateSchedules(daysToFill, availableDaysFromEmployees, schedulesSofar) {
        // Done if no more days to fill OR no more employees to assign shifts.
        if (_.last(daysToFill).length === 0 || availableDaysFromEmployees.length === 0) {
            return {
                remainingDaysToFill: daysToFill,
                schedules: schedulesSofar
            }
        }
    
        // Get the current employee's id and availableDays.
        const {employeeId, availableDays} = _.head(availableDaysFromEmployees);

        let remainingAvailableDays = availableDays;

        // Clears an array of days array to indicate assigned days. remainingAvailableDays will decrease
        // depending on the assigned days.
        const remainingDaysToFill = daysToFill.map(weekDays => {
            const shiftDays = _.intersection(weekDays, remainingAvailableDays);
            remainingAvailableDays = _.difference(remainingAvailableDays, shiftDays);
            
            return _.difference(weekDays, shiftDays);
        });

        // The current employee is done. Recursively call self to let the remaining employees deal with the remaining unfulfilled 
        // days. Attach the current employee's assigned shifts to the schedules we have so far.
        return this.generateSchedules(remainingDaysToFill, _.tail(availableDaysFromEmployees), schedulesSofar.concat({
            employee_id: employeeId,
            schedule: _.difference(availableDays, remainingAvailableDays)
        }));
    }

    /**
     * This method first generates employees available days only taking into account their already
     * assigned shifts. It then delegates to generateSchedules() for acutal schedules generation.
     * Returns a schedule only honoring already assigned shifts but ingoring time-off requests.
     * @param {*} employeeIds 
     * @param {*} schedules 
     * @param {*} daysToFill 
     */
    generateForcedSchedules(employeeIds, schedules, daysToFill) {
        const availableDaysFromEmployees = employeeIds.map((id) => {
            return {
                employeeId: id,
                availableDays: _.difference(constants.WEEK_DAYS, schedules.find((schedule) => schedule.employee_id === id))
            }
        });

        // Put employees with most available days first.
        availableDaysFromEmployees.sort((a, b) => a.availableDays.length < b.availableDays.length)

        const {remainingDaysToFill, schedules} = this.generateSchedules(daysToFill, availableDaysFromEmployees, []);

        return {
            remainingDaysToFillAfterForceScheduling: remainingDaysToFill,
            forcedSchedules: schedules
        }
    }

    /**
     * A pure utitlity method to merge two schedules. Useful for combining
     * forced schedules and unforced ones.
     * @param {*} schedulesA 
     * @param {*} schedulesB 
     */
    mergeSchedules(schedulesA, schedulesB) {
        return _.toArray(_.groupBy(_.union(schedulesA, schedulesB), 'employee_id')).map((employeeShifts)=>{
            return {
                employee_id: _.values(employeeShifts)[0].employee_id,
                schedules: _.values(employeeShifts).reduce((shiftSofar, shifts)=>shiftSofar.concat(shifts.schedule), [])
            }
        });
    }
} 
