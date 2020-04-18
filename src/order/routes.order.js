'use strict';

import OrderController from './controller/order.controller';
import * as RouterConstants from '../../constants/routes.constants';
import Parameters from '../../constants/settings.constants';

export default [
    {
        path: Parameters.api.prefix1_1 + '/admin/orders',
        method: 'GET',
        config: OrderController.config('[admin]管理员查询订单列表', RouterConstants.GET_ADMIN_ORDERS)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/orders',
        method: 'GET',
        config: OrderController.config('[user]用户查询订单列表', RouterConstants.GET_USER_ORDERS)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/profits',
        method: 'GET',
        config: OrderController.config('[admin]指定时间端内的收入和支出', RouterConstants.GET_DURING_PROFITS)
    },
    {
        path: Parameters.api.prefix1_1 + '/server/order/notify',
        method: 'POST',
        config: OrderController.config('[server]订单结果服务器通知', RouterConstants.POST_SERVER_PAY_NOTIFY)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/lock/orders',
        method: 'GET',
        config: OrderController.config('[admin]获取待补单列表', RouterConstants.GET_ORDER_LOCKS)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/unlock/order',
        method: 'PUT',
        config: OrderController.config('[admin]补单', RouterConstants.PUT_UNLOCK_ORDER)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/order',
        method: 'PUT',
        config: OrderController.config('[admin]修改订单', RouterConstants.PUT_ORDER)
    }
];