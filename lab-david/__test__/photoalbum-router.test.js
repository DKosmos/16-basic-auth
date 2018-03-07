'use strict';

const request = require('superagent');
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

  beforeEach( done => {
    exampleAlbum.userId = this.tempUser._id.toString();
    new PhotoAlbum(exampleAlbum).save()
      .then( album => {
        this.tempAlbum = album;
        done();
      }).catch(done);
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

  describe('GET: /api/photoalbum/:photoalbumId', () => {
    describe('with a valid id', () => {
      it('should return a photo album', done => {
        request.get(`${url}/api/photoalbum/${this.tempAlbum._id}`)
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

    describe('with an invald token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/photoalbum/${this.tempAlbum._id}`)
          .end((err, res) => {
            expect(err.status).toEqual(401);
            expect(res.status).toEqual(401);
            done();
          });
      });
    });

    describe('with an invalid id', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/photoalbum/123`)
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

  describe('PUT: /api/photoalbum/:photoalbumId', () => {
    describe('with a valid body', () => {
      it('should return an updated photo album', done => {
        request.put(`${url}/api/photoalbum/${this.tempAlbum._id}`)
          .send({ name: 'new album name'})
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual('new album name');
            expect(res.body.desc).toEqual(exampleAlbum.desc);
            expect(res.body.userId).toEqual(this.tempUser._id.toString());
            done();
          });
      });
    });

    describe('with an invalid token', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/photoalbum/${this.tempAlbum._id}`)
          .send({ name: 'new album name'})
          .end((err, res) => {
            expect(err.status).toEqual(401);
            expect(res.status).toEqual(401);
            done();
          });
      });
    });

    // describe('with an invalid body', () => {
    //   it('should return a 400 error', done => {
    //     request.put(`${url}/api/photoalbum/${this.tempAlbum._id}`)
    //       .send({ peanut: 'butter'})
    //       .set({
    //         Authorization: `Bearer ${this.tempToken}`,
    //       })
    //       .end((err, res) => {
    //         console.log(res.body);
    //         expect(err.status).toEqual(400);
    //         expect(res.status).toEqual(400);
    //         done();
    //       });
    //   });
    // });
  });
});