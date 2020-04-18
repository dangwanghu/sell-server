'use strict';

import Parameters from './../constants/settings.constants';

var redis = require("redis");
var host = process.env.NODE_ENV == 'production' ? Parameters.cache.proHost : Parameters.cache.devHost;

var client = redis.createClient(Parameters.cache.port, host, {
    auth_pass: Parameters.cache.password
});

client.on("error", function(err) {
    console.log("Error：" + err);
});

client.on("connect", function(err) {
    if (!err) {
        console.log("Cache Connection Success!");
    }
});

const KEY_PREV = Parameters.cache.keyPrev;
const cache = {};

cache.getCache = function(key) {
    return new Promise((resolve, reject) => {
        client.get(KEY_PREV + key, function(err, reply) {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(reply));
                } catch (e) {
                    reject("JSON格式错误");
                }
            }
        });
    });
};

cache.getKeysByPrefix = function(keyPrev) {
    return new Promise((resolve, reject) => {
        client.keys(keyPrev + "*", function(err, reply) {
            if (err) {
                reject(err);
            } else {
                resolve(reply);
            }
        });
    });
};

cache.setCache = function(key, value, expire) {
    return new Promise((resolve, reject) => {
        client.set(KEY_PREV + key, JSON.stringify(value), function(err, reply) {
            if (err) {
                reject(err);
            }

            if (expire) {
                client.expire(key, expire);
            }

            try {
                resolve(JSON.parse(reply));
            } catch (e) {
                resolve(reply);
            }
        });
    });
};

cache.removeCache = function(key) {
    return new Promise((resolve, reject) => {
        client.del(KEY_PREV + key, function(err, reply) {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
};

export default cache;