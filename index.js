'use strict';

// Babel
require("babel-register")({
    presets: [ 'es2015',"stage-3" ]
});
require("babel-polyfill");

// 数据库
require('./config/database.config');

// 定时任务
require('./src/service.js').start();

let server = require('./src/server');
startServer();

function startServer() {
    server.start((err) => {
        if (err) {
            console.log('服务器发生错误：');
            console.log(err.stack);
        } else {
            console.log('Server Running At ' + server.info.uri + '!, Time：' + new Date().toLocaleString());
        }
    });
}

// 服务器挂掉后自动重启
process.on('uncaughtException', function(err) {
    console.log(err);
    server.stop((err) => {
        if (err) {
            console.log('服务器停止报错');
        }
        console.log("服务器发生错误，即将重启...");
    });
    startServer();
});
