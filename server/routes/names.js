var _ = require("underscore");

function processError(res, err) {
    console.log(err.message);
    res.status(500);
    res.json({ message: err.message });
}

var names = {

    getAll: function(req, res) {
        var db = app.get("db");
        try {
            db.run("select * from names", function(err, names) {
                if (err) return processError(res, err);
                res.status(200);
                res.json({
                    length: names.length,
                    content: names
                });
            });
        } catch (e) {
            processError(res, e);
        }
    },

    getOne: function(req, res) {
        var db = app.get("db");
        try {
            db.names.findOne({ name_id: req.params.id }, function(err, name) {
                if (err) return processError(res, err);
                res.status(200);
                res.json({
                    length: 1,
                    content: [ name ]
                });
            });
        } catch (e) {
            processError(res, e);
        }
    },

    search: function(req, res) {
            var db = app.get("db");
            try {
                db.run("SELECT * FROM Names WHERE Name ILIKE '%" + req.query.name + "%'", function(err, names) {
                    if (err) return processError(res, err);
                    res.status(200);
                    res.json({
                        length: names.length,
                        content: names
                    });
                });
            } catch (e) {
                processError(res, e);
            }
    },

    create: function(req, res) {
        var db = app.get("db");
        try {
            var attributes = [ "name", "meaning", "scripture" ];
            var name = _.pick(req.body, attributes);
            if (_.keys(name).length != attributes.length) { // Need all
                res.status(400);
                res.json({ "message": "Missing one or more required attributes for name record: " + attributes });
                return;
            }

            db.names.save(name, function(err, name) {
                if (err) return processError(res, err);
                res.status(201); // Created
                res.json({
                    length: 1,
                    content: [ name ]
                });
            });
        } catch (e) {
            processError(res, e);
        }
    },

    update: function(req, res) {
        var db = app.get("db");
        try {
            var attributes = [ "name", "meaning", "scripture" ];
            var name = _.pick(req.body, attributes);
            name.name_id = req.params.id;
            name.modificationDate = new Date();
            db.names.update(name, function(err, name) {
                if (err) return processError(res, err);
                res.status(200); // Created
                res.json({
                    length: 1,
                    content: [ name ]
                });
            });
        } catch (e) {
            processError(res, e);
        }
    },

    delete: function(req, res) {
        var db = app.get("db");
        try {
            db.names.delete(req.params.id, function(err, pick) {
                if (err) return processError(res, err);
                res.status(200); // Deleted
                res.json(pick);
            });
        } catch (e) {
            processError(res, e);
        }
    }
};

module.exports = names;
