
module.exports = function () {
    return function (req, res, next) {
        console.log('session-updater');

        if (!req.session)
            req.session = {};

        req.session.update = function () {
            console.log('session update');
        };
        next();
    };
};