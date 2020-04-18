'use strict';

import User from '../entity/user';
import * as Response from '../../utils/response';
import * as Jwt from 'jsonwebtoken';
import Parameters from '../../../constants/settings.constants';
import Cache from '../../../config/cache.config';
import StringUtil from '../../utils/string.util';
import DateUtil from '../../utils/date.util';
import * as RoleConstants from '../../../constants/role.constants';
import Order from '../../order/entity/order';
import OrderService from '../../order/service/order.service';
import SendMsgUtil from '../../utils/send.msg';

export default class UserService {

    /**
     * TODO 商户登录
     * @param phone
     * @param password
     */
    static async signIn(phone, password) {
        try {
            // TODO 1.校验商户是否存在
            let user = await User.findOneByProperties({
                phone: phone
            });
            if (user && user.status == 0) {
                throw Response.badRequest('未缴纳加盟费');
            }
            if (user && user.status == 2) {
                throw Response.badRequest('已禁用，请联系管理员');
            }
            if (user) {
                // TODO 2.校验密码
                if (password != user.password) {
                    throw Response.badRequest('密码错误');
                }

                // TODO 3.更新数据库
                let tokenData = {
                    _id: user._id,
                    userType: user.userType,
                    realName: user.realName,
                    time: (new Date()).valueOf()
                };
                let tokens = Jwt.sign(tokenData, Parameters.key.privateKey).split('.');
                user.token = tokens[tokens.length - 1];
                user.latestLoginTime = new Date();
                await User.updateObj(user);

                // TODO 4.更新缓存
                await Cache.setCache(user.token, tokenData);
                user.password = "";
                return Response.ok("登录成功", user);
            } else {
                throw Response.badRequest('该手机号未加盟');
            }
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('登录失败');
            }
            throw err;
        }
    }

    /**
     * TODO 管理员登录
     * @param email
     * @param paassword
     */
    static async postAdminSignIn(email, password) {
        try {
            // TODO 1.校验账户是否存在
            let user = await User.findOneByProperties({
                email: email
            });
            if (user) {
                // TODO 2.校验密码
                if (password != user.password) {
                    throw Response.badRequest('密码错误');
                }

                if (user.status == 0) {
                    throw Response.badRequest('账户被禁用');
                }

                // TODO 3.更新数据库
                let tokenData = {
                    _id: user._id,
                    userType: user.userType,
                    realName: user.realName,
                    time: (new Date()).valueOf()
                };
                let tokens = Jwt.sign(tokenData, Parameters.key.privateKey).split('.');
                user.token = tokens[tokens.length - 1];
                user.latestLoginTime = new Date();
                await User.updateObj(user);

                // TODO 4.更新缓存
                await Cache.setCache(user.token, tokenData);
                user.password = "";
                return Response.ok("登录成功", user);
            } else {
                throw Response.badRequest('账户不存在');
            }
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('登录失败');
            }
            throw err;
        }
    }

  /**
   * TODO 获取商户列表
   * @param status
   */
    static async getUsers(status) {
        try {
            let query = { userType: RoleConstants.USER_TYPE_GENERAL};
            query.status = status;
            if (status == 1) {
                query.status = {$ne: 0};
                // 查询总商户
                query.parent = null;
                let bigParent = await User.findAllListByProperties(query);
                if (bigParent.length == 0) {
                    return Response.ok('成功获取商户列表', {
                        result: {
                            text: "未生成总商户"
                        }
                    });
                }
                let result = [{
                    text: bigParent[0].realName,
                    nodes: []
                }];

                // 查询顶一级商户
                query.parent = bigParent[0]._id;
                let oneLevelParents = await User.findAllListByProperties(query);
                if (oneLevelParents.length > 0) {
                    result[0].nodes = oneLevelParents.map((item) => {
                        let tags = item.status == 2 ? ['该商户已禁用'] : [];
                        return {
                            text: item.realName,
                            tags: tags,
                            href: item._id
                        };
                    })
                }

                // 循环查询所有交过费的商户直到完成
                await this.getChildren(result[0].nodes, oneLevelParents);
                return Response.ok('成功获取商户列表', {
                    result: result
                });

            } else {
                let userList = await User.findAllListByProperties(query);
                return Response.ok('成功获取商户列表', {
                    list: userList,
                    count: userList.length
                });
            }
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('获取列表失败');
            }
            throw err;
        }
    }

    static async getChildren(nodes, children) {
        for (let index = 0; index < children.length; index ++) {
            let item = children[index];

            let _children = await User.findAllListByProperties({userType: RoleConstants.USER_TYPE_GENERAL, parent: item._id, status: {$ne: 0}});
            if (_children.length > 0) {
                nodes[index].nodes = _children.map((_item) => {
                    let tags = _item.status == 2 ? ['该商户已禁用'] : [];
                    return {
                        text: _item.realName,
                        tags: tags,
                        href: _item._id
                    };
                });
                await this.getChildren(nodes[index].nodes, _children);
            }
        }
    }

    /**
     * TODO 获取下属商户列表
     * @param userId
     * @param level 1-9
     */
    static async getUnderUsers(userId, level) {
        try {
            if (level > 9 || level <=0) {
                throw Response.unauthorized('非法请求');
            }
            // TODO 获取商户列表
            let inParents = [userId];
            let userList = [];
            for (let index = 1; index <= 9; index ++) {
                userList = await User.findAllListByProperties({parent: {$in: inParents}, status: 1});
                let result = userList.map((user) => {
                   return user._id;
                });
                inParents = result;

                if (level == index) {
                    break;
                }
            }

            // TODO 转成客户端格式
            let users = userList.map((user) => {
                return User.toClient(user);
            });

            return Response.ok('成功获取商户列表', {
                list: userList,
                count: userList.length
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('获取列表失败');
            }
            throw err;
        }
    }

    /**
     * TODO 获取商户信息
     * @param _id
     */
    static async getUser(_id) {
        try {
            let user = await User.findById(_id);
            return Response.ok('成功获取商户信息', user);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('获取失败');
            }
            throw err;
        }
    }

    /**
     * TODO 获取总商户信息
     */
    static async getBaseUser() {
        try {
            let user = await User.findOneByProperties({parent: null, userType: RoleConstants.USER_TYPE_GENERAL});
            return Response.ok('成功获取总商户信息', user);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('获取失败');
            }
            throw err;
        }
    }

    /***
     * TODO 修改商户密码
     * @param userId
     * @param originPwd
     * @param newPwd
     * @param type 0-登录 1-提现
     */
    static async putUserPwd(userId, originPwd, newPwd, type) {
        try {
            let user = await User.findById(userId);

            // 如果为提现，并且原密码不存在，则不校验原密码，否则都要校验
            if (!(type == 1 && (!user.withdrawPassword || user.withdrawPassword == ''))) {
                if (type == 1 && originPwd != user.withdrawPassword) {
                    throw Response.internal('原密码错误');
                }
                if (type == 0 && originPwd != user.password) {
                    throw Response.internal('原密码错误');
                }
            }

            if (type == 0) {
                user.password = newPwd;
            } else if (type == 1) {
                user.withdrawPassword = newPwd;
            }
            await User.updateObj(user);
            return Response.ok('成功修改商户密码', null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('获取失败');
            }
            throw err;
        }
    }

    /**
     * TODO 新增商户
     * @param realName
     * @param password
     * @param phone
     * @param qq
     * @param email
     * @param city
     * @param address
     * @param parent
     * @param remark
     */
    static async addUser(realName, password, phone, qq, email, city, address, parent, remark) {
        try {
            // TODO 获取商户号
            let agentNumber = await User.synchronizedGeneratorAgentCode();

            // TODO 判断(状态为0)的商户是否存在
            let user = await User.findOneByProperties({
                phone: phone
            });

            if (user && user.status == 1) {
                return Response.internal("该手机号已加盟");
            }

            let result = null;
            if (user) {
                // 修改商户
                result = await this.updateUser(user._id, null, password, null, qq, email, city, address, null);
                // 删除订单
                await Order.remove({ user: user._id });
            } else {
                // 新增商户
                result = await new User({
                    agentNumber: agentNumber,
                    realName: realName,
                    password: password,
                    phone: phone,
                    qq: qq,
                    email: email,
                    city: city,
                    address: address,
                    status: 0,
                    parent: parent,
                    createTime: new Date(),
                    registerDate: DateUtil.format(new Date(), 'yyyy-MM-dd'),
                    updateTime: new Date()
                }).save();
            }

            // TODO 生成二维码链接
            let qrCode = Parameters.getQrCodeUrl() + result._id;
            result.qrCode = qrCode;
            await User.updateObj(result);

            // TODO 新增订单
            let order = await OrderService.postOrder(city + ' ' + address, phone, remark, result._id);

            await SendMsgUtil.sendMsg(phone, Parameters.server.serverUrl, 26215);
            return Response.ok("注册成功", {
                user: result,
                order: order
            });
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('注册失败');
            }
            throw err;
        }
    }

    /**
     * TODO 修改商户信息
     * @param _id
     * @param agentNumber
     * @param password
     * @param phone
     * @param qq
     * @param email
     * @param city
     * @param address
     * @param status
     */
    static async updateUser(_id, agentNumber, password, phone, qq, email, city, address, status) {
        try {
            let user = await User.findById(_id);

            if (StringUtil.isNotNull(password)) {
                user.password = password;
            }
            if (StringUtil.isNotNull(agentNumber)) {
                user.agentNumber = agentNumber;
            }
            if (StringUtil.isNotNull(phone)) {
                user.phone = phone;
            }
            if (StringUtil.isNotNull(qq)) {
                user.qq = qq;
            }
            if (StringUtil.isNotNull(email)) {
                user.email = email;
            }
            if (StringUtil.isNotNull(city)) {
                user.city = city;
            }
            if (StringUtil.isNotNull(address)) {
                user.address = address;
            }
            if (StringUtil.isNotNull(status)) {
                user.status = status;
            }

            user.updateTime = new Date();
            await User.updateObj(user);
            return user;
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('修改信息失败');
            }
            throw err;
        }
    }

    /**
     * TODO 生成总商户
     */
    static async addBaseUser() {
        try {
            // TODO 获取商户号
            let agentNumber = await User.synchronizedGeneratorAgentCode();

            // TODO 判断商户是否存在
            let user = await User.findOneByProperties({
                realName: "总商户",
                password: "123456admin!@#$%^",
                status: 1
            });

            if (user) {
                return Response.internal("已生成，无需重复生成");
            } else {
                // TODO 新增商户
                let result = await new User({
                    agentNumber: agentNumber,
                    realName: "总商户",
                    password: "123456admin!@#$%^",
                    email: "admin@china_wind.com",
                    city: "香港 九龙岛",
                    address: "总部",
                    status: 1,
                    createTime: new Date(),
                    registerDate: DateUtil.format(new Date(), 'yyyy-MM-dd'),
                    updateTime: new Date()
                }).save();

                // TODO 生成二维码链接
                let qrCode = Parameters.getQrCodeUrl() + result._id;
                result.qrCode = qrCode;
                await User.updateObj(result);

                return Response.ok("成功生成总商户", result);
            }
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('生成失败');
            }
            throw err;
        }
    }

    /**
     * TODO 启用/禁用商户
     * @param _id
     * @param status
     */
    static async updateUserStatus(_id, status) {
        try {
            let user = await User.findById(_id);
            // 不能直接启用没缴费的商户
            if (status == 1 && user.status == 0) {
                return Response.internal("未缴费，不能启用");
            }
            // 不能直接禁用
            if (status == 2 && user.status == 0) {
                return Response.internal("未缴费，不能禁用");
            }

            user.status = status;
            await User.updateObj(user);
            return Response.ok('操作成功', null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('操作失败');
            }
            throw err;
        }
    }

    /**
     * TODO 获取管理员列表
     */
    static async getOperators() {
        try {
            let userList = await User.findAllListByProperties({userType: RoleConstants.USER_TYPE_ADMIN})

            return Response.ok('查询成功', {
                list: userList,
                count: userList.length
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
     * TODO 新增管理员
     * @param realName
     * @param email
     * @param password
     * @param auth
     */
    static async addOperator(realName, email, password, auth) {
        try {
            // TODO 判断(状态为0)的商户是否存在
            let user = await User.findOneByProperties({
                email: email
            });

            if (user) {
                throw Response.internal("账户名已存在");
            }

            // 新增管理员
            let result = await new User({
                realName: realName,
                password: password,
                email: email,
                auth: auth,
                userType: RoleConstants.USER_TYPE_ADMIN,
                status: 1,
                createTime: new Date(),
                registerDate: DateUtil.format(new Date(), 'yyyy-MM-dd'),
                updateTime: new Date()
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
     * TODO 修改操作员信息
     * @param _id
     * @param status
     * @param auth
     */
    static async updateOperator(_id, status, auth) {
        try {
            let user = await User.findById(_id);
            if (status != null ) {
                user.status = status;
            }
            if (auth != null && auth.length > 0) {
                user.auth = auth;
            }

            await User.updateObj(user);
            return Response.ok('操作成功', null);
        } catch (err) {
            console.error(err);
            if (err.stack) {
                console.error(err.stack);
                throw Response.internal('操作失败');
            }
            throw err;
        }
    }

}