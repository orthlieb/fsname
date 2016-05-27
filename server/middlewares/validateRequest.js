var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;

module.exports = function(req, res, next) {

    // When performing a cross domain request, you will receive
    // a preflighted request first. This is to check if our the app
    // is safe.

    // We skip the token outh for [OPTIONS] requests.
    //if(req.method == 'OPTIONS') next();

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    if (token && key) {
        try {
            var decoded = jwt.decode(token, require('../config/secret')());

            var now = Date.now();
            if (decoded.exp <= now) {
                console.log("validateRequest.js--token expired: ", decoded.exp, " > ",now);
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Token Expired"
                });
                return;
            }

            // Authorize the user to see if s/he can access our resources
            var dbUser = validateUser(key); // The key would be the logged in user's username
            if (dbUser) {
                if (key != decoded.email) {
                    // This token doesn't belong to you.
                    console.log("validateRequest.js--token.email does not match key: ", token.email, " != ", key);
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": "Invalid Token or Key"
                    });
                    return;
                }

                if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
                    console.log("validateRequest.js--validate user: ", key, " for ", req.url);
                    next(); // To move to next middleware
                } else {
                    console.log("validateRequest.js--not authorized: ", dbUser.role, " for ", req.url);
                    res.status(403);
                    res.json({
                    "status": 403,
                    "message": "Not Authorized"
                    });
                    return;
                }
            } else {
                // No user with this name exists, respond back with a 401
                console.log("validateRequest.js--invalid user: ", key);
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Invalid User"
                });
                return;
            }
        } catch (err) {
            console.log("validateRequest.js--system error: ", err);
            res.status(500);
            res.json({
                "status": 500,
                "message": "Oops something went wrong",
                "error": err
            });
        }
    } else {
        console.log("validateRequest.js--missing token: ", token, " or key: ", key);
        res.status(401);
        res.json({
            "status": 401,
            "message": "Missing Token or Key"
        });
        return;
    }
};
