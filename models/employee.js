module.exports = class Employee {
    constructor(id) {
        this.id = id;
    }

    /**
     * This method returns this employee's schedules.
     * @param {*} schedules 
     */
    retrieveShifts(schedules) {
        const allWeeksOwnShifts = schedules.map(shift => {
            return {week: shift.week, schedules: shift.schedules.filter(schedule => schedule.employee_id === this.id)};
        }).map(ownShift => {
            if (ownShift.schedules.length > 0) ownShift.schedules = ownShift.schedules[0].schedule;
            return ownShift;
        });

        // Remove empty schedules.
        return allWeeksOwnShifts.filter(shift => shift.schedules.length > 0);
    }
}