let Address = {};

Address.rootPath = '/m';

console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)

if (process.env.NODE_ENV === 'development') {
    Address.path = '//' + location.host;
    Address.ajaxPath = '/mweb';
    Address.mgAjaxPath = '/mg';
    Address.wxAjaxPath = '/wxweb';
    Address.gwAjaxPath = '/gw';
    Address.tradeAjaxPath = '/trade';
    Address.cpsPath = '/gw/cps';
    Address.eventAjaxPath = '/event';
}

if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'pre' || process.env.NODE_ENV === 'uat') {
    Address.path = '//' + location.host;
    Address.ajaxPath = '/mweb';
    Address.mgAjaxPath = '/mg';
    Address.gwAjaxPath = '/gw';
    Address.wxAjaxPath = '/wxweb';
    Address.tradeAjaxPath = '/trade';
    Address.cpsPath = '/gw/cps';
    Address.eventAjaxPath = '/event';
}

if (process.env.NODE_ENV === 'production') {
    Address.path = '//' + location.host;
    Address.ajaxPath = '';
    Address.mgAjaxPath = '/mg';
    Address.gwAjaxPath = '/gw';
    Address.wxAjaxPath = '/wechat';
    Address.tradeAjaxPath = '/trade';
    Address.cpsPath = '/gw/cps';
    Address.eventAjaxPath = '/event';
}

Address.url = function (path) {
    return location.protocol + Address.path + path;
};

Address.ajaxUrl = function (path) {
    return Address.ajaxPath + path;
};

Address.mgAjaxUrl = function (path) {
    return location.protocol + Address.path + Address.mgAjaxPath + path;
};

Address.gwAjaxUrl = function (path) {
    return location.protocol + Address.path + Address.gwAjaxPath + path;
};

Address.tradeAjaxUrl = function (path) {
    return Address.tradeAjaxPath + path;
};

Address.cpsAjax = function (path) {
    return location.protocol + Address.path + Address.cpsPath + path;
};

Address.mWebAjax = function (path) {
    return location.protocol + Address.path + Address.ajaxPath + path;
};

Address.auth = function (path) {
    return location.protocol + Address.path + Address.ajaxPath + path;
};

Address.wxAjaxUrl = function (path) {
    return Address.wxAjaxPath + path;
};

Address.eventAjaxUrl = function (path) {
    return location.protocol + Address.path + Address.eventAjaxPath + path;
};

window.__Address__ = Address;
module.exports = Address;
