'use strict';
const {Router} = require('express');
const blogControllers = require('../controllers/blogController');

const router = Router();

router.get('/', blogControllers.blog_index_get);

router.get('/create', blogControllers.blog_create_get);

router.post('/create', blogControllers.blog_create_post);

router.get('/view/:id', blogControllers.blog_detailed_get);

router.get('/delete/:id', blogControllers.blog_delete_get);

router.post('/delete/:id', blogControllers.blog_delete_post);

module.exports = router;