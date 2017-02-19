var express = require('express');
var router = express.Router();
var fs = require('fs');

var nodemailer = require('nodemailer');
var receive;
var password=150; //임시 비밀번호
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: 'gmail',
    auth: {
        user: 'kojj1033',
        pass: 'aqajyj1416'
    }
});

router.post('/', function (req, res) {
    var jade = req.jade;
    var user_id = req.body.user_name;
    var password = req.body.password;
    var email = req.body.email;
    var user_activation_key = '';
    var user_status = 0;
    var registered = new Date().toISOString();
    var html = require('fs').readFileSync('./resource/email-welcome.html') + '';


    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    for (var i = 0; i < 10; i++)
        user_activation_key += possible.charAt(Math.floor(Math.random() * possible.length));

    html = html.replace('$title', jade.language['emailformat-signup-title']);
    html = html.replace('$subtitle', jade.language['emailformat-signup-subtitle']);
    html = html.replace('$content', jade.language['emailformat-signup-content']);
    html = html.replace('$user', user_id);
    html = html.replace('$url', req.protocol + '://' + req.get('host') + '/api/user/signup/verify?key=' + user_activation_key);

    password = req.encrypt(password);

    if (!user_id) {
        res.send({status: false, code: 3, msg: '아이디가 공백입니다.'});
        return;
    }

    if (!password) {
        res.send({status: false, code: 4, msg: '비밀번호가 공백입니다.'});
        return;
    }

    if (!email) {
        res.send({status: false, code: 5, msg: '이메일이 공백입니다.'});
        return;
    }

    var english = /^[A-Za-z0-9]*$/;
    if (!english.test(user_id)) {
        res.send({status: false, code: 6, msg: '아이디는 알파벳과 숫자만 허용됩니다.'});
        return;
    }

    var posts = {
        user_id: user_id,
        password: password,
        email: email,
        user_activation_key: user_activation_key,
        user_status: user_status,
        registered: registered,
        user_gender: req.body.gender,
        user_age: req.body.age,
    };

    req.sql('INSERT INTO user SET ?;', posts, function (err) {
        if (err) {
            req.sql('SELECT * FROM user WHERE email=?;', posts.email, function (err, rows) {
                if (rows.length > 0) {
                    res.send({status: false, code: 7, err: err, msg: '이미 등록된 이메일입니다.'});
                    return;
                }

                res.send({status: false, code: 8, err: err, msg: '이미 등록된 아이디입니다.'});
                return;
            });
            return;
        }

        //password=receive; //값 넘겨받기
        var mailOptions = {
            from: '[1gong]<random>',
            to: email,
            subject: '1gong 가입을 축하드립니다!',
            // text: '평문 보내기 테스트 '
            html:'<p><span style=" font: italic bold 1.5em/1em Georgia, serif ;">안녕하세요, 고객님</span></p>'+
            '<p><span style=" font: italic bold 1.5em/1em Georgia, serif ;">뉴스추천 서비스 가입을 축하드립니다!</span></p>' +
            '<p><span style=" font: italic bold 1.5em/1em Georgia, serif ;">서비스를 이용하시려면 아래 링크를 누르세요.</span></p>'+
            '<p><span style=" font: italic bold 1.5em/1em Georgia, serif ;"><a href="http://siya.co.kr:27018/">뉴스추천서비스 바로가기</a></span></p>'//이메일 첫줄
            //+ ' <a href="https://member.daum.net/find/password.do?action=daumid-check">이메일 주소를 인증합니다.</a> <p>'  //넘어갈 페이지 링크
            //+'<video src="https://www.tesla.com/sites/default/files/videos/model3/HERO_15s_WEB.mp4?20161116" controls="controls" width="800" height="600" autoplay=""autoplay></video>' //동영상
            // +'<img src="https://www.tesla.com/tesla_theme/assets/img/models/section-hero-background@2x.jpg?20170115  width="400" height="300"/></p>' //이미지
        };
    });
});


router.get("/verify", function (req, res, next) {
    let data = req.query;

    req.mysql.query("UPDATE user SET user_activation_key = 'Verified', user_status = 1 WHERE user_activation_key = ?", [data.key], function (err) {
        if(err){
            console.log(err);
            return;
        }
    });
});

module.exports = router;