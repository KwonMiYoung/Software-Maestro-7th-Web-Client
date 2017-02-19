var express = require("express");
var router = express.Router();
var moment = require("moment");

var parseDate = function (posts) {
    let today = new Date().toISOString();
    today = moment(today).format("YYYY-MM-DD");

    for (let i = 0; i < posts.length; i++) {
        let date = {
            string: moment(posts[i].post_date).format("YYYY-MM-DD"),
            year: moment(posts[i].post_date).format("YYYY"),
            month: moment(posts[i].post_date).format("MM"),
            day: moment(posts[i].post_date).format("DD"),
            hour: moment(posts[i].post_date).format("HH"),
            min: moment(posts[i].post_date).format("mm"),
            sec: moment(posts[i].post_date).format("SS"),
        }

        if (date.string == today)
            date.string = moment(posts[i].post_date).format("A hh:mm");
        else
            date.string = moment(posts[i].post_date).format("YYYY년 MM월 DD일");

        posts[i].post_date = date;
    }
};


/* Routing Modules */
router.get("/", function (req, res, next) {
    let category_id = req.query.category;
    let data = req.query;

    req.mysql.query("SELECT * FROM old_posts WHERE category_name=? " + data.sort, [category_id], function (err, rows) {
        if (err) {
            res.send({
                status: false,
                data: [],
                err: err
            });
            return;
        }

        parseDate(rows);

        res.send({
            status: true,
            data: rows,
        });
    });
});

router.get("/comment", function (req, res, next) {
    let data = req.query;

    req.mysql.query("SELECT * from comment WHERE post_id=? ORDER BY comment_id DESC", [data.post_id], function (err, rows) {
        if (err) {
            res.send({status: false, err: err});
            console.log(err);
            return;
        }

        parseDate(rows);
        res.send({status: true, data: rows});
    });
});


// New Portfolio function

router.get("/meta", function (req, res, next) {
    let data = req.query;
    let temp = {};

    req.mysql.query("SELECT * FROM meta WHERE meta_id=?", [data.meta_id], function (err, rows) {
        if (err) {
            res.send({
                status: false,
                data: [],
                err: err
            });
            return;
        }

        for (var i = 0; i < rows.length; i++) {
            let row = rows[i];
            row.value = row.value.replace(/\n\t/gim, '');
            temp[row.key_id] = JSON.parse(row.value);
        }

        res.send({
            status: true,
            data: temp,
        });
    });
});

router.get("/post", function (req, res, next) {
    req.mysql.query("SELECT * FROM post ORDER BY priority ASC", function (err, rows) {
        if (err) {
            res.send({
                status: false,
                data: [],
                err: err
            });
            return;
        }

        parseDate(rows);

        res.send({
            status: true,
            data: rows,
        });
    });
});



module.exports = router;