'use strict';

import HandleConfig from '../../../config/handle.config';
import * as RouterConstants from '../../../constants/routes.constants';
import OrderService from '../service/order.service';
import Joi from "joi";
import * as Response from '../../utils/response';
import StringUtil from '../../utils/string.util';
import Parameters from '../../../constants/settings.constants';
import * as RoleConstants from '../../../constants/role.constants';

export default class OrderController {

    /**
     * TODO 管理员获取订单列表
     * @param request
     * @param reply
     */
    static async getAdminOrders(request, reply) {
        request.log(['getAdminOrder', '管理员获取订单列表'], {
            startDate: request.query.startDate,
            endDate: request.query.endDate,
            status: request.query.status,
            time: new Date()
        });

        let startDate = request.query.startDate;
        let endDate = request.query.endDate;
        let status = request.query.status;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await OrderService.getAdminOrders(startDate, endDate, status));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 管理员获取待补单列表
     * @param request
     * @param reply
     */
    static async getAdminLockOrders(request, reply) {
        request.log(['getAdminOrder', '管理员获取待补单列表'], {
            time: new Date()
        });

        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await OrderService.getAdminLockOrders());
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 补单
     * @param request
     * @param reply
     */
    static async putUnlockOrder(request, reply) {
        request.log(['putUnlockOrder', '补单'], {
            phone: request.payload.phone,
            aliPayOrderNum: request.payload.aliPayOrderNum,
            time: new Date()
        });

        let user = request.user;
        let phone = request.payload.phone;
        let aliPayOrderNum = request.payload.aliPayOrderNum;

        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await OrderService.putUnlockOrder(phone, aliPayOrderNum));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 修改订单信息
     * @param request
     * @param reply
     */
    static async putOrder(request, reply) {
        request.log(['putOrder', '修改订单信息'], {
            time: new Date()
        });

        let user = request.user;
        let _id = request.payload._id;
        let status = request.payload.status;
        let logisticsInfo = request.payload.logisticsInfo;

        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await OrderService.putOrder(_id, status, logisticsInfo));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 用户获取订单列表
     * @param request
     * @param reply
     */
    static async getUserOrders(request, reply) {
        request.log(['getUserOrders', '用户获取订单列表'], {
            time: new Date()
        });

        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await OrderService.getUserOrders(user));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取指定时间段内的收入和支出
     * @param request
     * @param reply
     */
    static async getDuringProfits(request, reply) {
        request.log(['getDuringProfits', '获取指定时间段内的收入和支出'], {
            startDate: request.query.startDate,
            endDate: request.query.endDate,
            time: new Date()
        });

        let startDate = request.query.startDate;
        let endDate = request.query.endDate;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await OrderService.getDuringProfits(startDate, endDate));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 服务器接收支付通知
     * @param request
     * @param reply
     */
    static async postServerPayNotify(request, reply) {
        request.log(['postServerPayNotify', '服务器接收支付通知'], {
            time: request.payload.time,
            title: request.payload.title,
            order: request.payload.order,
            money: request.payload.money,
            user: request.payload.user,
            keymd5: request.payload.keymd5,
            logTime: new Date()
        });

        let time = request.payload.time;
        let phone = request.payload.title;
        let aliPayOrderNum = request.payload.order;
        let money = request.payload.money;
        let userName = request.payload.user;
        let keymd5 = request.payload.keymd5;
        try {
            reply(await OrderService.handleOrderStatus(time, phone, aliPayOrderNum, money, userName, keymd5));
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 路由配置
     * @param describe
     * @param actionType
     * @returns {HandleConfig}
     */
    static config(describe, actionType) {
        let config = {};
        switch (actionType) {
            case RouterConstants.GET_ADMIN_ORDERS:
                return new HandleConfig(describe,
                    {
                        query : {
                            startDate : Joi.date(),
                            endDate : Joi.date(),
                            status : Joi.number(), // 0-未付款 1-待发货 2-已发货
                            token : Joi.string().required()
                        }
                    }, this.getAdminOrders
                ).doHandle();
            case RouterConstants.GET_USER_ORDERS:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getUserOrders
                ).doHandle();
            case RouterConstants.GET_DURING_PROFITS:
                return new HandleConfig(describe,
                    {
                        query : {
                            startDate : Joi.date(),
                            endDate : Joi.date(),
                            token : Joi.string().required()
                        }
                    }, this.getDuringProfits
                ).doHandle();
            case RouterConstants.POST_SERVER_PAY_NOTIFY:
                return new HandleConfig(describe,
                    {
                        payload : {
                            time : Joi.string().required(),
                            title : Joi.any().empty(''),
                            order : Joi.string().required(),
                            money : Joi.string().required(),
                            user : Joi.string().required(),
                            type : Joi.string().required(),
                            keymd5 : Joi.string().required()
                        }
                    }, this.postServerPayNotify
                ).doHandle();
            case RouterConstants.GET_ORDER_LOCKS:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getAdminLockOrders
                ).doHandle();
            case RouterConstants.PUT_UNLOCK_ORDER:
                return new HandleConfig(describe,
                    {
                        payload : {
                            phone : Joi.string().required(),
                            aliPayOrderNum : Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.putUnlockOrder
                ).doHandle();
            case RouterConstants.PUT_ORDER:
                return new HandleConfig(describe,
                    {
                        payload : {
                            _id : Joi.string().required(),
                            status : Joi.number().required(),
                            logisticsInfo: Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.putOrder
                ).doHandle();
            default:
                break;
        }
    }
}