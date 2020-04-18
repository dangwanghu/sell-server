'use strict';

import * as RouterConstants from '../../constants/routes.constants';
import Parameters from '../../constants/settings.constants';

var urlfilter = {};

// IsNeedAuth?
urlfilter.isNotNeedValidateAuth = function(url) {
    return isContainElement(RouterConstants.noAuthList, url);
};

urlfilter.isServerValidateAuth = function(url, token) {
    return isContainElement(RouterConstants.serverAuthList, url) && (token == Parameters.proxy.serverToken);
};

var isContainElement = function(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
};


export default urlfilter;
