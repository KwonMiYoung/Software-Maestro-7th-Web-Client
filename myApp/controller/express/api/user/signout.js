var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var session = req.session;
    session.destroy(function () {
        res.send({status: true});
    });
});

module.exports = router;