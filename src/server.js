'use strict';

import {Server} from 'hapi';
import Parameters from './../constants/settings.constants';
import Routes from './routes';

const server = new Server({
    connections: {
        routes: {
            // 配置图片相对路径
            files: {
                relativeTo: Parameters.getServerRootPath()
            }
        }
    }
});
let plugins = [];

console.log('Server runing in: ' + (process.env.NODE_ENV || 'develop'));
// server host default local machine name
server.connection({
    port: Parameters.server.port
});

// Plugins management
let hapiLoggerConfig = {
    name: 'assist',
    transport: 'file',
    logFilePath: process.env.NODE_ENV == 'production' ? process.env.LOG_PATH : '../matlo-server.log'
};

plugins.push(require('inert'));
plugins.push(require('vision'));
plugins.push({
    register: require('hapi-logger'),
    options: hapiLoggerConfig
});
plugins.push({
    register: require('hapi-swagger'),
    options: {
        documentationPath: '/api',
        lang: 'zh-cn',
        sortEndpoints: 'path',
        info: {
            title: '营销管理平台在线API',
            version: '1.0',
            contact: {
                name: 'Tiger', email: 'dangwanghu000@126.com'
            }
        }
    }
});

server.register(plugins, (err) => {
    if (err) {
        throw err;
    }
    // 图片服务器
    server.route({
        method: 'GET',
        path: '/images/{path}',
        handler: function (request, reply) {
            reply.file(request.params.path);
        }
    });
    console.log('Plugins Load Finished!');
});

// Global Routes
server.route(Routes);

module.exports = server;
