'use strict';

// Declare internals

const internals = {};

const ERROR_CONSTANTS = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    200: 'OK',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Time-out'
};

internals.error = function(status, message) {
    return {
        statusCode : status,
        message : message,
        error : ERROR_CONSTANTS[status]
    };
};

internals.ok = function(message, data) {
    return {
        statusCode : 200,
        body : data,
        message : message
    };
};

// 200
exports.ok = function(message, data) {
    return internals.ok(message, data);
};

// 4xx Client Errors
// 400
exports.badRequest = function(message) {
    return internals.error(400, message);
};
// 401
exports.unauthorized = function(message) {
    return internals.error(401, message);
};
// 403
exports.forbidden = function(message) {
    return internals.error(403, message);
};


// 5xx Server Errors
// 500
exports.internal = function(message) {
    return internals.error(500, message);
};
// 501
exports.notImplemented = function(message) {
    return internals.error(501, message);
};
// 504
exports.gatewayTimeout = function(message) {
    return internals.error(504, message);
};

