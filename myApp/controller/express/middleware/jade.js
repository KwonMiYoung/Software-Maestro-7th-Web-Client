
module.exports = () => {
    return function (req, res, next) {
        console.log('jade');

        var jade = {};

        jade.date = new Date().toISOString().substring(0, 10);
        // language pack
        jade.language = {};

        var acceptLanguage = req.locale;
        var defaultPack = JSON.parse(JSON.strip(require('fs').readFileSync('./languages/default.json')));

        if (require('fs').existsSync('./languages/' + acceptLanguage + '.json')) jade.language = JSON.parse(require('fs').readFileSync('./languages/' + acceptLanguage + '.json'));
        else jade.language = defaultPack;

        for (var key in defaultPack)
            if (!jade.language[key]) jade.language[key] = defaultPack[key];

        // pass query
        jade.query = req.query;
        jade.host = req.protocol + '://' + req.get('host');

        if (req.session) jade.session = req.session;
        else jade.session = {};

        if (req.url == '/')
            req.url = '/index';

        // ui components
        jade.component = {
            less: [],
            angular: null
        };

        var path = req.url.split('/');
        var base = './src/component/less';
        var urlbase = '/less';
        for (var i = 0; i < path.length; i++) {
            base += path[i];
            urlbase += path[i];
            if (require('fs').existsSync(base + '.less'))
                jade.component.less.push(urlbase + '.css');
            base += '/';
            urlbase += '/';
        }

        if (require('fs').existsSync('./src/component/angular' + req.url + '.js'))
            jade.component.angular = '/angular' + req.url + '.js';

        jade.page = req.url;

        // export
        req.jade = jade;
        next();
    };
};