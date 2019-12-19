const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../server');
const agent = supertest(app);

describe('autopilot ivr', function() {
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

  describe('POST /autopilot/collect-main-menu', function() {
    const requestBodyTpl =
      '{"twilio":{"voice":{"To":"+12014250684","From":"+19734535184",' +
      '"CallSid":"CAd6ee69c8247ae1f1990e974a38578059","Direction":"inbound"},' +
      '"collected_data":{"options":{"status":"complete","date_started":"2019-12-18T20:43:04Z",' +
      '"date_completed":"2019-12-18T20:43:15Z","answers":{"option":{"answer":"#{option}",' +
      '"filled":true,"attempts":1,"validate_attempts":0,"confirm_attempts":0,"confirmed":false}}}}}}';

    context('with sales option', function() {
      it('returns a redirect to sales action', function(done) {
        agent
          .post('/autopilot/collect-main-menu')
          .send({
            Memory: requestBodyTpl.replace('#{option}', 'sales'),
          })
          .expect(function(response) {
            expect(JSON.parse(response.text)).to.eql({
              actions: [{ redirect: 'task://sales' }],
            });
          })
          .expect(200, done);
      });
    });

    context('with support option', function() {
      it('returns a redirect to support action', function(done) {
        agent
          .post('/autopilot/collect-main-menu')
          .send({
            Memory: requestBodyTpl.replace('#{option}', 'support'),
          })
          .expect(function(response) {
            expect(JSON.parse(response.text)).to.eql({
              actions: [{ redirect: 'task://support' }],
            });
          })
          .expect(200, done);
      });
    });

    context('with support option', function() {
      it('returns a redirect to operator action', function(done) {
        agent
          .post('/autopilot/collect-main-menu')
          .send({
            Memory: requestBodyTpl.replace('#{option}', 'operator'),
          })
          .expect(function(response) {
            expect(JSON.parse(response.text)).to.eql({
              actions: [{ redirect: 'http://127.0.0.1/autopilot/operator' }],
            });
          })
          .expect(200, done);
      });
    });
  });

  describe('POST /webhook/operator', function() {
    it('returns twiml with dial', function(done) {
      agent
        .post('/webhook/operator')
        .expect(function(response) {
          expect(response.text).to.contain('<Response><Dial>');
          expect(response.text).to.contain('</Dial></Response>');
        })
        .expect(200, done);
    });
  });
});
