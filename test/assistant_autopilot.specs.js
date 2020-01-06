const expect = require('chai').expect;
const twilio = require('twilio');

const autopilot = require('../src/assistant/autopilot');

const mockApiRequest = require('./api_mocker').mockApiRequest;

describe('autopilot', function() {
  context('updateOrCreateAssistant with existent assistant', function() {
    const client = twilio('AC...', 'fake_token');
    client.httpClient.request = mockApiRequest([
      {
        resource: 'Assistants',
      },
    ]);

    it('returns a valid assistant instance', async function() {
      const assistant = await autopilot.updateOrCreateAssistant(
        client,
        'assistant',
        'http://localhost'
      );

      expect(assistant).to.be.an('object');
      expect(assistant.uniqueName).to.eql('assistant');
    });
  });

  context('updateOrCreateAssistant with non-existent assistant', function() {
    const client = twilio('AC...', 'fake_token');
    client.httpClient.request = mockApiRequest([
      {
        resource: 'Assistants',
        isEmpty: true,
      },
    ]);

    it('returns a valid assistant instance', async function() {
      // mock and spy the API requests
      const assistant = await autopilot.updateOrCreateAssistant(
        client,
        'assistant',
        'http://localhost'
      );

      expect(assistant).to.be.an('object');
      expect(assistant.uniqueName).to.eql('assistant');
      expect(assistant.uniqueName).to.eql('assistant');
    });
  });

  describe('assistant', async function() {
    const client = twilio('AC...', 'fake_token');
    client.httpClient.request = mockApiRequest([
      {
        resource: 'Assistants',
      },
    ]);
    const assistant = await client.autopilot.assistants('UAxxx').fetch();

    context('linkAssistantToPhoneNumber with existing number', function() {
      it('returns a valid phone number instance', async function() {
        client.httpClient.request = mockApiRequest([
          {
            resource: 'IncomingPhoneNumbers',
          },
        ]);

        const phoneNumber = await autopilot.linkAssistantToPhoneNumber(
          client,
          assistant,
          'AC...',
          '+12345678901'
        );

        expect(phoneNumber).to.be.an('object');
        expect(phoneNumber.phoneNumber).to.eql('+12345678901');
        expect(phoneNumber.voiceUrl).to.eql('http://fake-url');
      });
    });

    context('linkAssistantToPhoneNumber with non-existing number', function() {
      it('returns undefined', async function() {
        client.httpClient.request = mockApiRequest([
          {
            resource: 'IncomingPhoneNumbers',
          },
        ]);

        const phoneNumber = await autopilot.linkAssistantToPhoneNumber(
          client,
          assistant,
          'AC...',
          '+10987654321'
        );

        expect(phoneNumber).to.eql(undefined);
      });
    });

    describe('tasks', function() {
      context('updateOrCreateMainMenuTask with non-existing task', function() {
        it('returns a TaskInstance', async function() {
          // Mock http request
          client.httpClient.request = mockApiRequest([
            {
              resource: 'Samples',
            },
            {
              resource: 'Tasks',
              isEmpty: true,
            },
          ]);
          const tasks = await assistant.tasks().list();

          const mainMenuTask = await autopilot.createOrUpdateMainMenuTask(
            assistant,
            tasks,
            'http://localhost'
          );

          expect(mainMenuTask).to.be.an('object');
          expect(mainMenuTask.uniqueName).to.eql('fake-task');
        });
      });

      context('updateOrCreateMainMenuTask with existing task', function() {
        it('returns a TaskInstance', async function() {
          // Mock http request
          client.httpClient.request = mockApiRequest([
            {
              resource: 'Samples',
            },
            {
              resource: 'Tasks',
            },
          ]);

          const tasks = await assistant.tasks().list();

          const mainMenuTask = await autopilot.createOrUpdateMainMenuTask(
            assistant,
            tasks,
            'http://localhost'
          );

          expect(mainMenuTask).to.be.an('object');
          expect(mainMenuTask.uniqueName).to.eql('main-menu');
        });
      });
    });
  });
});
