'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {env} = require('process');

const SECRET = env.SECRET;

const requireAuth = (req, res, next) => {
	const token = req.headers.authorization;

	// Check if jwt exists
	if (token) {
		jwt.verify(token, SECRET, (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.status(400).send('Something bad happened (cookie cannot be verified) :(');
			}
			else {
				console.log(decodedToken);
				next();
			}
		});
	}
	else {
		res.redirect('/auth/login');
	}
};

// check current user
const checkUser = (req, res, next) => {
	const token = req.headers.authorization;
	if (token) {
		jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.locals.user = null;
				next();
			}
			else {
				console.log(decodedToken);
				let user = await User.findById(decodedToken.id);
				user = user.email;
				res.locals.user = user;
				next();
			}
		});
	}
	else {
		res.locals.user = null;
		next();
	}
};

const verifyCookie = (req, res, next) => {
	const token = req.headers.authorization;
	if (token) {
		jwt.verify(token, SECRET, (err) => {
			if (err) {
				res.cookie('jwt', '', { maxAge: 1 });
			}
			else {
				next();
			}
		});
	}
	else {
		next();
	}
};

module.exports = {
	requireAuth,
	checkUser,
	verifyCookie
};