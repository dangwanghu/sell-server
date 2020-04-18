'use strict';

import Parameters from '../../../constants/settings.constants';
import Cache from '../../../config/cache.config';
import Config from '../../config/entity/config';

export default class ConfigUtil {

    static async getSystemCache(key) {
        try {
            let data = await Cache.getCache(Parameters.cache.sysConfigKey);
            if (data != null) {
                for (let item of data) {
                    if (item.key == key) {
                        return item.value;
                    }
                }
            } else {
                let result = await Config.getAllSystemConfigs();
                let config = result != null ? result.config : [];
                await Cache.setCache(Parameters.cache.sysConfigKey, config);
                for (let item of config) {
                    if (item.key == key) {
                        return item.value;
                    }
                }
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}