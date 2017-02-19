var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var jade = req.jade;
    var email = req.query.email;

    if (!email) {
        res.send({status: false, code: 1, err: 'NOT ENOUGH QUERY'});
        return;
    }

    req.sql('SELECT * FROM user WHERE email=?', [email], function (err, rows) {
        if (err) {
            res.send({status: false, code: 9, err: err});
            return;
        }

        if (rows.length == 0) {
            res.send({status: false, code: 3, err: '입력하신 이메일은 등록되지 않은 정보입니다.'});
            return;
        }

        var new_pwd = '';
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()~";
        for (var i = 0; i < 12; i++)
            new_pwd += possible.charAt(Math.floor(Math.random() * possible.length));
        var enc_pwd = req.encrypt(new_pwd);

        req.sql('UPDATE user SET password=? WHERE email=?', [enc_pwd, email], function (err) {
            if (err) {
                res.send({status: false, code: 2, err: err});
                return;
            }

            var html = require('fs').readFileSync('./resource/email-welcome.html') + '';
            html = html.replace('$title', jade.language['emailformat-resetpassword-title']);
            html = html.replace('$subtitle', jade.language['emailformat-resetpassword-subtitle']);
            html = html.replace('$content', jade.language['emailformat-resetpassword-content']);

            html = html.replace('$password', new_pwd);
            html = html.replace('$url', req.protocol + '://' + req.get('host'));

            req.sendmail({
                to: email,
                subject: jade.language['emailformat-resetpassword-title'],
                html: html,
                callback: function (err) {
                    if (err) {
                        res.send({status: false, code: 1, err: err});
                        return;
                    }

                    res.send({status: true});
                }
            });
        });
    });
});

module.exports = router;