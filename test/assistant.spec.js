const expect = require('chai').expect;

const assistant = require('../src/assistant');
const Setup = require('../src/db').Setup;

describe('generate greeting actions', function() {
  const setup = new Setup({
    companyName: `Teldigo`,
    businessHours: {
      start: '09:00',
      end: '17:00',
    },
    sales: null,
    support: null,
    operator: null,
  });
  context('during business hours', function() {
    it('says hello and redirects to main-menu task', function() {
      const actions = assistant.getGreetingActions(
        setup,
        'http://example.com',
        new Date('2019-12-20 10:00:00')
      );
      expect(actions).to.eql([
        {
          say: 'Thanks for calling Teldigo.',
        },
        {
          redirect: 'task://main-menu',
        },
      ]);
    });
  });

  context('outside business hours', function() {
    it('returns a say and a redirect to support action', function() {
      const actions = assistant.getGreetingActions(
        setup,
        'http://example.com',
        new Date('2019-12-20 17:01:00')
      );
      expect(actions).to.eql([
        {
          say:
            'Thanks for calling Teldigo. Please hold while we connect you with an operator as you are calling outside of regular business hours.',
        },
        {
          handoff: {
            channel: 'voice',
            uri: 'http://example.com/operator-webhook',
            method: 'POST',
          },
        },
      ]);
    });
  });
});
