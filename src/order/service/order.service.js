'use strict';

import Order from '../entity/order';
import OrderLock from '../entity/order.lock';
import Withdraw from '../../withdraw/entity/withdraw';
import * as Response from '../../utils/response';
import Parameters from '../../../constants/settings.constants';
import StringUtil from '../../utils/string.util';
import DateUtil from '../../utils/date.util';
import * as RoleConstants from '../../../constants/role.constants';
import ConfigUtil from '../../config/util/config.util';
import crypto from 'crypto';
import User from '../../user/entity/user';
import Mongoose from 'mongoose';
import SendMsgUtil from '../../utils/send.msg';

export default class OrderService {

    /**
     * TODO 提交订单
     * @param address
     * @param phone
     * @param remark
     * @param userId
     */
    static async postOrder(address, phone, remark, userId) {
        try {
            // TODO 获取订单号
            let orderNum = await Order.synchronizedGeneratorOrderCode();

            // TODO 获取产品信息
            let product = await ConfigUtil.getSystemCache(Parameters.cache.productKey);

            // TODO 新增订单
            let result = await new Order({
                orderNum: orderNum,
                product: product.desc.brand + '-' + product.desc.wineType,
                amount: Parameters.proxy.orderMoney,
                address: address,
                phone: phone,
                remark: remark,
                status: 0,
                user: userId,
                createTime: new Date(),
                createDate: DateUtil.format(new Date(), 'yyyy-MM-dd'),
                updateTime: new Date()
            }).save();

            return result;
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('下单失败');
            }
            throw err;
        }
    }

    /**
     * TODO 管理员获取订单列表
     * @param startDate
     * @param endDate
     * @param status
     */
    static async getAdminOrders(startDate, endDate, status) {
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

            // TODO 查询订单列表
            let result = await Order.findAllListByProperties(query);

            return Response.ok("查询订单列表成功", {
                list: result,
                count: result.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询列表失败');
            }
            throw err;
        }
    }

    /**
     * TODO 用户获取订单列表
     * @param user
     */
    static async getUserOrders(user) {
        try {
            // TODO 查询订单列表
            let result = await Order.findAllListByProperties({
                "status": {$ne: 0},
                "shareProfit._id": Mongoose.mongo.ObjectId(user._id)
            });

            let sellList = result.map((order) => {
                return Order.toClient(order, user._id);
            });

            let buyInfo = await Order.findAllListByProperties({
                "status": {$ne: 0},
                "user": user._id
            });

            return Response.ok("查询订单列表成功", {
                buyInfo: buyInfo,
                sellList: sellList
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询列表失败');
            }
            throw err;
        }
    }

    /**
     * TODO 获取指定时间段内的收入和支出
     * @param startDate
     * @param endDate
     */
    static async getDuringProfits(startDate, endDate) {
        try {
            // TODO 查询条件
            let query = {};
            let createTime = {$lte: new Date()};
            if (startDate) {
                createTime.$gt = startDate;
            }
            if (endDate) {
                createTime.$lte = endDate;
            }
            query.createTime = createTime;
            query.status = {$ne: 0};
            // TODO 获取订单收入status:1
            let orders = await Order.findAllListByProperties(query);

            let result = new Map();
            for (let order of orders) {
                let date = DateUtil.format(order.createTime, 'yyyy-MM-dd');
                if (result.has(date)) {
                    let data = result.get(date);
                    data.income += order.amount;
                    result.set(date, data);
                } else {
                    result.set(date, {income: order.amount, outcome: 0});
                }
            }

            query.status = 1;
            // TODO 获取提现支出status:1
            let withdraws = await Withdraw.findAllListByProperties(query);

            for (let withdraw of withdraws) {
                let date = DateUtil.format(withdraw.createTime, 'yyyy-MM-dd');
                if (result.has(date)) {
                    let data = result.get(date);
                    data.outcome += withdraw.amount;
                    result.set(date, data);
                } else {
                    result.set(date, {income: 0, outcome: withdraw.amount});
                }
            }

            let liRun = 0;
            // Map to List
            let profits = [];
            for (let key of result.keys()) {
                liRun = liRun + result.get(key).income - result.get(key).outcome;
                profits.push({
                    date: key,
                    value: result.get(key)
                });
            }

            return Response.ok("查询成功", {
                list: profits,
                amount: liRun
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
     * TODO 处理订单状态
     * @param time
     * @param phone
     * @param aliPayOrderNum
     * @param money
     * @param userName
     * @param keymd5
     */
    static async handleOrderStatus(time, phone, aliPayOrderNum, money, userName, keymd5) {
        try {
            // TODO 1.先验签，非法则返回
            let str = aliPayOrderNum + money + Parameters.proxy.notifyKey;
            let decipher = crypto.createHash('md5');
            let dynicSign =  decipher.update(str).digest('hex');
            if (dynicSign != keymd5) {
                throw Response.forbidden('非法请求');
            }

            // TODO 2.查询订单 - 用代理号，如果为空，到插入到未入账表
            let order = null;
            let isExist = false;
            let user = null;
            if (phone && phone != '') {
                user = await User.findOneByProperties({
                    phone: phone
                });
                if (user) {
                    isExist = true;
                    order = await Order.findOneByProperties({user: user._id, status: 0});
                }
            }
            // 未入账，判断是否已经插入
            if (!isExist || parseFloat(money) < parseFloat(Parameters.proxy.orderMoney)) {
                let status = 0;
                let remark = '';
                // 金额不够
                if (isExist && parseFloat(money) < parseFloat(Parameters.proxy.orderMoney)) {
                    remark = '缴纳金额小于约定金额';
                    status = 0;
                } else if (!isExist && parseFloat(money) >= parseFloat(Parameters.proxy.orderMoney)) {
                    remark = '商户编码不存在';
                    status = 1;
                } else if (!isExist && parseFloat(money) < parseFloat(Parameters.proxy.orderMoney)) {
                    remark = '商户编码不存在，并且缴纳金额小于约定金额';
                    status = 2;
                }
                // 判断有木有
                let orderLock = await OrderLock.findOneByProperties({aliPayOrderNum: aliPayOrderNum});
                if (!orderLock) {
                    await new OrderLock({
                        time: time,
                        phone: phone,
                        aliPayOrderNum: aliPayOrderNum,
                        userName: userName,
                        money: money,
                        keymd5: keymd5,
                        remark: remark,
                        status: status
                    }).save();
                }
            } else {
                // TODO 3.判断状态为0，需要更改，则返回
                if (order.status == 0) {
                    order.status = 1;
                    order.aliPayOrderNum = aliPayOrderNum;
                    order.amount = money;
                    await Order.updateObj(order);
                    // TODO 4.后续异步处理
                    this.delayHandleRemainOrder(user, order);
                }
            }

            return Response.ok("受理成功", 'success');
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('受理失败');
            }
            throw err;
        }
    }

    /**
     * TODO 处理订单的后续事宜
     * @param user
     * @param order
     * I.更改他的账户状态
     * II.更改他的父节点hasChild为1
     * III.分润
     */
    static async delayHandleRemainOrder(user, order) {
        try {
            // TODO 更改账户状态
            user.status = 1;
            await User.updateObj(user);

            // TODO 更改他的父节点hasChild为1
            let parent = await User.findById(user.parent);
            parent.hasChild = 1;
            parent.orderCount += 1;
            await User.updateObj(parent);

            // TODO 处理分润
            await this.fenProfit(user, order);

            await SendMsgUtil.sendMsg(user.phone, '', 26217);

        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                console.error('处理订单的后续事宜报错');
            }
        }
    }

    /**
     * TODO 处理分润
     * @param user
     * @param order
     */
    static async fenProfit(user, order) {
        try {
            let orderMoneyFenProfit = Parameters.proxy.orderMoneyFenProfit;
            let parentId = user.parent;
            let shareProfit = [];
            // TODO 余额增加
            for (let index = 0; index < Parameters.proxy.fenProfitLevel; index++) {
                let item = await User.findById(parentId);
                if (item) {
                    // 加余额
                    item.balance += orderMoneyFenProfit[index];
                    await User.updateObj(item);
                    parentId = item.parent;

                    // 订单加分润记录
                    shareProfit.push({
                        _id : item._id,
                        level : index + 1,
                        realName: item.realName,
                        amount: orderMoneyFenProfit[index]
                    });
                } else {
                    break;
                }
            }

            // TODO 订单加入分润记录
            order.shareProfit = shareProfit;
            order.recvTime = DateUtil.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            order.status = 1;
            await Order.updateObj(order);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                console.error('处理分润报错');
            }
        }
    }

    static async getAdminLockOrders() {
        try {
            // TODO 查询待补单列表
            let result = await OrderLock.findAllListByProperties({status: 1});
            return Response.ok("查询待补单列表成功", {
                list: result,
                count: result.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('查询列表失败');
            }
            throw err;
        }
    }

    static async putUnlockOrder(phone, aliPayOrderNum) {
        try {
            // 判断流水号是否正确
            let orderLock = await OrderLock.findOneByProperties({aliPayOrderNum: aliPayOrderNum});
            if (!orderLock) {
                throw Response.internal('支付宝订单号不存在');
            }

            // 查询用户
            let user = await User.findOneByProperties({
                phone: phone
            });
            if (!user) {
                throw Response.internal('商户不存在');
            }

            // 删除补单
            await OrderLock.removeById(orderLock._id);

            // 查询订单
            let order = await Order.findOneByProperties({user: user._id, status: 0});

            if (order) {
                // 分润
                this.delayHandleRemainOrder(user, order);
            }

            return Response.ok("操作成功", null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('补单失败');
            }
            throw err;
        }
    }

    static async putOrder(_id, status, logisticsInfo) {
        try {
            let order = await Order.findById(_id);

            order.status = status;
            order.logisticsInfo = logisticsInfo;

            await Order.updateObj(order);

            await SendMsgUtil.sendMsg(order.phone, logisticsInfo, 26216);

            return Response.ok("操作成功", null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('补单失败');
            }
            throw err;
        }
    }
}