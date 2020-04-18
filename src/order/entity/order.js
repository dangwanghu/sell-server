'use strict';

import Mongoose, {Schema} from 'mongoose';
import DateUtil from '../../../src/utils/date.util';
import StringUtil from '../../../src/utils/string.util';
import * as Response from '../../../src/utils/response';

const modelName = "Order";
const collectionName = "order";

// 订单
const schema = new Schema({
    orderNum: {
        type: String,
        required: true
        // 订单编号yyyy-MM-dd + 随机四位 + curday(max)
    },
    aliPayOrderNum: {
        type: String,
        optional: true,
        default: null
        // 支付宝订单号
    },
    product: {
        type: String,
        required: true
        // 产品信息
    },
    amount: {
        type: Number,
        required: true
        // 金额
    },
    address: {
        type: String,
        optional: true,
        default: null
        // 地址
    },
    phone: {
        type: String,
        optional: true,
        default: null
        // 联系电话
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
        // 0-未付款 1-已付款待发货 2-已完成
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        // 下单客户信息
    },
    shareProfit: [{
        // 分润
        //[{_id, level, realName, amount},{},{}]
    }],
    createTime: {
        type: Date,
        required: true
        // 下单时间
    },
    createDate: {
        type: String,
        required: true
        // 下单日期
    },
    updateTime: {
        type: Date,
        optional: true,
        default: null
        // 更新时间
    },
    recvTime: {
        type: String,
        optional: true,
        default: null
        // 到账时间
    },
    logisticsInfo: {
        type: String,
        optional: true,
        default: null
        // 物流信息
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
    return await this.model(modelName).find(obj).sort({createTime: -1}).populate('user', '_id agentNumber realName')
        .exec(function(err, docs) {
            return docs;
        });
};

schema.statics.findPaginationListByProperties = async function(obj, skip, limit) {
    return await this.model(modelName).find(obj).sort({createTime: -1}).skip(skip).limit(limit);
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

schema.statics.toClient = function(order, userId) {
    return {
        realName: order.user.realName,
        agentNumber: order.user.agentNumber,
        orderNum: order.orderNum,
        profit: getFenPofitAccount(order.shareProfit, userId)
    }
};

function getFenPofitAccount(profits, userId) {
    for (let profit of profits) {
        if (profit._id == userId) {
            return profit.amount;
        }
    }
}

// 同步获取订单号
schema.statics.synchronizedGeneratorOrderCode = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        self.model(modelName).count({createDate: DateUtil.format(new Date(), 'yyyy-MM-dd')}, function(err, result) {
            if (err) {
                reject(Response.internal('未知错误'));
            } else {
                let seriesNum = result + 1;
                seriesNum = seriesNum < 10 ? ('0' + seriesNum) : seriesNum;
                let orderCode = DateUtil.format(new Date(), 'yyyyMMdd') + seriesNum + StringUtil.getRandomCode(6);
                resolve(orderCode);
            }
        });
    });
};

export default Mongoose.model(modelName, schema, collectionName);
