const expect = require('chai').expect;
const supertest = require('supertest');
const app = require('../server');
const agent = supertest(app);
const Setup = require('../src/db').Setup;

describe('autopilot ivr', function() {
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
              actions: [
                {
                  handoff: {
                    channel: 'voice',
                    uri: 'http://127.0.0.1/autopilot/operator-webhook',
                    method: 'POST',
                  },
                },
              ],
            });
          })
          .expect(200, done);
      });
    });
  });

  describe('POST /autopilot/operator-webhook', function() {
    it('returns twiml with dial', async function() {
      const setup = await Setup.get();
      setup.operator.phoneNumber = '+12345678901';
      await setup.save();

      const response = await agent.post('/autopilot/operator-webhook');

      expect(response.status).to.eql(200);
      expect(response.text).to.contain('<Response><Dial>');
      expect(response.text).to.contain('</Dial></Response>');
    });
  });
});
