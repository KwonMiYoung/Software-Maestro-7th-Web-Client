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
router.get("/", function (req, res) {
    var data = req.query;

    if(req.session && req.session.user && req.session.user.id){
        data.user_id = req.session.user.id;
    } else{
        res.send({
            status: false,
            err: 'Session Not Found'
        });
        return;
    }

    data.post_status = true;
    data.comment_status = false;
    data.hashtag = '[]';
    data.post_date = moment(new Date().toISOString()).format("YYYY-MM-DD HH:mm:ss");

    console.log(data);

    req.mysql.query("INSERT INTO post SET ?", [data], function (err) {
        if (err) {
            console.log(err);
            res.send({status: false, err: err});
            return
        }
        res.send({status: true})
    });
});

router.get("/comment", function (req, res, next) {
    let data = req.query;
    let comment = {
        comment_parent_id : '',
        post_id : data.post_id,
        user_id : 'Ghost',
        comment_title : data.newcomment.comment_title,
        comment_content : data.newcomment.comment_content,
        comment_user_ip : '',
        comment_agent : '',
    }

    if(req.session && req.session.user && req.session.user.id){
        comment.user_id = req.session.user.id;
    } else{
        res.send({
            status: false,
            err: 'Session Not Found'
        });
        return;
    }

    req.mysql.query("INSERT INTO comment SET ?", [comment], function (err) {
        if (err) {
            res.send({status: false, err: err});
            return;
        }

        req.mysql.query("UPDATE post SET reply = reply + 1 WHERE post_id = ?", [data.post_id], function (err) {
            if (err) {
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

router.get("/meta", function (req, res) {
    var data = req.query;

    req.mysql.query("INSERT INTO meta SET ?", [data], function (err) {
        if (err) {
            console.log(err);
            res.send({status: false, err: err});
            return
        }
        res.send({status: true})
    });
});

module.exports = router;