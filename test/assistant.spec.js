const expect = require('chai').expect;

const assistant = require('../src/assistant');

describe('generate operator actions', function() {
  context('during business hours', function() {
    it('returns a redirect to support action', function() {
      const actions = assistant.getOperatorActions(
        'http://example.com',
        new Date('2019-12-20 10:00:00')
      );
      expect(actions).to.eql([
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

  context('outside business hours', function() {
    it('returns a say and a redirect to support action', function() {
      const actions = assistant.getOperatorActions(
        'http://example.com',
        new Date('2019-12-20 17:01:00')
      );
      expect(actions).to.eql([
        {
          say:
            'Please hold while we connect you with an operator as you are calling outside of regular business hours.',
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
