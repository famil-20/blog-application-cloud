'use strict';
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Email property is missing'],
		unique: true,
		lowercase: true,
		validate: [isEmail, 'Entered email is invalid']
	},
	password: {
		type: String,
		required: [true, 'Password property is missing'],
		minLength: [8, 'Minimum password length has to be 8']
	}
});

userSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// static login method
userSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('INCORRECTPWD');
	}

	throw Error('INCORRECTEMAIL');
};

const User = mongoose.model('user', userSchema, 'users');

module.exports = User;