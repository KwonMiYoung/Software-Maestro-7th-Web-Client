
module.exports = ()=> {
    return function (req, res, next) {
        console.log('auth');

        req.auth = function (status, callback) {
            if (status == 'public') {
                callback(true);
                return;
            }

            if(status =='private') {
                if(req.session &&req.session.user && req.session.user.id) {
                    callback(true);
                }
                return;
            }
        };

        next();
    };
};