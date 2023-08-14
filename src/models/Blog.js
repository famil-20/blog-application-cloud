'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const blogSchema = new Schema({
	title: {
		type: String,
		required: [true, 'Title of the blog is missing'],
		unique: [true, 'Blog title already exists']
	},
	snippet: {
		type: String,
		required: [true, 'Snipppet of the blog is missing']
	},
	body: {
		type: String,
		required: [true, 'Body of the blog is missing']
	},
	createdBy: {
		type: String,
		required: true
	}
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema, 'blogs');

module.exports = Blog;
