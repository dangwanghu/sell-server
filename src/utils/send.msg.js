'use strict';
import NativeRequest from 'request';
import Parameters from '../../constants/settings.constants';
import StringUtil from '../utils/string.util';
import * as Response from '../utils/response';
import Request from "nodegrass";

export default class SendMsgUtil {

    static async sendMsg(phone, code, tpl_id) {

        let url = Parameters.proxy.msgUrl
            + '?mobile=' + phone + '&tpl_id=' + tpl_id
            + '&tpl_value=' + encodeURIComponent('#code#=' + code)
            + '&key=30454ae2ddb858aa2600bf00c1d38e24';
        return new Promise((resolve, reject) => {
            Request.get(url, function(res, statusCode, headers) {
                if (statusCode != 200) {
                    reject(Response.internal('发送失败'));
                } else {
                    resolve(Response.ok('发送成功', {
                        code: code
                    }));
                }
            });
        });
    }

}