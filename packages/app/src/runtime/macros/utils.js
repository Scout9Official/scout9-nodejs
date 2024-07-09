function MacroUtilsFactory() {

  return  {
    dateToUnix(date) { return parseInt((date.getTime() / 1000).toFixed(0))},
    scheduledToUnixSafe(scheduled) {
      if (scheduled instanceof Date) {
        return {data: this.dateToUnix(scheduled), success: true}
      } else if (typeof scheduled === 'string') {
        const timestamp = Date.parse(scheduled);
        if (isNaN(timestamp) === false) {
          return {data: this.dateToUnix(new Date(timestamp)), success: true };
        } else {
          return {error: '.scheduled is an invalid date string', success: false};
        }
      } else {
        return {error: `.scheduled was neither a Date or ISO string`, success: false};
      }
    },
    scheduledToUnix(scheduled) {
      const {success, ...rest} = this.scheduledToUnixSafe(scheduled);
      if (success) {
        return rest.data;
      } else  {
        throw new Error(rest.error);
      }
    }
  }

}

export const MacroUtils = MacroUtilsFactory();
