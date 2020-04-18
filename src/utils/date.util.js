'use strict';

export default class DateUtil {
    static format(date, fmt) {
        var o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    static beforeDay(date, day) {
        date = date || new Date();
        var before = date.getTime() - 1000 * 60 * 60 * 24 * day;
        return new Date(before);
    }

    static afterDay(date, day) {
        date = date || new Date();
        var after = date.getTime() + 1000 * 60 * 60 * 24 * day;
        return new Date(after);
    }

    static beforeHour(date, hour) {
        date = date || new Date();
        var before = date.getTime() - 1000 * 60 * 60 * hour;
        return new Date(before);
    }

    static getWeekDate(date) {
        let startDate = null;
        // 得出今天星期几 0-天 1-一 2-二 3-三 4-四 5-五 6-六
        let calDate = date || new Date();
        var d = calDate.getDay();
        if (d != 0) {
            startDate = this.beforeDay(calDate, d - 1);
        } else {
            startDate = this.beforeDay(calDate, 6);
        }
        return {
            startDate : startDate,
            endDate : calDate
        };
    }

    static isBefore(frontDate, afterDate) {
        if (frontDate.getTime() > afterDate.getTime()) {
            return false;
        } else {
            return true;
        }
    }

}