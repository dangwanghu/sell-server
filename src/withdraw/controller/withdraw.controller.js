'use strict';

import HandleConfig from '../../../config/handle.config';
import * as RouterConstants from '../../../constants/routes.constants';
import WithdrawService from '../service/withdraw.service';
import Joi from "joi";
import * as Response from '../../utils/response';
import StringUtil from '../../utils/string.util';
import Parameters from '../../../constants/settings.constants';
import * as RoleConstants from '../../../constants/role.constants';

export default class WithdrawController {

    /**
     * TODO 提交提现申请
     * @param request
     * @param reply
     */
    static async postWithdraw(request, reply) {
        request.log(['postWithdraw', '提交提现申请'], {
            amount: request.payload.amount,
            card: request.payload.card,
            time: new Date()
        });

        let amount = request.payload.amount;
        let card = request.payload.card;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await WithdrawService.postWithdraw(amount, card, user));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 管理员处理提现申请
     * @param request
     * @param reply
     */
    static async putWithdraw(request, reply) {
        request.log(['putWithdraw', '管理员处理提现申请'], {
            _id: request.payload._id,
            status: request.payload.status,
            time: new Date()
        });

        let _id = request.payload._id;
        let status = request.payload.status;
        let remark = request.payload.remark;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await WithdrawService.putWithdraw(_id, status, remark));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 管理员获取用户提现列表
     * @param request
     * @param reply
     */
    static async getUserWithdraws(request, reply) {
        request.log(['getUserWithdraws', '管理员获取用户提现列表'], {
            status: request.query.status,
            startDate: request.query.startDate,
            endDate: request.query.endDate,
            time: new Date()
        });

        let status = request.query.status;
        let startDate = request.query.startDate;
        let endDate = request.query.endDate;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await WithdrawService.getUserWithdraws(status, startDate, endDate));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 用户获取提现历史记录
     * @param request
     * @param reply
     */
    static async getApplyWithdraws(request, reply) {
        request.log(['getApplyWithdraws', '管理员获取用户提现列表'], {
            time: new Date()
        });

        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await WithdrawService.getApplyWithdraws(user._id));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 添加银行卡
     * @param request
     * @param reply
     */
    static async postBankCard(request, reply) {
        request.log(['postBankCard', '添加银行卡'], {
            bank: request.payload.bank,
            deposit: request.payload.deposit,
            cardNumber: request.payload.cardNumber,
            time: new Date()
        });

        let user = request.user;
        let bank = request.payload.bank;
        let deposit = request.payload.deposit;
        let cardNumber = request.payload.cardNumber;
        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await WithdrawService.postBankCard(bank, deposit, cardNumber, user));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 移除银行卡
     * @param request
     * @param reply
     */
    static async deleteBankCard(request, reply) {
        request.log(['deleteBankCard', '移除银行卡'], {
            _id: request.payload._id,
            time: new Date()
        });

        let user = request.user;
        let _id = request.payload._id;

        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await WithdrawService.deleteBankCard(_id));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取银行卡列表
     * @param request
     * @param reply
     */
    static async getBankCards(request, reply) {
        request.log(['getBankCards', '获取银行卡列表'], {
            time: new Date()
        });

        let user = request.user;

        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await WithdrawService.getBankCards(user._id));
            }
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
            case RouterConstants.POST_WITHDRAW:
                return new HandleConfig(describe,
                    {
                        payload : {
                            amount : Joi.number().required(),
                            card : Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.postWithdraw
                ).doHandle();
            case RouterConstants.PUT_WITHDRAW:
                return new HandleConfig(describe,
                    {
                        payload : {
                            _id : Joi.string().required(),
                            status : Joi.number().required(),
                            remark : Joi.any().empty(''),
                            token : Joi.string().required()
                        }
                    }, this.putWithdraw
                ).doHandle();
            case RouterConstants.GET_USER_WITHDRAWS:
                return new HandleConfig(describe,
                    {
                        query : {
                            startDate : Joi.date(),
                            endDate : Joi.date(),
                            status : Joi.number().required(),
                            token : Joi.string().required()
                        }
                    }, this.getUserWithdraws
                ).doHandle();
            case RouterConstants.GET_APPLY_WITHDRAWS:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getApplyWithdraws
                ).doHandle();
            case RouterConstants.POST_BANK_CARD:
                return new HandleConfig(describe,
                    {
                        payload : {
                            bank : Joi.string().required(),
                            deposit : Joi.string().required(),
                            cardNumber : Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.postBankCard
                ).doHandle();
            case RouterConstants.DELETE_BANK_CARD:
                return new HandleConfig(describe,
                    {
                        payload : {
                            _id : Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.deleteBankCard
                ).doHandle();
            case RouterConstants.GET_BANK_CARDS:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getBankCards
                ).doHandle();
            default:
                break;
        }
    }
}