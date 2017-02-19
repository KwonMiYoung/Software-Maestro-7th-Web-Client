'use strict';

module.exports = ()=> {
    return function (req, res, next) {
        console.log('logger');

        console.log(req.session);

        if(!req.sessionID)
            req.sessionID = 0;
        if(!req.session)
            req.session = {};

        if (!req.session.key) req.session.key = 'sess:' + req.sessionID;

        if (!req.session.log) req.session.log = {};

        if (req.path && req.path.length > 0) {
            if (!req.session.log[req.path]) req.session.log[req.path] = 0;
            req.session.log[req.path] = req.session.log[req.path] + 1;
        }


        var visitCount = req.session.log[req.path] ? req.session.log[req.path] : 999;

        var logger = (function () {
            var getLog = function () {
                var result = {};
                result.client_key = req.session.key;
                result.user_id = req.session.user ? req.session.user.id : null;
                result.client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                result.referer = req.header('Referer') || '/';
                result.country_code = '';
                result.from_x = '';
                result.from_y = '';
                result.user_agent = req.headers['user-agent'];

                var uaparser = require('ua-parser-js');
                result.user_agent = JSON.stringify(uaparser(result.user_agent));

                var urlParser = require('url');
                result.referer = urlParser.parse(result.referer).hostname;

                if (result.client_ip) {
                    var geoip = require('geoip-lite');
                    var geo = geoip.lookup(result.client_ip);
                    if (geo) {
                        result.country_code = geo.country;
                        result.from_y = geo.ll[0] + '';
                        result.from_x = geo.ll[1] + '';
                    }
                }

                return result;
            };

            var obj = {};
            obj.visitCount = visitCount;
            obj.getLog = getLog;

            return obj;
        })();

        req.logger = logger;

        if (req.path.indexOf('/blog/') == 0 && visitCount == 1) {
            var urlArray = req.path.split('/');
            var user = urlArray[2];
            var page = urlArray[3];

            if (page == 'profile' || page == 'post') {
                var logs = logger.getLog();
                logs.visit_id = decodeURI(req.path);
                req.sql('INSERT INTO visitlog SET ?', logs, function () {
                    next();
                });
                return;
            }
        }

        next();
    };
};