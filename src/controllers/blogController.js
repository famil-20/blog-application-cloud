'use strict';
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');
const {env} = require('process');

const SECRET = env.SECRET;

const errorHandler = (err) => {
	let errors = {
		title: '',
		snippet: '',
		body: ''
	};

	// blog error

	if (err.code === 11000) {
		errors.title = 'Entered blog title already exists';
		return errors;
	}

	// validation errors
	if (err.message.includes('blog validation failed')) {
		const errorsObject = Object.values(err.errors);
		errorsObject.forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
		return errors;
	}

};


const blog_index_get = async (req, res) => {
	try {
		const result = await Blog.find().sort({ createdAt: -1 });
		res.render('blogs', {
			title: 'All Blogs',
			blogs: result
		});
	}
	catch (err) {
		console.log(err);
	}
};

const blog_create_get = (req, res) => {
	res.render('createBlog', { title: 'Create a new blog' });
};

const blog_create_post = async (req, res) => {
	const token = req.headers.authorization;
	if (token) {
		jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				res.status(500).send('Something bad happened (cookie is not valid) :(');
				console.log(err);
			}
			else {
				try {
					const options = req.body;
					options.createdBy = decodedToken.id;
					const blog = await Blog.create(options);
					res.status(201).json({ blog: blog._id });
				}
				catch (err) {
					console.log(err);
					const errors = errorHandler(err);
					res.status(400).json({ errors });
				}
			}
		});
	}
	else {
		res.status(500).send('Something bad happened (no cookie is provided) :(');
	}
};

const blog_detailed_get = async (req, res, next) => {
	const id = req.params.id;
	try {
		const result = await Blog.findById(id);
		jwt.verify(req.headers.authorization, SECRET, async (err, decodedToken) => {
			if (err) {
				console.log(err);
				res.status(500).send('Something bad happened :(');
			}
			else {
				if (result.createdBy == decodedToken.id) {
					res.locals.showDeleteButton = true;
				}
				else {
					res.locals.showDeleteButton = false;
				}
			}

		});
		res.render('detailed', {
			blogTitle: result.title,
			blogBody: result.body,
			blogId: result._id,
			title: 'Blog detailed view'
		});
	}
	catch (err) {
		console.log(err);
		next();
	}
};

const blog_delete_get = async (req, res) => {
	const id = req.params.id;
	try {
		const result = await Blog.findById(id);
		res.render('deleteBlog', {
			title: 'Delete',
			blogTitle: result.title,
			blogId: result._id
		});
	}
	catch (err) {
		console.log(err);
		res.status(500).send('Something bad happened :(');
	}
};

const blog_delete_post = async (req, res) => {
	const id = req.params.id;
	const token = req.headers.authorization;
	try {
		jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				console.log(err);
				res.status(400).send('Cookie is not valid or changed');
			}
			else {
				const blog = await Blog.findById(id);
				
				if (blog.createdBy == decodedToken.id) {
					await Blog.findByIdAndDelete(id);
					res.redirect('/blogs');
				}
				else {
					res.status(400).send('The blog is not created by you!');
				}
			}
		});
	}
	catch (err) {
		console.log(err);
		res.status(500).send('Something bad happened :(');
	}
};

module.exports = {
	blog_index_get,
	blog_create_post,
	blog_create_get,
	blog_detailed_get,
	blog_delete_get,
	blog_delete_post
};