var express = require("express");
var router = express.Router();
var moment = require("moment");

var parseDate = function (posts) {
    let today = new Date().toISOString();
    today = moment(today).format("YYYY-MM-DD");

    for (let i = 0; i < posts.length; i++) {
        let date = {
            string: moment(posts[i].date).format("YYYY-MM-DD"),
            year: moment(posts[i].date).format("YYYY"),
            month: moment(posts[i].date).format("MM"),
            day: moment(posts[i].date).format("DD"),
            hour: moment(posts[i].date).format("HH"),
            min: moment(posts[i].date).format("mm"),
            sec: moment(posts[i].date).format("SS"),
        }

        if (date.string == today)
            date.string = moment(posts[i].date).format("HH:mm");
        else
            date.string = moment(posts[i].date).format("YYYY년 MM월 DD일");

        posts[i].date = date;
    }
};

/* Routing Modules */
router.get("/", function (req, res, next) {
    let data = req.query;

    console.log(data.post_id);
    req.mysql.query("DELETE FROM post WHERE post_id=?", [data.post_id], function (err) {
        if (err) {
            res.send({status: false, err: err});
            console.log(err);
            return;
        }

        res.send({status : true});
    });
});

router.get("/comment", function (req, res, next) {
    let data = req.query;

    req.mysql.query("DELETE FROM comment WHERE comment_id=?", [data.comment_id], function (err) {
        if (err) {
            res.send({status: false, err: err});
            console.log(err);
            return;
        }

        req.mysql.query("UPDATE post SET reply = reply - 1 WHERE post_id=?", [data.post_id], function (err) {
            if (err) {
                console.log(err);
                res.send({
                    status: false,
                    err: err
                });
                return;
            }

            res.send({status: true});
        });
    });
});

module.exports = router;