'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./route/auth-router.js');
const photoAlbumRouter = require('./route/photoalbum-router.js');
const photoRouter = require('./route/photo-router.js');
const errors = require('./lib/error-middleware');

dotenv.load();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(photoAlbumRouter);
app.use(photoRouter);


app.use(errors);


const server = module.exports = app.listen(PORT, () => {
  debug('server up on', PORT);
});

server.isRunning = true;