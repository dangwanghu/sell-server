'use strict';

import Cache from './../config/cache.config';
import UrlFilter from '../src/utils/urlfilter';
import * as Boom from 'boom';

const preHandle = async function(request, reply) {
    // Not Need Auth, So Let You SoSoSoGo!
    if (UrlFilter.isNotNeedValidateAuth(request.route.path)) {
        return reply.continue();
    }

    // Get Token
    let token = request.payload && request.payload.token;
    if (!token) {
        token = request.query.token;
    }
    if (!token) {
        return reply(Boom.unauthorized('Permission denied', 'token'));
    }

    // Server request Need protocol Auth, So Let You SoSoSoGo!
    if (UrlFilter.isServerValidateAuth(request.route.path, token)) {
        return reply.continue();
    }

    // Validate Token
    try {
        let data = await Cache.getCache(token);
        if (data) {
            // Put Current User To Context
            request.user = data;
            return reply.continue();
        }
        return reply(Boom.gatewayTimeout('token过期'));
    } catch (err) {
        console.log(err);
        return reply(Boom.internal());
    }
};

export default class HandleConfig {
    constructor(description, validate, handler, payload) {
        this._description = description;
        this._validate = validate;
        this._handler = handler;
        this._payload = payload;
    }

    doHandle() {
        let config = {
            description : this._description,
            validate : this._validate,
            handler : this._handler,
            cors : true,
            pre: [
                { method: preHandle }
            ],
            tags: ['api'],
            timeout: {
                socket: 900000
            }
        };
        if (this._payload) {
            config.payload = this._payload;
        }
        return config;
    }
}