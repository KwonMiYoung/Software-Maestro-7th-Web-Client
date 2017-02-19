var express = require("express");
var router = express.Router();
var moment = require("moment");


/* Routing Modules */
router.get("/", function (req, res, next) {
    res.send({
        status: true,
        data: req.session.user,
    });
});


module.exports = router;