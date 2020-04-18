'use strict';

import ConfigController from './controller/config.controller';
import * as RouterConstants from '../../constants/routes.constants';
import Parameters from '../../constants/settings.constants';

export default [
    {
        path: Parameters.api.prefix1_1 + '/admin/system/configs',
        method: 'GET',
        config: ConfigController.config('[admin]获取所有设置列表', RouterConstants.GET_ALL_SYSTEM_CONFIG)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/system/config',
        method: 'PUT',
        config: ConfigController.config('[admin]更新系统设置项', RouterConstants.PUT_SYSTEM_CONFIG)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/config/{userId}',
        method: 'GET',
        config: ConfigController.config('[all]获取用户的所有设置项', RouterConstants.GET_USER_ALL_CONFIG)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/config',
        method: 'PUT',
        config: ConfigController.config('[all]更新用户设置项', RouterConstants.PUT_USER_CONFIG)
    },
    {
        path: Parameters.api.prefix1_1 + '/system/config',
        method: 'GET',
        config: ConfigController.config('[all]获取系统某设置项', RouterConstants.GET_SYSTEM_CONFIG)
    }
];
