'use strict';

import WithdrawController from './controller/withdraw.controller';
import * as RouterConstants from '../../constants/routes.constants';
import Parameters from '../../constants/settings.constants';

export default [
    {
        path: Parameters.api.prefix1_1 + '/user/withdraw',
        method: 'POST',
        config: WithdrawController.config('[user]提交提现申请', RouterConstants.POST_WITHDRAW)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/withdraw',
        method: 'PUT',
        config: WithdrawController.config('[admin]处理提现申请', RouterConstants.PUT_WITHDRAW)
    },
    {
        path: Parameters.api.prefix1_1 + '/admin/withdraws',
        method: 'GET',
        config: WithdrawController.config('[admin]获取提现申请列表', RouterConstants.GET_USER_WITHDRAWS)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/withdraws',
        method: 'GET',
        config: WithdrawController.config('[user]获取提现历史记录', RouterConstants.GET_APPLY_WITHDRAWS)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/bank_card',
        method: 'POST',
        config: WithdrawController.config('[user]添加银行卡', RouterConstants.POST_BANK_CARD)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/bank_card',
        method: 'DELETE',
        config: WithdrawController.config('[user]移除银行卡[逻辑删除]', RouterConstants.DELETE_BANK_CARD)
    },
    {
        path: Parameters.api.prefix1_1 + '/user/bank_cards',
        method: 'GET',
        config: WithdrawController.config('[user]获取银行卡列表[只查启用的]', RouterConstants.GET_BANK_CARDS)
    }
];