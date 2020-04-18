'use strict';

import Mongoose, {Schema} from 'mongoose';

const modelName = "Withdraw";
const collectionName = "withdraw";

// 提现
const schema = new Schema({
    amount: {
        type: Number,
        required: true
        // 金额
    },
    card: {
        type: Schema.Types.ObjectId,
        ref: 'BankCard',
        required: true
        // 提现银行卡
    },
    remark: {
        type: String,
        optional: true,
        default: null
        // 备注
    },
    status: {
        type: Number,
        optional: true,
        default: 0
        // 0-待处理 1-提现成功 2-提现被驳回
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // 提现申请人
    },
    createTime: {
        type: Date,
        required: true
        // 申请时间
    },
    updateTime: {
        type: Date,
        optional: true,
        default: null
        // 更新时间
    }
});

// ****************************** DAO *****************************/
schema.statics.findOneByProperties = async function(obj) {
    return await this.model(modelName).findOne(obj).populate('user', '_id agentNumber realName phone')
        .populate('card', '_id bank deposit cardNumber')
        .exec(function(err, docs) {
            return docs;
        });
};

schema.statics.findAllListByProperties = async function(obj) {
    return await this.model(modelName).find(obj).sort({createTime: -1}).populate('user', '_id agentNumber realName')
        .populate('card', '_id bank deposit cardNumber')
        .exec(function(err, docs) {
            return docs;
        });
};

schema.statics.findPaginationListByProperties = async function(obj, skip, limit) {
    return await this.model(modelName).find(obj).sort({createTime: -1}).skip(skip).limit(limit).populate('user', '_id agentNumber realName')
        .populate('card', '_id bank deposit cardNumber')
        .exec(function(err, docs) {
            return docs;
        });
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
