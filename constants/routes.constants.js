'use strict';
/*******************************Router********************************/

// TODO 商户登录
export const POST_USER_LOGIN = "postUserLogin";
// TODO 管理员登录
export const POST_ADMIN_LOGIN = "postAdminLogin";
// TODO 获取手机验证码
export const GET_PHONE_CODE = "getPhoneCode";

// TODO 新增总商户
export const POST_BASE_CODE = "postBaseCode";
// TODO 新增商户
export const POST_USER = "postUser";
// TODO admin获取商户列表
export const GET_USERS = "getUsers";
// TODO 删除商户
export const DELETE_USER = "deleteUser";
// TODO 获取商户信息
export const GET_USER = "getUser";
// TODO 获取下属商户列表
export const GET_UNDER_USERS = "getUnderUsers";
// TODO 修改商户提现密码
export const PUT_USER_PWD = "putUserPwd";
// TODO 获取总商户信息
export const GET_TOP_PARENT_USER = "getTopParentUser";
// TODO admin获取操作员列表
export const GET_OPERATORS = "getOperators";
// TODO admin新增操作员
export const POST_OPERATOR = "postOperator";
// TODO admin启用禁用操作员
export const PUT_OPERATOR = "putOperator";

// TODO 获取系统所有的设置项
export const GET_ALL_SYSTEM_CONFIG = "getAllSystemConfig";
// TODO 设置系统指定项
export const PUT_SYSTEM_CONFIG = "putSystemConfig";
// TODO 获取商户所有设置项
export const GET_USER_ALL_CONFIG = "getUserAllConfig";
// TODO 设置商户设置项
export const PUT_USER_CONFIG = "putUserConfig";
// TODO 获取系统某设置项
export const GET_SYSTEM_CONFIG = "getSystemConfig";

// TODO 管理员-获取订单列表
export const GET_ADMIN_ORDERS = "getAdminOrders";
// TODO 用户-获取订单列表
export const GET_USER_ORDERS = "getUserOrders";
// TODO 用户-获取指定时间端内的收入和支出
export const GET_DURING_PROFITS = "getDuringProfits";
// TODO 用户-服务器接收异步通知
export const POST_SERVER_PAY_NOTIFY = "postServerPayNotify";
// TODO 用户-获取待补单列表
export const GET_ORDER_LOCKS = "getOrderLocks";
export const PUT_UNLOCK_ORDER = "putUnlockOrder";
export const PUT_ORDER = "putOrder";

// TODO 用户提现申请
export const POST_WITHDRAW = "postWithdraw";
// TODO 管理员处理提现申请
export const PUT_WITHDRAW = "putWithdraw";
// TODO 管理员获取提现申请列表
export const GET_USER_WITHDRAWS = "getUserWithdraws";
// TODO 用户获取提现申请记录
export const GET_APPLY_WITHDRAWS = "getApplyWithdraws";

// TODO 添加银行卡
export const POST_BANK_CARD = "postBankCard";
// TODO 删除银行卡
export const DELETE_BANK_CARD = "deleteBankCard";
// TODO 获取银行卡列表
export const GET_BANK_CARDS = "getBankCards";

/*******************************No Auth Defined**********************/
export const noAuthList = [
    '/api/v1.1/user/login',
    '/api/v1.1/admin/login',
    '/api/v1.1/admin/system/configs',
    '/api/auth/js_api_ticket',
    '/api/v1.1/user/register',
    '/api/v1.1/phone/code',
    '/api/v1.1/server/order/notify',
    '/api/v1.1/system/config'
];

export const serverAuthList = [
    '/api/v1.1/baseCode'
];