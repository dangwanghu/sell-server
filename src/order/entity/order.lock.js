'use strict';

import Mongoose, {Schema} from 'mongoose';

const modelName = "OrderLock";
const collectionName = "order_lock";

// 订单待入账
const schema = new Schema({
    time: {
        type: String,
        optional: true,
        default: null
        // 付款时间
    },
    phone: {
        type: String,
        optional: true,
        default: null
        // 付款手机号
    },
    aliPayOrderNum: {
        type: String,
        optional: true,
        default: null
        // 支付宝流水号
    },
    userName: {
        type: String,
        optional: true,
        default: null
        // 付款人姓名
    },
    money: {
        type: String,
        optional: true,
        default: null
        // 收款金额
    },
    keymd5: {
        type: String,
        optional: true,
        default: null
        // 校验码
    },
    remark: {
        type: String,
        optional: true,
        default: null
        // 未入账原因
    },
    status: {
        type: Number,
        optional: true,
        default: 0
        // 0-缴纳金额小于约定金额 1-商户编码不存 2-商户编码不存在，并且缴纳金额小于约定金额
    }
});

// ****************************** DAO *****************************/
schema.statics.findOneByProperties = async function(obj) {
    return await this.model(modelName).findOne(obj);
};

schema.statics.findAllListByProperties = async function(obj) {
    return await this.model(modelName).find(obj).sort({time: -1});
};

schema.statics.findPaginationListByProperties = async function(obj, skip, limit) {
    return await this.model(modelName).find(obj).sort({time: -1}).skip(skip).limit(limit);
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

export default Mongoose.model(modelName, schema, collectionName);
