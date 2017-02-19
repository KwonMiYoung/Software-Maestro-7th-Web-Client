var express = require('express');
var fs = require('fs');
var router = express.Router();

router.post('/', function (req, res) {
    var user_id = req.body.user_id;
    var user_password = req.body.password;
    user_password = req.encrypt(user_password);

    req.sql('SELECT * FROM user WHERE email=?', [user_id], function (err, rows) {
        if (err) {
            res.send({status: false, code: 1, err: err});
            return;
        }

        if (rows.length == 0) {
            res.send({status: false, code: 2, err: 'No Such Email'});
            return;
        }

        var db_user_id = rows[0].user_id;
        var db_password = rows[0].password;
        var db_user_status = rows[0].user_status;
        var db_email = rows[0].email;

        if (user_password !== db_password) {
            res.send({status: false, code: 3, err: 'Password Mismatch'});
            return;
        }

        req.sql('SELECT * FROM user_meta WHERE user_id=? ORDER BY ts ASC;', [user_id], function (err, rows) {
            var meta = {};
            if (!err)
                for (var i = 0; i < rows; i++)
                    meta[rows[i].key] = rows[i].value;

            console.log(req.session);

            req.session.user = {
                id: db_user_id,
                user_status: db_user_status,
                email: db_email,
                meta: meta
            };

            var logs = req.logger.getLog();

            req.sql('UPDATE visitlog SET user_id=? WHERE client_key=?', [db_user_id, logs.client_key], function (err) {
                if (err)
                    console.log(err);

                req.sql('INSERT INTO user_accesslog SET ?', logs, function (err) {
                    if (err)
                        console.log(err);

                    console.log(req.session);

                    res.send({status: true, data: req.session.user});
                });
            });
        });
    });
});


module.exports = router;