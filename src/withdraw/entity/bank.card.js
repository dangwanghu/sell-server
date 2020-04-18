'use strict';

import Mongoose, {Schema} from 'mongoose';

const modelName = "BankCard";
const collectionName = "bank_card";

// 银行卡
const schema = new Schema({
    bank: {
        type: String,
        required: true
        // 银行
    },
    deposit: {
        type: String,
        required: true
        // 开户行
    },
    cardNumber: {
        type: String,
        required: true
        // 卡号
    },
    status: {
        type: Number,
        optional: true,
        default: 1
        // 0-禁用 1-启用
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // 所属人
    },
    createTime: {
        type: Date,
        required: true
        // 创建时间
    }
});

// ****************************** DAO *****************************/
schema.statics.findOneByProperties = async function(obj) {
    return await this.model(modelName).findOne(obj).populate('user', '_id agentNumber realName')
        .exec(function(err, docs) {
            return docs;
        });
};

schema.statics.findAllListByProperties = async function(obj) {
    return await this.model(modelName).find(obj).sort({createTime: -1});
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

export default Mongoose.model(modelName, schema, collectionName);
