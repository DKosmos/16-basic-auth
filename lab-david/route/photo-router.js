'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cfgram:photo-router');

const Photo = require('../model/photo.js');
const PhotoAlbum = require('../model/photoalbum.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const photoRouter = module.exports = Router();

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

function s3uploadProm(params){
  debug('s3uploadProm');

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
      console.log('err', err);
    });
  });
}

function s3deleteProm(params){
  debug('s3deleteProm');

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, s3res) => {
      resolve(s3res);
    });
  });
}

photoRouter.post('/api/photoalbum/:photoalbumId/photo', bearerAuth, upload.single('image'), function(req, res, next){
  debug('POST: /api/photoalbum/:photoalbumId/photo');
  
  if(!req.file) return next(createError(400, 'file not found'));
  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  PhotoAlbum.findById(req.params.photoalbumId)
    .then( () => s3uploadProm(params))
    .then( s3data => {
      del([`${dataDir}/*`]);

      let photoData = {
        name: req.body.name,
        desc: req.body.desc,
        objectKey: s3data.Key,
        imageURI: s3data.Location,
        userId: req.user._id,
        photoAlbumId: req.params.photoalbumId,
      };

      return new Photo(photoData).save();
    })
    .then( photo => res.json(photo))
    .catch(err => next(err));
});

photoRouter.delete('/api/photo/:photoId', bearerAuth, function(req, res, next){
  debug('DELETE: /api/photo/:photoId');

  if(!req.params.photoId) return next(createError(400, 'bad request'));
  
  var params = {
    Bucket: process.env.AWS_BUCKET,
    Key: '',
  };
  
  Photo.findById(req.params.photoId)
    .then( photo => {
      params.Key = photo.objectKey;
      return s3deleteProm(params);
    })
    .then( () => {
      return Photo.findByIdAndRemove(req.params.photoId);
    })
    .then( () => res.status(204).send())
    .catch(err => next(err));
});