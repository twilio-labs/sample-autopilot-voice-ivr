const expect = require('chai').expect;

const generateOperatorActions = require('../src/actions')
  .generateOperatorActions;

describe('generate operator actions', function() {
  context('during business hours', function() {
    it('returns a redirect to support action', function() {
      const actions = generateOperatorActions(
        'http://example.com',
        new Date('2019-12-20 10:00:00')
      );
      expect(actions).to.eql([
        {
          handoff: {
            channel: 'voice',
            uri: 'http://example.com/webhook/operator',
            method: 'POST',
          },
        },
      ]);
    });
  });

  context('outside business hours', function() {
    it('returns a say and a redirect to support action', function() {
      const actions = generateOperatorActions(
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
            uri: 'http://example.com/webhook/operator',
            method: 'POST',
          },
        },
      ]);
    });
  });
});
