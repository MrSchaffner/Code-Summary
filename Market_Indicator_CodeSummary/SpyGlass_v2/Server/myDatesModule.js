
export default class MyDates {
    // variables to build subscription strings
    static today = new Date(); // unix 13 digits
    static dd = String(this.today.getDate()).padStart(2, '0'); // 31
    static mm = String(this.today.getMonth() + 1).padStart(2, '0'); // 01 January is returned as '0'!
    static yyyy = this.today.getFullYear(); // 2023
    static yy = String(this.yyyy).substring(2); // 23
    static dateToday_ws = this.yy + this.mm + this.dd; // 230131
    static dateToday_api = this.yyyy + "-" + this.mm + "-" + this.dd; // 2023-01-31

    static dayStartStr = `${this.mm}/${this.dd}/${this.yyyy} 6:30:00`;
    static dayStart = new Date(this.dayStartStr).getTime(); // unix 13 digits

    static dayMiddleStr = `${this.mm}/${this.dd}/${this.yyyy} 9:45:00`; // please note that this is for local time. Code will have to be changed if server is in a different time zone.
    static dayMiddle = new Date(this.dayMiddleStr).getTime(); // unix 13 digits


    static dayOfTheWeek = new Date().toLocaleString('en-us', { weekday: 'long' }).toUpperCase(); // SUNDAY
}
