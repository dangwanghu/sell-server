'use strict';

import Mongoose, {Schema} from 'mongoose';

const modelName = "Config";
const collectionName = "config";

const schema = new Schema({
    owner: {
        type: Schema.Types.Mixed,
        required: true
    },
    config: {
        type: Schema.Types.Mixed,
        optional: true,
        default: []
    },
    updateTime: {
        type: Date,
        optional: true,
        default: new Date()
    }
});

// ****************************** DAO *****************************/
schema.statics.getAllSystemConfigs = async function() {
    return await this.model(modelName).findOne({owner: "system"});
};

schema.statics.getUserConfigs = async function(userId) {
    return await this.model(modelName).findOne({"owner._id": userId});
};

schema.statics.updateSystemConfig = async function(config) {
    return await this.model(modelName).update({owner: "system"}, {$set: {config : config, updateTime: new Date()}}, {upsert : true});
};

schema.statics.updateUserConfig = async function(userId, config) {
    return await this.model(modelName).update({"owner._id": userId}, {$set: {config : config, updateTime: new Date()}}, {upsert : true});
};

schema.methods.toClient = function() {
    return {
        _id: String(this._id),
        owner: this.owner._id,
        config: this.config,
        updateTime: this.updateTime.valueOf()
    }
};

// We Can Do Anythings Before Save Action
// eg: init some properties
schema.pre('save', function(next) {
    next();
});

export default Mongoose.model(modelName, schema, collectionName);
