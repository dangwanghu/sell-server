'use strict';

import HandleConfig from '../../../config/handle.config';
import * as RouterConstants from '../../../constants/routes.constants';
import UserService from '../service/user.service';
import Joi from "joi";
import * as Response from '../../utils/response';
import StringUtil from '../../utils/string.util';
import Parameters from '../../../constants/settings.constants';
import * as RoleConstants from '../../../constants/role.constants';
import Cache from '../../../config/cache.config';
import SendMsgUtil from '../../utils/send.msg';

export default class UserController {

    /**
     * TODO 商户登录
     * @returns {function()}
     */
    static async postSignIn(request, reply) {
        request.log(['userLogin', '商户登录'], {
            phone: request.payload.phone,
            password: request.payload.password,
            time: new Date()
        });

        let phone = request.payload.phone;
        let password = request.payload.password;
        try {
            reply(await UserService.signIn(phone, password));
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 管理员登录
     * @returns {function()}
     */
    static async postAdminSignIn(request, reply) {
        request.log(['userLogin', '管理员登录'], {
            email: request.payload.email,
            password: request.payload.password,
            time: new Date()
        });

        let email = request.payload.email;
        let password = request.payload.password;
        try {
            reply(await UserService.postAdminSignIn(email, password));
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取手机验证码
     * @param request
     * @param reply
     */
    static async getPhoneCode(request, reply) {
        try {
            let phone = request.query.phone;
            let code = StringUtil.getNoncestr(4);
            await SendMsgUtil.sendMsg(phone, code, 26214);
            reply(Response.ok('发送成功', {
                code: code
            }));
        } catch (err) {
            console.error(err);
            reply(Response.internal('发送失败'));
        }
    };
    
    /**
     * TODO 获取商户列表
     * @param request
     * @param reply
     */
    static async getUsers(request, reply) {
        let user = request.user;
        let status = request.query.status;

        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.getUsers(status));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取下属商户列表
     * @param request
     * @param reply
     */
    static async getUnderUsers(request, reply) {
        let user = request.user;
        let level = request.query.level;

        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await UserService.getUnderUsers(user._id, level));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 注册商户
     * @param request
     * @param reply
     */
    static async addUser(request, reply) {
        request.log(['addUser', '注册商户'], request.payload);

        let realName = request.payload.realName;
        let password = request.payload.password;
        let phone = request.payload.phone;
        let qq = request.payload.qq;
        let email = request.payload.email;
        let city = request.payload.city;
        let address = request.payload.address;
        let remark = request.payload.remark;
        let parent = request.payload.parent;

        try {
            reply(await UserService.addUser(realName, password, phone, qq, email,
                city, address, parent, remark));
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 生成总商户
     * @param request
     * @param reply
     */
    static async generatorBaseCode(request, reply) {
        request.log(['addBaseUser', '生成基础商户'], request.payload);

        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.addBaseUser());
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 启用/禁用商户
     * @param request
     * @param reply
     */
    static async updateUserStatus(request, reply) {
        request.log(['diableUser', '禁用商户'], {
            _id: request.payload._id,
            time: new Date()
        });

        let _id = request.payload._id;
        let status = request.payload.status;
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.updateUserStatus(_id, status));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取商户信息
     * @param request
     * @param reply
     */
    static async getUser(request, reply) {
        let _id = request.query._id;

        try {
            reply(await UserService.getUser(_id));
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取总商户信息
     * @param request
     * @param reply
     */
    static async getBaseUser(request, reply) {
        let user = request.user;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.getBaseUser());
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 修改商户密码
     * @param request
     * @param reply
     */
    static async putUserPwd(request, reply) {
        let user = request.user;
        let originPwd = request.payload.originPwd;
        let newPwd = request.payload.newPwd;
        let type = request.payload.type;

        try {
            if (user.userType != RoleConstants.USER_TYPE_GENERAL) {
                reply(Response.forbidden('没有权限'));
            } else {
                reply(await UserService.putUserPwd(user._id, originPwd, newPwd, type));
            }

        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 获取管理员列表
     * @param request
     * @param reply
     */
    static async getOperators(request, reply) {
        let user = request.user;

        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.getOperators());
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 新增管理员
     * @param request
     * @param reply
     */
    static async postOperator(request, reply) {
        let user = request.user;

        let realName = request.payload.realName;
        let email = request.payload.email;
        let password = request.payload.password;
        let auth = request.payload.auth;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.addOperator(realName, email, password, auth));
            }
        } catch (err) {
            reply(err);
        }
    };

    /**
     * TODO 修改管理员信息
     * @param request
     * @param reply
     */
    static async putOperator(request, reply) {
        let user = request.user;

        let _id = request.payload._id;
        let status = request.payload.status;
        let auth = request.payload.auth;
        try {
            if (user.userType != RoleConstants.USER_TYPE_ADMIN) {
                reply(Response.forbidden('你不是管理员，没有权限'));
            } else {
                reply(await UserService.updateOperator(_id, status, auth));
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
            case RouterConstants.POST_USER_LOGIN:
                return new HandleConfig(describe,
                    {
                        payload : {
                            phone: Joi.string().required(),
                            password: Joi.string().required()
                        }
                    }, this.postSignIn
                ).doHandle();
            case RouterConstants.POST_ADMIN_LOGIN:
                return new HandleConfig(describe,
                  {
                      payload : {
                          email: Joi.string().required(),
                          password: Joi.string().required()
                      }
                  }, this.postAdminSignIn
                ).doHandle();
            case RouterConstants.GET_PHONE_CODE:
                return new HandleConfig(describe,
                  {
                      query : {
                          phone : Joi.string().required()
                      }
                  }, this.getPhoneCode
                ).doHandle();
            case RouterConstants.GET_USERS:
                return new HandleConfig(describe,
                  {
                      query : {
                          status: Joi.number().required(),
                          token : Joi.string().required()
                      }
                  }, this.getUsers
                ).doHandle();
            case RouterConstants.GET_UNDER_USERS:
                return new HandleConfig(describe,
                    {
                        query : {
                            level: Joi.number().required(),
                            token : Joi.string().required()
                        }
                    }, this.getUnderUsers
                ).doHandle();
            case RouterConstants.DELETE_USER:
                return new HandleConfig(describe,
                  {
                      payload : {
                          _id : Joi.string().required(),
                          status : Joi.number().required(),
                          token : Joi.string().required()
                      }
                  }, this.updateUserStatus
                ).doHandle();
            case RouterConstants.POST_USER:
                return new HandleConfig(describe,
                  {
                      payload : {
                          realName: Joi.string().required(),
                          password: Joi.string().required(),
                          phone: Joi.string().empty(''),
                          qq: Joi.any().empty(''),
                          email: Joi.any().empty(''),
                          city: Joi.string().required(),
                          address: Joi.string().required(),
                          remark: Joi.any().empty(''),
                          parent: Joi.string().required()
                      }
                  }, this.addUser
                ).doHandle();
            case RouterConstants.POST_BASE_CODE:
                return new HandleConfig(describe,
                    {
                        payload : {
                            token : Joi.string().required()
                        }
                    }, this.generatorBaseCode
                ).doHandle();
            case RouterConstants.GET_USER:
                return new HandleConfig(describe,
                    {
                        query : {
                            _id: Joi.string().required(),
                            token : Joi.string().required()
                        }
                    }, this.getUser
                ).doHandle();
            case RouterConstants.PUT_USER_PWD:
                return new HandleConfig(describe,
                    {
                        payload : {
                            originPwd: Joi.any().empty(''),
                            newPwd: Joi.string().required(),
                            type: Joi.number().required(),
                            token : Joi.string().required()
                        }
                    }, this.putUserPwd
                ).doHandle();
            case RouterConstants.GET_TOP_PARENT_USER:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getBaseUser
                ).doHandle();
            case RouterConstants.GET_OPERATORS:
                return new HandleConfig(describe,
                    {
                        query : {
                            token : Joi.string().required()
                        }
                    }, this.getOperators
                ).doHandle();
            case RouterConstants.POST_OPERATOR:
                return new HandleConfig(describe,
                    {
                        payload : {
                            realName : Joi.string().required(),
                            email : Joi.string().required(),
                            password : Joi.string().required(),
                            auth : Joi.array().required(),
                            token : Joi.string().required()
                        }
                    }, this.postOperator
                ).doHandle();
            case RouterConstants.PUT_OPERATOR:
                return new HandleConfig(describe,
                    {
                        payload : {
                            _id : Joi.string().required(),
                            status : Joi.string(),
                            auth : Joi.array(),
                            token : Joi.string().required()
                        }
                    }, this.putOperator
                ).doHandle();
            default:
                break;
        }
    }
}