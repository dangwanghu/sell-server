'use strict';

export default class StringUtil {

    static substring(str, len, hasDot) {
        if (!str || !len) {
            return '';
        }
        let currString = String(str);

        currString = currString.replace(/<\/?[^>]*>/g, '');
        currString = currString.replace(/[ | ]*\n/g, '\n');
        currString = currString.replace(/&nbsp;/ig, '');

        var newLength = 0;
        var newStr = "";
        var chineseRegex = /[^\x00-\xff]/g;
        var singleChar = "";
        var strLength = currString.replace(chineseRegex, "**").length;

        for (var i = 0; i < strLength; i++) {
            singleChar = currString.charAt(i).toString();
            if (singleChar.match(chineseRegex) != null) {
                newLength += 2;
            } else {
                newLength++;
            }
            if (newLength > len) {
                break;
            }
            newStr += singleChar;
        }

        if (hasDot && strLength > len) {
            newStr += "...";
        }
        return newStr;
    }

    static removeHtmlTag(str) {
        if (!str) {
            return '';
        }
        let currString = String(str);

        currString = currString.replace(/<\/?[^>]*>/g, '');
        currString = currString.replace(/[ | ]*\n/g, '\n');
        currString = currString.replace(/&nbsp;/ig, '');
        return currString;
    }

    static formatStr(str) {
        return function() {
            if (arguments.length == 0) return str;
            for (var temp = str, i = 0; i < arguments.length; i++) {
                temp = temp.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
            }
            return temp;
        };
    }

    static compare(prop) {
        return function(before, after) {
            if (before[prop] < after[prop]) {
                return 1;
            } else if (before[prop] > after[prop]) {
                return -1;
            } else {
                return 0;
            }
        }
    }

    static comparePositive(prop) {
        return function(before, after) {
            if (before[prop] < after[prop]) {
                return -1;
            } else if (before[prop] > after[prop]) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    static mathRand() {
        var num = "";
        for (var i = 0; i < 6; i++) {
            num += Math.floor(Math.random() * 10);
        }
        return num;
    };

    /**
     * TODO 计算信件文本长度，去除特殊字符
     * @param contents
     * @returns {*}
     */
    static calculateMailContentLength(contents) {
        let str = '';
        for (let content of contents) {
            if (content.type == 1) {
                str += content.body;
            }
        }
        let result = str.replace(/(&nbsp;)|(<br\/>)|(\n)/g, "");
        return result.length;
    }

    static uuid() {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        let uuid = s.join("");
        return uuid;
    }

    static getNoncestr(len) {
        len = len || 32
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
        let maxPos = $chars.length
        let pwd = ''
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
        }
        return pwd;
    }

    static getRandomCode(len) {
        len = len || 32
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZ12345678'
        let maxPos = $chars.length
        let pwd = ''
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
        }
        return pwd;
    }

    static isNotNull(str) {
        return str && str != null && str != 'null';
    }
}
