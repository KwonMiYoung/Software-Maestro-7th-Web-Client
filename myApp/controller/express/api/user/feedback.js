var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var feedback = {}

    if (!req.session || !req.session.user || !req.session.user.id) {
        res.send({status: false, code: 401, err: 'Unauthorized'});
        return;
    }
    feedback.user_id = req.session.user.id;
    feedback.category = req.query.category;
    feedback.comment = req.query.comment;
    feedback.submittime = new Date().toISOString();

    req.sql('INSERT INTO feedback SET ?;', feedback, function (err) {
        if (err) {
            res.send({status: false, code: 2, err: err});
            return;
        }

        res.send({status: true});
    });


});

module.exports = router;