'use strict';

import HandleConfig from '../../../config/handle.config';
import * as RouterConstants from '../../../constants/routes.constants';
import ConfigService from '../service/config.service';
import Joi from "joi";
import * as Response from '../../utils/response';
import * as RoleConstants from '../../../constants/role.constants';
import ConfigUtil from '../../config/util/config.util';
import Parameters from '../../../constants/settings.constants';
import fs from 'fs-io';
import StringUtil from '../../utils/string.util';

export default class ConfigController {

    /**
     * TODO 获取所有的系统设置
     * @returns {function()}
     */
    static async getAllSystemConfigs(request, reply) {
        try {
            reply(await ConfigService.getAllSystemConfigs());
        } catch (err) {
            reply(err);
        }
    }

    /**
     * TODO 更新系统设置项
     * @param request
     * @param reply
     */
    static async updateSystemConfig(request, reply) {
        request.log(['updateSystemConfig', '更新系统设置'], request.payload);

        let key = request.payload.key;
        let value = request.payload.value;
        let status = request.payload.status;
        let admin = request.user;

        try {
            reply(await ConfigService.updateSystemConfig(key, value, status));
        } catch (err) {
            reply(err);
        }
    }

    /**
     * TODO 获取用户的所有设置项
     * @param request
     * @param reply
     */
    static async getUserConfigs(request, reply) {
        let userId = request.params.userId;
        try {
            reply(await ConfigService.getUserConfigs(userId));
        } catch (err) {
            reply(err);
        }
    }

    /**
     * TODO 更新用户设置项
     * @param request
     * @param reply
     */
    static async updateUserConfig(request, reply) {
        let userId = request.payload.userId;
        let key = request.payload.key;
        let value = request.payload.value;
        let status = request.payload.status;
        try {
            reply(await ConfigService.updateUserConfig(userId, key, value, status));
        } catch (err) {
            reply(err);
        }
    }

    /**
     * TODO 获取APP当前版本
     * @param request
     * @param reply
     */
    static async getAppVersionInfo(request, reply) {
        try {
            let appVersionInfo = await ConfigUtil.getSystemCache(Parameters.cache.appVersionKey);
            reply(Response.ok('成功获取系统设置信息', appVersionInfo));
        } catch (err) {
            reply(err);
        }
    }

    /**
     * TODO 获取APP当前版本
     * @param request
     * @param reply
     */
    static async updateAppVersionInfo(request, reply) {
        // 先上传文件
        let ipaFile = null;
        let apkFile = null;

        let data = request.payload;

        if (data.ipaFile && data.ipaFile.bytes) {
            let ipaName = "assist." + data.version + ".ipa";
            let fileData = await fs.readFile(data.ipaFile.path);
            await fs.writeFile(Parameters.getServerRootPath() + ipaName, fileData);
            ipaFile = Parameters.getServerUrl() + ipaName;
        }
        // 删除临时文件
        await fs.unlink(data.ipaFile.path);

        if (data.apkFile && data.apkFile.bytes) {
            let apkName = "assist." + data.version + ".apk";
            let fileData = await fs.readFile(data.apkFile.path);
            await fs.writeFile(Parameters.getServerRootPath() + apkName, fileData);
            apkFile = Parameters.getServerUrl() + apkName;
        }
        // 删除临时文件
        await fs.unlink(data.apkFile.path);

        // 再保存结果
        let value = {
            version: data.version,
            info: data.info,
            ipaFile: ipaFile,
            apkFile: apkFile,
            iosUrl: data.iosUrl
        };
        let key = Parameters.cache.appVersionKey;
        let admin = request.user;

        if (parseInt(admin.userType) != RoleConstants.USER_TYPE_ADMIN) {
            reply(Response.unauthorized('你不是运营，没有权限'));
        } else {
            await ConfigService.updateSystemConfig(key, value, 1);
            reply.redirect(Parameters.server.adminUrl);
        }
    }

    /**
     * TODO 获取系统某项设置
     * @param request
     * @param reply
     */
    static async getSystemConfig(request, reply) {
        try {
            let key = request.query.key;
            let value = await ConfigUtil.getSystemCache(key);
            reply(Response.ok('成功获取系统设置信息', value));
        } catch (err) {
            reply(err);
        }
    }
    /**
     * TODO 路由配置
     * @param describe
     * @param actionType
     * @returns {HandleConfig}
     */
    static config(describe, actionType) {
        try {
            switch (actionType) {
                case RouterConstants.GET_ALL_SYSTEM_CONFIG:
                    return new HandleConfig(describe,
                        {
                            query: {
                                token: Joi.string().required()
                            }
                        }, this.getAllSystemConfigs
                    ).doHandle();
                case RouterConstants.PUT_SYSTEM_CONFIG:
                    return new HandleConfig(describe,
                        {
                            payload: {
                                key: Joi.string().required(),
                                value: Joi.any().required(),
                                status: Joi.number().valid(0).valid(1),
                                token: Joi.string().required()
                            }
                        }, this.updateSystemConfig
                    ).doHandle();
                case RouterConstants.GET_USER_ALL_CONFIG:
                    return new HandleConfig(describe,
                        {
                            params: {
                                userId: Joi.string().required()
                            },
                            query: {
                                token: Joi.string().required()
                            }
                        }, this.getUserConfigs
                    ).doHandle();
                case RouterConstants.PUT_USER_CONFIG:
                    return new HandleConfig(describe,
                        {
                            payload: {
                                userId: Joi.string().required(),
                                key: Joi.string().required(),
                                value: Joi.string(),
                                status: Joi.number().valid(0).valid(1),
                                token: Joi.string().required()
                            }
                        }, this.updateUserConfig
                    ).doHandle();
                case RouterConstants.GET_SYSTEM_CONFIG:
                    return new HandleConfig(describe,
                        {
                            query: {
                                key: Joi.string().required()
                            }
                        }, this.getSystemConfig
                    ).doHandle();
                default:
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    }
}
