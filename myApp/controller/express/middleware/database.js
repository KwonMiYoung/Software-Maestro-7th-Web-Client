
module.exports = (opts)=> {
    return function (req, res, next) {
        console.log('database');

        var connect = function (query, post, callback) {
            var mysql = require('mysql');
            var con = mysql.createConnection(opts);
            con.query(query, post, function (err, resp) {
                con.end();
                if (callback) callback(err, resp);
            });
        };

        var dummy = function () {
        };

        var database = {};
        database.user = {};

        database.user.get = function (user_id, callback) {
            if (!callback) callback = dummy;
            var result = {};
            var error = new Error();

            connect('SELECT * FROM user WHERE user_id=?;', [user_id], function (err, rows) {
                if (err) {
                    error = err;
                    callback(error);
                    return;
                }

                if (rows.length == 0) {
                    error.message = 'Not Found';
                    callback(error);
                    return;
                }

                result.user_id = rows[0].user_id;
                result.password = rows[0].password;
                result.email = rows[0].email;
                result.user_activation_key = rows[0].user_activation_key;
                result.user_status = rows[0].user_status;
                result.registered = rows[0].registered;

                callback(null, result);
            });
        };

        database.user.meta = {};
        database.user.meta.get = function (user_id, callback) {
            if (!callback) callback = dummy;

            var error = new Error();
            database.user.get(user_id, function (err, result) {
                if (err) {
                    error = err;
                    callback(error);
                    return;
                }

                result.meta = {};
                connect('SELECT * FROM user_meta WHERE user_id=?;', [user_id], function (err, rows) {
                    if (err) {
                        error = err;
                        callback(error);
                    }

                    for (var i = 0; i < rows.length; i++)
                        result.meta[rows[i].key] = rows[i].value;

                    if (!result.meta['profile-basic-displayname'])
                        result.meta['profile-basic-displayname'] = result.user_id;

                    callback(null, result);
                });
            });
        };


        req.database = database;
        next();
    };
};