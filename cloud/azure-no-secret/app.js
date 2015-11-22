var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Pass to next layer of middleware
    return next();
});

app.get('/', function(request, response) {
    response.send('Hello World!');
});

app.post('/venmo', urlencodedParser, function(request, response) {
    var Parse = require('parse').Parse
    var session = request.body.session
    var code = request.body.code
    Parse.initialize("3fbKPbURkYVceP1d95UpCt2KTTHgl0U0LjXDXwYw", "T9i1AvuIWIz4vpobQYy0qZpV0KIaJwKsjxg5B5f6");
    Parse.User.become(session).then(function (user) {
        data = {
            "client_id": "",
            "client_secret": "",
            "code": code
        }
        var request = require('request');
        request.post({
            url:     "https://api.venmo.com/v1/oauth/access_token",
            form:    data
        }, function(error, venmoResponse, body) {
            var object = JSON.parse(body)
            // save access token
            var VenmoToken = Parse.Object.extend('venmoToken')
            var vToken = new VenmoToken()

            vToken.set('user', user)
            vToken.set('venmo', object.access_token)
            vToken.setACL(new Parse.ACL(user));
            vToken.save(null, {
                success: function(vToken) {
                    // bind id to user
                    user.set('venmo_id', object.user.id)
                    user.save(null, {
                        success: function(user) {
                            response.send(JSON.stringify({
                                code:200
                            }))
                        }
                    })
                },
                error: function(error) {
                    response.send(JSON.stringify(error))
                }
            });
        });
    }, function (error) {
        response.send(JSON.stringify(error))
    });
})

app.post('/venmo_pay', urlencodedParser, function(request, response) {
    var Parse = require('parse').Parse
    var session = request.body.session
    var dest = request.body.dest
    var target_userid = request.body.userid
    var sandbox_dest = "145434160922624933" // for sandbox
    var amount  = request.body.amount
    var sandbox_amount = 0.1 // for sandbox
    var note = request.body.note
    Parse.initialize("3fbKPbURkYVceP1d95UpCt2KTTHgl0U0LjXDXwYw", "T9i1AvuIWIz4vpobQYy0qZpV0KIaJwKsjxg5B5f6");
    Parse.User.become(session).then(function (user) {
        var venmoToken = Parse.Object.extend("venmoToken")
        var query = new Parse.Query(venmoToken)
        query.equalTo('user', user)
        var timeLim = new Date(Date.now() - 30*24*60*60*1000)
        query.greaterThan('createdAt', timeLim)
        query.descending('createdAt')
        query.first({
            success: function(vToken) {
                if (!vToken) {
                    response.send(JSON.stringify({code:404, message:"no token."}))
                } else {
                    var request = require('request')
                    var data = {
                        access_token: vToken.get('venmo'),
                        user_id: sandbox_dest,
                        note: note,
                        amount: sandbox_amount
                    };
                    request.post({
                        url:     "https://sandbox-api.venmo.com/v1/payments",
                        form:    data
                    }, function(error, venmoResponse, body) {
                        var object = JSON.parse(body)
                        console.log(object)
                        if (object.data.payment.status != "settled") {
                            response.send(JSON.stringify({code: 405, message:'payment failed.'}))
                        } else {
                            var targetUser = new Parse.User()
                            targetUser.id = target_userid

                            var payment = Parse.Object.extend('payment')
                            var np = new payment()

                            np.set('payer', user)
                            np.set('target', targetUser)
                            np.set('note', note)
                            np.set('amount', amount)
                            np.set('type', 'venmo')
                            np.save(null, {
                                success: function(np) {
                                    response.send(JSON.stringify({code:200}))
                                },
                                error: function(error) {
                                    response.send(JSON.stringify(error))
                                }
                            });
                        }
                    });
                }
            },
            error: function(error) {
                response.send(JSON.stringify(error))
            }
        })
    }, function (error) {
        response.send(JSON.stringify(error))
    });
})



app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
