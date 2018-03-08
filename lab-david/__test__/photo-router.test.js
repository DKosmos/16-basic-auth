'use strict';

const request = require('superagent');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), { suffix: 'Prom'});
const debug = require('debug')('cfgram:photo-router.test');
const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');

const Photo = require('../model/photo.js');
const User = require('../model/user.js');
const PhotoAlbum = require('../model/photoalbum.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@user.net',
};

const examplePhotoAlbum = {
  name: 'example album',
  desc: 'example album desc',
};

const examplePhoto = {
  name: 'example photo',
  desc: 'example photo desc',
  image: `${__dirname}/../data/tester.png`,
};

describe('Photo Router', function(){
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  beforeAll( done => {
    new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      }).then( token => {
        this.tempToken = token;
        done();
      }).catch(done);
  });

  beforeAll( done => {
    examplePhotoAlbum.userId = this.tempUser._id.toString();
    new PhotoAlbum(examplePhotoAlbum).save()
      .then( album => {
        this.tempAlbum = album;
        done();
      });
  });

  this.tempPhoto = {};

  afterAll( done => {
    Promise.all([
      Photo.remove({}),
      User.remove({}),
      PhotoAlbum.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST: /api/photoalbum/:photoalbumId/photo', () => {
    describe('with a valid token and valid data', () => {

      beforeEach( done => {
        fs.copyFileProm(`${__dirname}/../tester.png`, `${__dirname}/../data/tester.png`)
          .then( () => done())
          .catch(done);
      });


      afterEach( done => {
        delete examplePhotoAlbum.userId;
        done();
      });

      it('should return an object containing our photo url', done => {
        request.post(`${url}/api/photoalbum/${this.tempAlbum._id}/photo`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .field('name', examplePhoto.name)
          .field('desc', examplePhoto.desc)
          .attach('image', examplePhoto.image)
          .end((err, res) => {
            if(err) return done(err);
            this.tempPhoto = res.body;
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(examplePhoto.name);
            expect(res.body.desc).toEqual(examplePhoto.desc);
            expect(res.body.photoAlbumId).toEqual(this.tempAlbum._id.toString());
            done();
          });
      });
    });
  });

  describe('DELETE: /api/photo/:photoId', () => {
    describe('with a valid id', () => {

      it('should return status 204', done => {
        request.delete(`${url}/api/photo/${this.tempPhoto._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
  });
});