
module.exports = function (config) {
    return function (req, res, next) {
        var sendmail = function (data) {
            var to = data.to, subject = data.subject, html = data.html, callback = data.callback;

            console.log(config.sendmail);

            var mailserver = {
                user: config.sendmail.user,
                password: config.sendmail.password,
                host: config.sendmail.host,
                ssl: config.sendmail.ssl
            };

            var emailjs = require('emailjs');
            var mail = emailjs.server.connect(mailserver);

            mail.send({
                from: config.sendmail.from,
                to:to,
                subject: subject,
                text: '',
                attachment: {
                    data: html,
                    alternative: true
                }
            }, function (err) {
                callback(err);
            });
        };

        req.sendmail = sendmail;

        next();
    };
};

