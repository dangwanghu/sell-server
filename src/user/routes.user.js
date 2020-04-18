'use strict';

import UserController from './controller/user.controller';
import * as RouterConstants from '../../constants/routes.constants';
import Parameters from '../../constants/settings.constants';

export default [
    {
        path: Parameters.api.prefix1_1 + '/user/register',
        method: 'POST',
        config: UserController.config('[all]注册商户', RouterConstants.POST_USER)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/login',
        method: 'POST',
        config: UserController.config('[all]管理员登录', RouterConstants.POST_ADMIN_LOGIN)
    },
    {
        path: Parameters.api.prefix1_1 + '/users',
        method: 'GET',
        config: UserController.config('[admin]获取商户列表', RouterConstants.GET_USERS)
    },
    {
        path: Parameters.api.prefix1_1 + '/user',
        method: 'DELETE',
        config: UserController.config('[admin]启用/禁用商户', RouterConstants.DELETE_USER)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/login',
        method: 'POST',
        config: UserController.config('[all]商户登录', RouterConstants.POST_USER_LOGIN)
    },
    {
        path: Parameters.api.prefix1_1 + '/phone/code',
        method: 'GET',
        config: UserController.config('[user]手机验证码', RouterConstants.GET_PHONE_CODE)
    },
    {
        path: Parameters.api.prefix1_1 + '/baseCode',
        method: 'POST',
        config: UserController.config('[admin]生成第一个总商户', RouterConstants.POST_BASE_CODE)
    },
    {
        path: Parameters.api.prefix1_1 + '/user',
        method: 'GET',
        config: UserController.config('[all]获取商户信息', RouterConstants.GET_USER)
    },
    {
        path: Parameters.api.prefix1_1 + '/under/users',
        method: 'GET',
        config: UserController.config('[user]获取下属商户列表', RouterConstants.GET_UNDER_USERS)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/password',
        method: 'PUT',
        config: UserController.config('[user]修改商户密码[或提现密码]', RouterConstants.PUT_USER_PWD)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/base/info',
        method: 'GET',
        config: UserController.config('[admin]获取总商户信息', RouterConstants.GET_TOP_PARENT_USER)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/operators',
        method: 'GET',
        config: UserController.config('[admin]获取操作员列表', RouterConstants.GET_OPERATORS)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/operator',
        method: 'POST',
        config: UserController.config('[admin]新增操作员', RouterConstants.POST_OPERATOR)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/operator',
        method: 'PUT',
        config: UserController.config('[admin]修改操作员信息', RouterConstants.PUT_OPERATOR)
    }
];