'use strict';

import Mongoose, {Schema} from 'mongoose';
import DateUtil from '../../../src/utils/date.util';
import StringUtil from '../../../src/utils/string.util';
import * as Response from '../../../src/utils/response';

const modelName = "User";
const collectionName = "user";

// 商户
const schema = new Schema({
    agentNumber: {
        type: String,
        optional: true,
        default: null
        // 商户编号yyyy-MM-dd + 随机四位 + curday(max)
    },
    realName: {
        type: String,
        required: true,
        index: true
    },
    withdrawPassword: {
        type: String,
        optional: true,
        default: null

    },
    password: {
        type: String,
        optional: true,
        default: null
    },
    balance: {
        type: Number,
        optional: true,
        default: 0
        // 余额
    },
    headImg: {
        type: String,
        optional: true,
        default: null
    },
    city: {
        type: String,
        optional: true,
        default: null
    },
    address: {
        type: String,
        optional: true,
        default: null
        // 地址
    },
    email: {
        type: String,
        optional: true,
        default: null
    },
    phone: {
        type: String,
        optional: true,
        default: null
    },
    qq: {
        type: String,
        optional: true,
        default: null
    },
    userType: {
        type: Number,
        optional: true,
        default: 7
        // 用户类型 7-普通 10-管理
    },
    remark: {
        type: String,
        optional: true,
        default: null
    },
    token: {
        type: String,
        optional: true,
        default: null
    },
    status: {
        type: Number,
        optional: true,
        default: 1
        // 0-未加盟 1-已加盟启用 2-已禁用
    },
    hasChild: {
        type: Number,
        optional: true,
        default: 0
        // 0-无 1-有
    },
    qrCode: {
        type: String,
        optional: true,
        default: null
        // 二维码
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        optional: true
        // 我的上级
    },
    latestLoginTime: {
        type: Date,
        optional: true,
        default: null
        // 最后一次登录时间
    },
    createTime: {
        type: Date,
        optional: true,
        default: null
        // 创建时间
    },
    registerDate: {
        type: String,
        optional: true,
        default: null
        // 注册日期
    },
    updateTime: {
        type: Date,
        optional: true,
        default: null
        // 更新时间
    },
    orderCount: {
        type: Number,
        optional: true,
        default: 0
        // 交易笔数: 指的是卖出多少笔
    },
    auth: [{
        // 权限
    }]
});

// ****************************** DAO *****************************/
schema.statics.findOneByProperties = async function(obj) {
    return await this.model(modelName).findOne(obj);
};

schema.statics.findAllListByProperties = async function(obj) {
    return await this.model(modelName).find(obj).sort({createTime: 1});
};

schema.statics.findPaginationListByProperties = async function(obj, skip, limit) {
    return await this.model(modelName).find(obj).skip(skip).limit(limit);
};

schema.statics.findTotalByProperties = async function(obj) {
    return await this.model(modelName).count(obj);
};

schema.statics.removeById = async function(_id) {
    return await this.model(modelName).remove({_id: _id});
};

schema.statics.updateObj = async function(obj) {
    return await this.model(modelName).update({_id: obj._id}, obj);
};

schema.statics.toClient = function(user) {
    return {
        realName: user.realName,
        agentNumber: user.agentNumber,
        orderCount: user.orderCount
    }
};

// 同步获取商户号
schema.statics.synchronizedGeneratorAgentCode = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        self.model(modelName).count({registerDate: DateUtil.format(new Date(), 'yyyy-MM-dd')}, function(err, result) {
            if (err) {
                reject(Response.internal('未知错误'));
            } else {
                let seriesNum = result + 1;
                seriesNum = seriesNum < 10 ? ('0' + seriesNum) : seriesNum;
                let agentCode = DateUtil.format(new Date(), 'yyyyMMdd') + seriesNum + StringUtil.getRandomCode(6);
                resolve(agentCode);
            }
        });
    });
};

export default Mongoose.model(modelName, schema, collectionName);
