'use strict';

const request = require('superagent');
const mongoose = require('mongoose');

const server = require('../server.js');
const serverToggle = require('../lib/server-toggle.js');
const User = require('../model/user.js');
const PhotoAlbum = require('../model/photoalbum.js');

require('jest');

const url = 'http://localhost:3000';

const exampleUser = {
  username: 'exampleuser',
  password: '2468',
  email: 'exampleuser@user.com',
};

const exampleAlbum = {
  name: 'test album',
  desc: 'test photo album desc',
};

describe('Photo Album Routes', function(){
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });
  
  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  beforeEach( done => {
    new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      PhotoAlbum.remove({}),
    ]).then( () => done())
      .catch(done);
  });

  describe('POST: /api/photoalbum', () => {
    describe('with a valid body', () => {
      it('should return a photo album', done => {
        request.post(`${url}/api/photoalbum`)
          .send(exampleAlbum)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleAlbum.name);
            expect(res.body.desc).toEqual(exampleAlbum.desc);
            expect(res.body.userId).toEqual(this.tempUser._id.toString());
            done();
          });
      });
    });

    describe('with no token provided', () => {
      it('should return 401 error', done => {
        request.post(`${url}/api/photoalbum`)
          .send(exampleAlbum)
          .end((err, res) => {
            expect(err.status).toEqual(401);
            expect(res.status).toEqual(401);
            done();
          });
      });
    });

    describe('with no body or invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/photoalbum`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(err.status).toEqual(404);
            expect(res.status).toEqual(404);
            done();
          });
      });
    });
  });
});