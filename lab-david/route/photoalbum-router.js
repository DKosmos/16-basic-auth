'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:photoalbum-router');

const PhotoAlbum = require('../model/photoalbum.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const photoAlbumRouter = module.exports = Router();

photoAlbumRouter.post('/api/photoalbum', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/photoalbum');


  req.body.userId = req.user._id;
  new PhotoAlbum(req.body).save()
    .then( photoAlbum => res.json(photoAlbum))
    .catch(err => {
      err = createError(404, err.message);
      next(err);
    });
});

photoAlbumRouter.get('/api/photoalbum/:photoalbumId', bearerAuth, jsonParser, (req, res, next) => {
  debug('GET: /api/photoalbum/:photoalbumId');

  PhotoAlbum.findById(req.params.photoalbumId)
    .then(photoAlbum => res.json(photoAlbum))
    .catch(err => {
      err = createError(404, err.message);
      return next(err);
    });
});

photoAlbumRouter.put('/api/photoalbum/:photoalbumId', bearerAuth, jsonParser, (req, res, next) => {
  debug('PUT: /api/photoalbum/:photoalbumId');

  if(!req.body) return next(createError(400, 'invalid body'));

  PhotoAlbum.findByIdAndUpdate(req.params.photoalbumId, req.body, {new:true})
    .then(photoalbum => res.json(photoalbum))
    .catch(err => {
      err = createError(404, err.message);
      return next(err);
    });
});

photoAlbumRouter.delete('/api/photoalbum/:photoalbumId', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/photoalbum/:photoalbumId');

  PhotoAlbum.findByIdAndRemove(req.params.photoalbumId)
    .then( () => res.status(204).send())
    .catch(next);
});