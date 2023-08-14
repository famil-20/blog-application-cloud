'use strict';
const express = require('express');
const path = require('path');
const {env} = require('process');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const blogRouter = require('./routes/blogRoutes');
const authRouter = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');


const app = express();

// connection to mongoDB
const dbURI = env.DBURI;

mongoose.connect(dbURI)
	.then(() => {
		app.listen(env.PORT, env.IP);
	})
	.catch((err) => {
		console.log(err);
	});


/* MIDDLEWARES */

// registering logging middleware
app.use(morgan('tiny'));

// view engine register
app.set('view engine', 'ejs');
app.set('views', './src/views');

// setting up middleware to handle stylesheet, favicon etc. requests
// eslint-disable-next-line no-undef
const staticPath = path.join(__dirname, '../assets');
app.use('/assets', express.static(staticPath));

// enabling passing url encoded object to request
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(express.json());

// retrieving and putting auth header into request
app.use((req, res, next) => {
	const jwt = req.cookies.jwt;
	if (jwt) {
		req.headers.authorization = jwt;
	}
	next();
});

// authorization middlewares
app.use('*', authMiddleware.checkUser);

app.use('*', authMiddleware.verifyCookie);

/* END MIDDLEWARES */


/* ROUTES */

app.get('/', (req, res) => {
	res.render('index', { title: 'Index' });
});

app.get('/about', (req, res) => {
	res.render('about', { title: 'About' });
});

// blogs routes
app.use('/blogs', authMiddleware.requireAuth, blogRouter);

// auth routes
app.use('/auth', authRouter);

// not found
app.use((req, res) => {
	res.status(404).render('notFound', { title: 'Not Found' });
});