'use strict';
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {env} = require('process');

const SECRET = env.SECRET;
const MAXAGE = 24 * 60 * 60;



const errorHandler = (err) => {
	let errors = {
		email: '',
		password: ''
	};

	// incorrect credentials

	if (err.message === 'INCORRECTEMAIL') {
		errors.email = 'Entered email is not registered';
		return errors;
	}

	if (err.message === 'INCORRECTPWD') {
		errors.password = 'Entered password is incorrect';
		return errors;
	}

	// uniqueness error
	if (err.code === 11000) {
		errors.email = 'Email is already in use';
		return errors;
	}

	// validation errors
	if (err.message.includes('user validation failed')) {
		const errorsObject = Object.values(err.errors);
		errorsObject.forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
		return errors;
	}

	// unhandled exceptions
	errors.email = 'Unhandled exception occurred';
	errors.password = 'Unhandled exception occurred';

	return errors;
};

const createToken = (id) => {
	return jwt.sign({ id }, SECRET, {
		expiresIn: MAXAGE
	});
};

const signup_get = (req, res) => {
	res.render('signup', { title: 'Sign up' });
};

const signup_post = async (req, res) => {
	const { email, password } = req.body;
	console.log(email);

	try {
		const user = await User.create({ email, password });
		const token = createToken(user._id);
		res.cookie('jwt', token, {
			httpOnly: true,
			maxAge: MAXAGE * 1000
		});
		res.status(201).json({ user: user._id });
	}
	catch (err) {
		const errors = errorHandler(err);
		res.status(400).json({ errors });
	}
};

const login_get = (req, res) => {
	res.render('login', { title: 'Login' });
};

const login_post = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		res.cookie('jwt', token, {
			httpOnly: true,
			maxAge: MAXAGE * 1000
		});
		res.status(200).json({ user: user._id });
	} catch (err) {
		const errors = errorHandler(err);
		res.status(400).json({ errors });
	}
};

const logout_get = (req, res) => {
	res.render('logout', {title: 'Logout'});
};

const logout_post = async (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	res.redirect('/');
};

module.exports = {
	signup_get,
	signup_post,
	login_get,
	login_post,
	logout_get,
	logout_post
};