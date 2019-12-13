require('dotenv-safe').config();

const baseUrl = process.env.SERVER_BASE_URL;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

const assistantFriendlyName = 'IVR Tutorial';
const assistantUniqueName = 'ivr-tutorial';

(async function setup(next) {
  try {
    const assistants = await client.autopilot.assistants.list();

    let assistant = assistants.find(
      assistant => assistant.uniqueName === assistantUniqueName
    );

    if (assistant) {
      const tasks = await assistant.tasks().list();
      await tasks.reduce(
        (chain, task) =>
          chain.then(async () => {
            const samples = await task.samples().list();
            await samples.reduce(
              (chain, sample) => chain.then(() => sample.remove()),
              Promise.resolve()
            );
            console.log('Remove task: ' + task.friendlyName);
            await task.remove();
          }),
        Promise.resolve()
      );

      console.log('Remove assistant builds');
      const builds = await assistant.modelBuilds().list();
      await builds.reduce(
        (chain, build) => chain.then(() => build.remove()),
        Promise.resolve()
      );

      console.log(`Remove assistant: "${assistant.friendlyName}"`);
      await assistant.remove();
    }

    console.log(`Create assistant: "${assistantFriendlyName}"`);
    assistant = await client.autopilot.assistants.create({
      friendlyName: assistantFriendlyName,
      uniqueName: assistantUniqueName,
      defaults: {
        defaults: {
          assistant_initiation: `task://greeting`,
          fallback: `task://main-menu`,
        },
      },
    });

    console.log('Create "Greeting" task');
    await assistant.tasks().create({
      friendlyName: 'Greeting',
      uniqueName: 'greeting',
      actions: {
        actions: [
          {
            say: 'Thanks for calling Teldigo',
          },
          {
            redirect: 'task://main-menu',
          },
        ],
      },
    });

    console.log('Create "Main Menu" task');
    const mainMenuTask = await assistant.tasks().create({
      friendlyName: 'Main menu',
      uniqueName: 'main-menu',
      actions: {
        actions: [
          {
            collect: {
              name: 'options',
              questions: [
                {
                  question:
                    'Press 1 or say “Sales” for Sales, Press 2 or say “Support” for Support, Press 3 or say “Operator” for all other questions',
                  name: 'option',
                  voice_digits: {
                    num_digits: 1,
                    mapping: {
                      '1': 'sales',
                      '2': 'support',
                      '3': 'operator',
                    },
                  },
                },
              ],
              on_complete: {
                redirect: {
                  uri: `${baseUrl}/autopilot/collect-main-menu`,
                  method: 'POST',
                },
              },
            },
          },
        ],
      },
    });
    await mainMenuTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'main menu',
      language: 'en-US',
    });

    console.log('Create "Sales" task');
    const salesTask = await assistant.tasks().create({
      friendlyName: 'Sales',
      uniqueName: 'sales',
      actions: {
        actions: [
          {
            say:
              'You can ask about the apartment at 375 Beale, ask “who the realtor is”, or say “main menu” to start over.',
          },
          {
            listen: true,
          },
        ],
      },
    });
    await salesTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'sales',
      language: 'en-US',
    });

    console.log('Create "Apartment" task');
    const apartmentTask = await assistant.tasks().create({
      friendlyName: 'Apartment',
      uniqueName: 'apartment',
      actions: {
        actions: [
          {
            say:
              'The apartment at 375 beale is a $500 a month: 2 bedroom 1 bath and 650 square feet. What would you like to do, you can ask “who the realtor is” or say “main menu” to start over.',
          },
          {
            listen: {
              tasks: ['realtor', 'apartment', 'main-menu'],
            },
          },
          {
            redirect: 'task://main-menu',
          },
        ],
      },
    });
    await apartmentTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'tell me about the apartment at 375 beale',
      language: 'en-US',
    });
    await apartmentTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'tell me about the apartment',
      language: 'en-US',
    });

    console.log('Create "Realtor" task');
    const realtorTask = await assistant.tasks().create({
      friendlyName: 'Realtor',
      uniqueName: 'realtor',
      actions: {
        actions: [
          {
            say: 'Your realtor is Jom Dundel.',
          },
          {
            redirect: 'task://main-menu',
          },
        ],
      },
    });
    await realtorTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'who the realtor is',
      language: 'en-US',
    });

    console.log('Create "Support" task');
    const supportTask = await assistant.tasks().create({
      friendlyName: 'Support',
      uniqueName: 'support',
      actions: {
        actions: [
          {
            say:
              'What would you like to do, you can ask “who the support agent is”, "what the support hours are" or say “main menu” to start over.',
          },
          {
            listen: {
              tasks: ['support-agent', 'support-hours', 'main-menu'],
            },
          },
          {
            redirect: 'task://main-menu',
          },
        ],
      },
    });
    await supportTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'support',
      language: 'en-US',
    });

    console.log('Create "Support Agent" task');
    const supportAgentTask = await assistant.tasks().create({
      friendlyName: 'Support Agent',
      uniqueName: 'support-agent',
      actions: {
        actions: [
          {
            say: 'Your support agent is Jom Dundel.',
          },
          {
            redirect: 'task://main-menu',
          },
        ],
      },
    });
    await supportAgentTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'who the support agent is',
      language: 'en-US',
    });

    console.log('Create "Support Bussines Hours" task');
    const supportBusinessHoursTask = await assistant.tasks().create({
      friendlyName: 'Support Business Hours',
      uniqueName: 'support-hours',
      actions: {
        actions: [
          {
            say:
              'Our support office hours are from 9:00AM to 5:00PM Monday - Friday, and from 10:00AM to 2:00PM on Saturday and Sunday. ' +
              'What would you like to do? You can ask about “sales”, connect with an “operator”, or say “main menu” to start over.',
          },
          {
            listen: {
              tasks: ['sales', 'operator', 'main-menu'],
            },
          },
          {
            redirect: 'task:main-menu',
          },
        ],
      },
    });
    await supportBusinessHoursTask.samples().create({
      sourceChannel: 'voice',
      taggedText: 'what the support hours are',
      language: 'en-US',
    });

    console.log('Build models');
    await assistant.modelBuilds().create();

    console.log('Link phone number to assistant');
    const phoneNumbers = await client.api.incomingPhoneNumbers.list();
    const phoneNumber = phoneNumbers.find(
      phoneNumber => phoneNumber.phoneNumber === twilioPhoneNumber
    );
    await phoneNumber.update({
      voiceMethod: 'POST',
      voiceUrl: `https://channels.autopilot.twilio.com/v1/${accountSid}/${assistant.sid}/twilio-voice`,
    });
  } catch (e) {
    console.log(e);
  }
})();
