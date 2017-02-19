var express = require("express");
var moment = require("moment");

var router = express.Router();

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
router.get("/", function (req, res) {
    let data = req.query;

    res.send({status: true})
});


router.get("/priority", function (req, res, next) {
    let data = req.query.data;

    for (let i = 0; i < data.length; i++) {
        req.mysql.query("UPDATE post SET priority = ? WHERE post_id = ?", [parseInt(data[i].p), parseInt(data[i].id)], function (err) {
            if (err) {
                res.send({
                    status: false,
                    err: err
                });
                return;
            }
        });
    }

    res.send({status: true});
    return;
});


router.get("/read", function (req, res, next) {
    let data = req.query;
    let upsert = {
        user_id: 'Ghost',
        msg: 'Post Read',
        extra: data.post_id,
    };

    if(req.session && req.session.user && req.session.user.id){
        upsert.user_id = req.session.user.id;
    }

    req.mysql.query("INSERT INTO log SET ?", [upsert], function (err) {
        var sendErr = (err) => {
            if (err) {
                console.log(err);

                res.send({
                    status: false,
                    err: err
                });
                return;
            }
        }
        var update = () => {
            req.mysql.query("UPDATE post SET view = view + 1 WHERE post_id = ?", [data.post_id], function (err) {
                sendErr(err);

                res.send({
                    status: true,
                });
            });
        }

        if (err) {
            req.mysql.query("UPDATE log SET user_id=? WHERE user_id=? AND msg=? AND extra=?", [upsert.user_id, upsert.user_id, upsert.msg, upsert.extra], function (err) {
                sendErr(err);
            });
            update();
            return;
        }
        update();
    });
});


router.get("/like", function (req, res, next) {
    let data = req.query;
    let upsert = {
        user_id: 'Ghost',
        msg: 'Post Evaluation - Like',
        extra: data.post_id,
    };

    if(req.session && req.session.user && req.session.user.id){
        upsert.user_id = req.session.user.id;
    } else{
        res.send({
            status: false,
            err: 'Session Not Found'
        });
        return;
    }


    req.mysql.query("INSERT INTO log SET ?", [upsert], function (err) {
        var sendErr = (err) => {
            if (err) {
                console.log(err);

                res.send({
                    status: false,
                    err: err
                });
                return;
            }
        }
        var update = () => {
            req.mysql.query("UPDATE post SET post_like = post_like + 1 WHERE post_id = ?", [data.post_id], function (err) {
                sendErr(err);

                res.send({
                    status: true,
                });
            });
        }

        if (err) {
            req.mysql.query("UPDATE log SET user_id=? WHERE user_id=? AND msg=? AND extra=?", [upsert.user_id, upsert.user_id, upsert.msg, upsert.extra], function (err) {
                sendErr(err);
            });
            update();
            return;
        }
        update();
    });
});
router.get("/dislike", function (req, res, next) {
    let data = req.query;
    let upsert = {
        user_id: 'Ghost',
        msg: 'Post Evaluation - Dislike',
        extra: data.post_id,
    };

    if(req.session && req.session.user && req.session.user.id){
        upsert.user_id = req.session.user.id;
    } else{
        res.send({
            status: false,
            err: 'Session Not Found'
        });
        return;
    }

    req.mysql.query("INSERT INTO log SET ?", [upsert], function (err) {
        var sendErr = (err) => {
            if (err) {
                console.log(err);

                res.send({
                    status: false,
                    err: err
                });
                return;
            }
        }
        var update = () => {
            req.mysql.query("UPDATE post SET post_dislike = post_dislike + 1 WHERE post_id = ?", [data.post_id], function (err) {
                sendErr(err);

                res.send({
                    status: true,
                });
            });
        }

        if (err) {
            req.mysql.query("UPDATE log SET user_id=? WHERE user_id=? AND msg=? AND extra=?", [upsert.user_id, upsert.user_id, upsert.msg, upsert.extra], function (err) {
                sendErr(err);
            });
            update();
            return;
        }
        update();
    });
});

router.get("/meta", function (req, res, next) {
    let data = req.query;


    req.mysql.query("UPDATE meta SET value=? WHERE meta_id=? AND key_id=?", [data.data, data.meta_id, 'kind'], function (err) {
        if (err) {
            res.send({
                status: false,
                err: err
            });
            return;
        }

        res.send({status: true});
        return;
    });
});


module.exports = router;