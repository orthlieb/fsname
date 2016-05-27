var _ = require("underscore");
// XXX need to sanitize name record on return with a _.pick. Don't want creationDate or modificationDate.

var names = {

    getAll: function(req, res) {
        var db = app.get("db");
        try {
            db.run("select * from names", function(err, names) {
                if (err) throw(err);
                // HATEOS Decorate with links
                for (name in names) {
                    name.links = [ {
                        "rel": "self",
                        "href": req.baseURL + "/v1/api/name/:" + name.name_id
                    }];
                }
                res.json({
                    content: names,
                    links: [{
                        rel: "name.search",
                        href: req.baseURL + "/v1/api/name/search"
                    }]
                });
            });
        } catch (e) {
            console.log("ERROR: " + e);
            res.status(500);
            res.json(e);
        }
    },

    getOne: function(req, res) {
        var db = app.get("db");
        try {   // XXX probably don't want to search by ID but by name, need a different protocol.
            db.names.findOne({ name: req.params.id }, function(err, name) {
                if (err) throw(err);
                res.json(name);
            });
        } catch (e) {
            console.log("ERROR: " + e);
            res.status(500);
            res.json(e);
        }
    },

    create: function(req, res) {
        var db = app.get("db");
        try {
            var attributes = [ "name", "meaning", "scripture" ];
            var pick = _.pick(req.body, attributes);
            if (_.keys(pick).length != attributes.length) { // Need all
                res.status(400);
                res.json({ "message": "Missing attribute for name"})
                return;
            }

            db.names.save(pick, function(err, pick) {
                if (err) throw(err);
                res.status(201); // Created
                res.json(pick);
            });
        } catch (e) {
            console.log("ERROR: " + e);
            res.status(500);
            res.json(e);
            return;
        }
    },

    update: function(req, res) {
        var updateuser = req.body;
        var id = req.params.id;
        data[id] = updateuser // Spoof a DB call
        res.json(updateuser);
    },

    delete: function(req, res) {
        var id = req.params.id;
        data.splice(id, 1) // Spoof a DB call
        res.json(true);
    }
};

module.exports = names;
