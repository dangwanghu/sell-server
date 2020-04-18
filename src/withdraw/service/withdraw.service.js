'use strict';

import Withdraw from '../entity/withdraw';
import BankCard from '../entity/bank.card';
import User from '../../user/entity/user';
import * as Response from '../../utils/response';
import Parameters from '../../../constants/settings.constants';
import StringUtil from '../../utils/string.util';
import DateUtil from '../../utils/date.util';
import * as RoleConstants from '../../../constants/role.constants';
import SendMsgUtil from '../../utils/send.msg';

export default class WithdrawService {

    /**
     * TODO 提交提现申请
     * @param amount
     * @param card
     * @param user
     */
    static async postWithdraw(amount, card, user) {
        try {
            // TODO 查询余额
            user = await User.findById(user._id);
            if (user.balance < 100) {
                throw Response.forbidden("亲，等攒够100元再来申请吧~");
            }
            if (user.balance < amount) {
                throw Response.forbidden("余额不足~");
            }

            // TODO 查询是否有未处理的提现请求
            let withdraw = await Withdraw.findOneByProperties({
                status: 0,
                user: user
            });
            if (withdraw) {
                throw Response.forbidden("有未处理的提现请求，请耐心等待~");
            }

            // TODO 新增提现申请
            let result = await new Withdraw({
                amount: amount,
                card: card,
                status: 0,
                user: user._id,
                createTime: new Date(),
                updateTime: new Date()
            }).save();

            return Response.ok("申请成功", result);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('申请失败');
            }
            throw err;
        }
    }

    /**
     * TODO 管理员处理提现申请
     * @param _id
     * @param status
     * @param remark
     */
    static async putWithdraw(_id, status, remark) {
        try {
            let withdraw = await Withdraw.findOneByProperties({
                _id: _id
            });

            // TODO 修改用户余额
            if (status == 1) {
                let user = await User.findById(String(withdraw.user));
                user.balance = user.balance - withdraw.amount;
                await User.updateObj(user);
            } else if (status == 2) {
                await SendMsgUtil.sendMsg(withdraw.user.phone, remark, 26218);
                withdraw.remark = remark;
            }

            // TODO 修改状态
            withdraw.status = status;
            withdraw.updateTime = new Date();
            await Withdraw.updateObj(withdraw);

            return Response.ok("处理成功", null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('处理失败');
            }
            throw err;
        }
    }

    /**
     * TODO 管理员获取用户提现列表
     * @param status
     * @param startDate
     * @param endDate
     */
    static async getUserWithdraws(status, startDate, endDate) {
        try {
            let query = {};
            let createTime = {$lte: new Date()};
            if (startDate) {
                createTime.$gt = startDate;
            }
            if (endDate) {
                createTime.$lte = endDate;
            }
            query.createTime = createTime;
            if (status != null) {
                query.status = status;
            }
            let withdraws = await Withdraw.findAllListByProperties(query);

            return Response.ok("查询提现列表成功", {
                list: withdraws,
                count: withdraws.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询失败');
            }
            throw err;
        }
    }

    /**
     * TODO 用户获取提现历史记录
     * @param userId
     */
    static async getApplyWithdraws(userId) {
        try {
            let query = {user: userId};
            let withdraws = await Withdraw.findAllListByProperties(query);

            return Response.ok("查询提现列表成功", {
                list: withdraws,
                count: withdraws.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询失败');
            }
            throw err;
        }
    }

    /**
     * TODO 添加银行卡
     * @param bank
     * @param deposit
     * @param cardNumber
     * @param user
     */
    static async postBankCard(bank, deposit, cardNumber, user) {
        try {
            // 新增银行卡
            let result = await new BankCard({
                bank: bank,
                deposit: deposit,
                cardNumber: cardNumber,
                status: 1,
                user: user._id,
                createTime: new Date()
            }).save();

            return Response.ok("添加成功", result);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('添加失败');
            }
            throw err;
        }
    }

    /**
     * TODO 移除银行卡
     * @param _id
     */
    static async deleteBankCard(_id) {
        try {
            let bankCard = await BankCard.findById(_id);
            bankCard.status = 0;

            await BankCard.updateObj(bankCard);
            return Response.ok("移除成功", null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('移除失败');
            }
            throw err;
        }
    }

    /**
     * TODO 获取银行卡列表
     * @param userId
     */
    static async getBankCards(userId) {
        try {
            let cards = await BankCard.findAllListByProperties({user: userId, status: 1});

            return Response.ok("查询银行卡列表成功", {
                list: cards,
                count: cards.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询失败');
            }
            throw err;
        }
    }
}