var express = require('express');
var router = express.Router();
var auth = require('./auth.js');
var products = require('./products.js');
var user = require('./users.js');
var names = require('./names.js');
/*
* Routes that can be accessed by any one
*/
router.post('/login', auth.login);
/*
* Routes that can be accessed only by authenticated users
*/
router.get('/api/v1/products', products.getAll);
router.get('/api/v1/product/:id', products.getOne);
router.post('/api/v1/product/', products.create);
router.put('/api/v1/product/:id', products.update);
router.delete('/api/v1/product/:id', products.delete);

router.get('/api/v1/names', names.getAll);
router.get('/api/v1/name/:id', names.getOne);
router.post('/api/v1/admin/name/', names.create);    // Secure

/*
* Routes that can be accessed only by authenticated & authorized users
*/
router.get('/api/v1/admin/users', user.getAll);
router.get('/api/v1/admin/user/:id', user.getOne);
router.post('/api/v1/admin/user/', user.create);
router.put('/api/v1/admin/user/:id', user.update);
router.delete('/api/v1/admin/user/:id', user.delete);
module.exports = router;
