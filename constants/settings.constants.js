import StringUtil from '../src/utils/string.util';

const devServer = '192.168.1.100';
const proServer = '106.14.81.137';

export default {
    server: {
        port: 3000,
        devImgPath: 'D:\\/data\\/images\\/',
        proImgPath: 'C:\\/Users\\/work\\/data\\/images\\/',
        devImgUrl: 'http://' + devServer + ':' + 3000 + '/images/',
        proImgUrl: 'http://' + proServer + ':' + 3000 + '/images/',
        devQrCodeUrl: 'http://' + devServer + ':' + 8080 + '/product/detail?parent=',
        proQrCodeUrl: 'http://' + proServer + ':' + 8080 + '/product/detail?parent=',
        serverUrl: 'http://' + proServer + ':' + 8080 + '/user/login'
    },
    database: {
        devHost: 'localhost',
        proHost: 'localhost',
        port: 27017,
        db: "sell-plat",
        username: "sell",
        password: "sell"
    },
    cache: {
        devHost: 'localhost',
        proHost: 'localhost',
        port: 6379,
        keyPrev: "sell:",
        password: "redis123",
        sysConfigKey: "sysConfig",
        productKey: "product"
    },
    key: {
        privateKey: "SELL_WORKER",
        tokenExpiration: 604800,
        tokenExpirationDescription: "168 hour",
        wxApiTokenExpiration: 3600,
        pvExpiration: 500
    },
    api: {
        prefix: "/api",
        prefix1_1: "/api/v1.1",
        prefix1_2: "/api/v1.2",
        prefix1_3: "/api/v1.3",
        prefix1_4: "/api/v1.4"
    },
    proxy: {
        serverToken: "woingi929k48fj2372he8dn289kmoi3",
        notifyKey: "1a0296256cb73bc00164d8c36a9a93",
        orderMoney: 199.00,
        orderMoneyFenProfit: [9, 8, 7, 6, 5, 4, 3, 2, 1],
        fenProfitLevel: 9,
        msgUrl: 'http://v.juhe.cn/sms/send'
    },
    getServerRootPath: function() {
        if (process.env.NODE_ENV == 'production') {
            return this.server.proImgPath;
        }
        return this.server.devImgPath;
    },
    getServerUrl: function() {
        if (process.env.NODE_ENV == 'production') {
            return this.server.proImgUrl;
        }
        return this.server.devImgUrl;
    },
    getQrCodeUrl: function() {
        if (process.env.NODE_ENV == 'production') {
            return this.server.proQrCodeUrl;
        }
        return this.server.devQrCodeUrl;
    }
}