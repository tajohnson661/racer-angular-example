var http = require('http');
var express = require('express');
var liveDbMongo = require('livedb-mongo');
var redis = require('redis').createClient();
var racerBrowserChannel = require('racer-browserchannel');
var racer = require('racer');
racer.use(require('racer-bundle'));

//redis.select(14);
var store = racer.createStore({
    db: liveDbMongo('mongodb://localhost:27017/racer-angular-example?auto_reconnect', {safe: true}),
    redis: redis
});

app = express();
app.use(express.static('app'))
    .use(racerBrowserChannel(store))
    .use(store.modelMiddleware());

app.use(function(err, req, res, next) {
    console.error(err.stack || (new Error(err)).stack);
    res.send(500, 'Something broke!');
});

function scriptBundle(cb) {
    // Use Browserify to generate a script file containing all of the client-side
    // scripts, Racer, and BrowserChannel
    store.bundle(__dirname + '/app/racer-service.js', function(err, js) {
        if (err) return cb(err);
        cb(null, js);
    });
}
// Immediately cache the result of the bundling in production mode, which is
// deteremined by the NODE_ENV environment variable. In development, the bundle
// will be recreated on every page refresh
if (racer.util.isProduction) {
    scriptBundle(function(err, js) {
        if (err) return;
        scriptBundle = function(cb) {
            cb(null, js);
        };
    });
}

app.get('/racerstuff-script.js', function(req, res, next) {
    scriptBundle(function(err, js) {
        if (err) return next(err);
        res.type('js');
        res.send(js);
    });
});

app.get('/racer/:roomId', function(req, res, next) {
    console.log('get /racer/:roomId.  roomId is: ' + req.params.roomId);
    var roomName = req.params.roomId;
    // Only handle URLs that use alphanumberic characters, underscores, and dashes
    if (!/^[a-zA-Z0-9_-]+$/.test(roomName)) return next();
    // Prevent the browser from storing the HTML response in its back cache, since
    // that will cause it to render with the data from the initial load first

    var model = req.getModel();
    var $room = model.at('rooms.' + roomName);
    var $noteIds = $room.at('noteIds');
    // Subscribe is like a fetch but it also listens for updates
    $room.subscribe(function (err) {
        var id0, id1;

        if (err) {
            return next(err);
        }
        var room = $room.get();
        // If the room doesn't exist yet, we need to create it
        if (!room) {
            model.add('rooms', {
                id: roomName
            });
            id0 = model.add('notes', {
                text: 'Here is some note text',
                roomId: roomName
            });
            id1 = model.add('notes', {
                text: 'Another note',
                roomId: roomName
            });
            $noteIds.set([id0, id1]);
        }
        var queryParams;
        queryParams = { 'roomId': roomName };
        model.query('notes', queryParams).subscribe(function(err) {
            var context, list, aList;
            if (err) {
                return next(err);
            }
            list = model.refList('_page.room', 'notes', $noteIds);
            aList = list.get();
            console.log('list.get is: ');
            console.log(aList);
            console.log('****');
            context = {
                list: list.get(),
                roomName: roomName
            };
            model.bundle(function(err, bundle) {
                if (err) {
                    return next(err);
                }
                context.bundle =  bundle; //JSON.stringify(bundle).replace(/'/g, '&#39;');
                res.send(context);
            });

        });
    });
});

var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function() {
    console.log('Go to http://localhost:' + port);
});
