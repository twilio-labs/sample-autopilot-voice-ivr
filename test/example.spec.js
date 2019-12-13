const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../server');
const agent = supertest(app);

describe('appointment', function() {
  describe('GET /', function() {
    it('returns index.html', function(done) {
      agent
        .get('/')
        .expect(function(response) {
          expect(response.text).to.contain('Template App');
        })
        .expect(200, done);
    });
  });

  describe('GET /example', function() {
    it('returns example data', function(done) {
      agent
        .get('/example')
        .expect(function(response) {
          expect(JSON.parse(response.text)).to.eql({
            example: true,
          });
        })
        .expect(200, done);
    });
  });
});
