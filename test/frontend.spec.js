const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../server');
const agent = supertest(app);

describe('ivr frontend', function() {
  describe('GET /', function() {
    it('returns index.html', function(done) {
      agent
        .get('/')
        .expect(function(response) {
          expect(response.text).to.contain(
            'Voice-Powered IVR Chatbot with Autopilot'
          );
        })
        .expect(200, done);
    });
  });

  describe('GET /setup', function() {
    it('returns setup.html', function(done) {
      agent
        .get('/setup')
        .expect(function(response) {
          expect(response.text).to.contain('IVR Setup');
        })
        .expect(200, done);
    });
  });
});
