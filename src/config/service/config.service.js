'use strict';

import * as Response from '../../utils/response';
import Config from '../entity/config';
import Cache from '../../../config/cache.config';
import Parameters from '../../../constants/settings.constants';

export default class ConfigService {

    /**
     * TODO 获取所有的系统设置
     * @returns {Array}
     */
    static async getAllSystemConfigs() {
        try {
            // TODO 查询全部系统设置
            let result = await Config.getAllSystemConfigs();

            // 格式化数据
            result = result.toClient();

            return Response.ok('成功获取系统所有设置信息', result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     * TODO 更新系统设置项
     * @param key
     * @param value
     */
    static async updateSystemConfig(key, value, status) {
        try {
            // TODO 1.查询设置
            let result = await Config.getAllSystemConfigs();
            let config = result != null ? result.config : [];

            let isExist = false;
            for (let item of config) {
                if (item.key == key) {
                    item.value = value == null ? item.value : value;
                    item.status = status == null ? item.status : status;
                    isExist = true;
                    break;
                }
            }

            if (!isExist) {
                config.push({key: key, value: value, status: 1});
            }

            // TODO 2.更新指定项
            await Config.updateSystemConfig(config);

            // TODO 3.更新缓存
            await Cache.setCache(Parameters.cache.sysConfigKey, config);

            return Response.ok('成功更新系统设置信息', null);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     * TODO 获取用户的所有设置项
     * @param userId
     */
    static async getUserConfigs(userId) {

        try {
            // TODO 查询用户全部设置
            let result = await Config.getUserConfigs(userId);

            // 格式化数据
            result = result.toClient();

            return Response.ok('成功获取用户所有设置信息', result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    /**
     * TODO 更新用户设置项
     * @param userId
     * @param key
     * @param value
     */
    static async updateUserConfig(userId, key, value, status) {

        try {
            // TODO 1.查询设置
            let result = await Config.getUserConfigs(userId);

            let config = result != null ? result.config : [];

            let isExist = false;
            for (let item of config) {
                if (item.key == key) {
                    item.value = value == null ? item.value : value;
                    item.status = status == null ? item.status : status;
                    isExist = true;
                    break;
                }
            }

            if (!isExist) {
                config.push({key: key, value: value, status: 1});
            }

            // TODO 2.更新指定项
            await Config.updateUserConfig(userId, config);

            return Response.ok('成功更新用户设置信息', null);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

}