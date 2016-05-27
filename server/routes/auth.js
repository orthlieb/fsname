var jwt = require('jwt-simple');
var crypto = require('crypto-js');
var _ = require('underscore');

var auth = {
    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username == '' || password == '') {
          res.status(401);
          res.json({
            "status": 401,
            "message": "Missing credentials"
          });
          return;
        }

        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validate(username, password);

        if (!dbUserObj) { // If authentication fails, we send a 401 back
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }

        // If authentication is success, we will generate a token
        // and dispatch it to the client

        res.json(genToken(dbUserObj));
    },

    validate: function(username, password) {
        var db = app.get('db');
        var dbUserObj = null;

        try {
            var user = db.users.findOneSync({ email: username });
            var hash = crypto.MD5(user.salt + password).toString();
            if (hash == user.password)
                dbUserObj = _.pick(user, [ "first", "last", "role", "email" ]);
        } catch (err) {
        };

        return dbUserObj;
    },

    validateUser: function(username) {
        var db = app.get('db');
        var dbUserObj = null;

        try {
            var user = db.users.findOneSync({ email: username });
            dbUserObj = _.pick(user, [ "first", "last", "role", "email" ]);
        } catch (err) {
        };

        return dbUserObj;
    }
};

// private method
function genToken(user) {
    var expireDate = expiresIn(7); // 7 days
    var token = jwt.encode({
        email: user.email,
        exp: expireDate
    }, require('../config/secret')());

    return {
        token: token,
        expires: expireDate,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;
