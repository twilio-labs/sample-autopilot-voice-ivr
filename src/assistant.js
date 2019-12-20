const moment = require('moment');
const fs = require('fs');

const cfg = require('../src/config');

const client = require('twilio')(cfg.twilioAccountSid, cfg.twilioAuthToken);

const configFile = '_data/config.json';

const assistant = {
  config: loadAssistantConfig(),
  update: updateAssistant,
  saveConfig: saveAssistantConfig,
  getOperatorActions: generateOperatorActions,
};

/**
 * Creates an slug from a name or title
 * @param {string} title
 * @return {string}
 */
function slugify(title) {
  return title.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generates the actions for the operator task
 * @param {string} baseUrl
 * @param {Date} date
 * @return {object[]}
 */
function generateOperatorActions(baseUrl, date) {
  const actions = [];
  const now = moment(date);
  console.log(now.weekday(), now.hour());
  if (
    0 < now.weekday() &&
    now.weekday() < 6 &&
    (now.hour() < 9 || now.hour() > 16)
  ) {
    actions.push({
      say:
        'Please hold while we connect you with an operator as you are calling outside of regular business hours.',
    });
  }
  actions.push({
    handoff: {
      channel: 'voice',
      uri: `${baseUrl}/operator-webhook`,
      method: 'POST',
    },
  });
  return actions;
}

/**
 * Gets or creates a new assistant for the IVR Tutorial
 * @param {string} name
 * @return {Promise<AssistantInstance>}
 */
async function getOrCreateAssistant(name) {
  const uniqueName = slugify(name);
  const assistants = await client.autopilot.assistants.list();

  let assistant = assistants.find(
    assistant => assistant.uniqueName === uniqueName
  );

  if (assistant === undefined) {
    console.log(`Create assistant: "${name}"`);
    assistant = await client.autopilot.assistants.create({
      friendlyName: name,
      uniqueName: uniqueName,
      defaults: {
        defaults: {
          assistant_initiation: `task://greeting`,
          fallback: `task://main-menu`,
        },
      },
      styleSheet: {
        style_sheet: {
          voice: {
            say_voice: 'Polly.Matthew',
          },
        },
      },
    });
  }

  return assistant;
}

/**
 * Links a phone number to an autopilot assistant
 * @param {AssistantInstance} assistant
 * @param {string} accountSid
 * @param {string} phoneNumber
 * @return {Promise<void>}
 */
async function linkAssistantToPhoneNumber(assistant, accountSid, phoneNumber) {
  console.log('Link phone number to assistant');
  const incomingPhoneNumbers = await client.api.incomingPhoneNumbers.list();
  const incomingPhoneNumber = incomingPhoneNumbers.find(
    incomingPhoneNumbers => incomingPhoneNumbers.phoneNumber === phoneNumber
  );
  await incomingPhoneNumber.update({
    voiceMethod: 'POST',
    voiceUrl: `https://channels.autopilot.twilio.com/v1/${accountSid}/${assistant.sid}/twilio-voice`,
  });
}

/**
 * Create or update the greeting task
 * @param {AssistantInstance} assistant
 * @param {Array<TaskInstance>} tasks
 * @param {string} companyName
 * @return {Promise<TaskInstance>}
 */
async function createOrUpdateGreetingTask(assistant, tasks, companyName) {
  let task = await tasks.find(task => task.uniqueName === 'greeting');
  const actions = {
    actions: [
      {
        say: `Thanks for calling ${companyName}`,
      },
      {
        redirect: 'task://main-menu',
      },
    ],
  };
  if (task === undefined) {
    console.log('Create "Greeting" task');
    task = await assistant.tasks().create({
      friendlyName: 'Greeting',
      uniqueName: 'greeting',
      actions: actions,
    });
  } else {
    task.update({
      actions: actions,
    });
  }
  return task;
}

/**
 * Create or update the Main Menu task for the assistant
 * @param {AssistantInstance} assistant
 * @param {TaskInstance[]} tasks
 * @param {string} baseUrl
 * @return {Promise<TaskInstance>}
 */
async function createOrUpdateMainMenuTask(assistant, tasks, baseUrl) {
  let task = await tasks.find(task => task.uniqueName === 'greeting');
  const actions = {
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
  };
  if (task === undefined) {
    console.log('Create "Main Menu" task');
    task = await assistant.tasks().create({
      friendlyName: 'Main menu',
      uniqueName: 'main-menu',
      actions: actions,
    });
    await task.samples().create({
      sourceChannel: 'voice',
      taggedText: 'main menu',
      language: 'en-US',
    });
  } else {
    console.log('Updating "Main Menu" task');
    task.update({ actions: actions });
  }
  return task;
}

/**
 * Creates or update a task based on the name and supplied parameters
 * @param {AssistantInstance} assistant
 * @param {TaskInstance[]} tasks
 * @param {string} name
 * @param {string} message
 * @param {string[]} taggedTexts
 * @param {string[]|null} nextTasks
 * @return {Promise<TaskInstance>}
 */
async function createOrUpdateGenericTask(
  assistant,
  tasks,
  name,
  message,
  taggedTexts,
  nextTasks
) {
  const uniqueName = slugify(name);
  const actions = { actions: [{ say: message }] };
  if (nextTasks) {
    actions.actions.push({
      listen: { tasks: nextTasks },
    });
  } else {
    actions.actions.push({
      redirect: 'task://main-menu',
    });
  }

  let task = tasks.find(task => task.uniqueName === uniqueName);
  if (task === undefined) {
    console.log(`Create "${name}" task`);
    task = await assistant.tasks().create({
      friendlyName: name,
      uniqueName: uniqueName,
      actions: actions,
    });
  } else {
    console.log(`Update "${name}" task`);
    await task.update({
      actions: actions,
    });
    const samples = await task.samples().list();
    await samples.reduce(
      (chain, sample) => chain.then(() => sample.remove()),
      Promise.resolve()
    );
  }
  for (const taggedText of taggedTexts) {
    await task.samples().create({
      sourceChannel: 'voice',
      taggedText: taggedText,
      language: 'en-US',
    });
  }
  return task;
}

/**
 * Update or creates the whole workflow of the autopilot assistant
 * @param {string} baseUrl
 * @param {object} setup
 * @return {Promise<void>}
 */
async function updateAssistant(baseUrl) {
  try {
    const assistant = await getOrCreateAssistant('IVR Tutorial');
    await linkAssistantToPhoneNumber(
      assistant,
      cfg.twilioAccountSid,
      cfg.twilioPhoneNumber
    );

    const tasks = await assistant.tasks().list();

    await createOrUpdateGreetingTask(
      assistant,
      tasks,
      assistant.config.companyName
    );
    await createOrUpdateMainMenuTask(assistant, tasks, baseUrl);

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Sales',
      assistant.config.salesMessage,
      ['sales'],
      ['sales-option-1', 'sales-option-2', 'main-menu']
    );

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Sales Option 1',
      assistant.config.salesOption1Message,
      [assistant.config.salesOption1],
      ['sales-option-2', 'main-menu']
    );

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Sales Option 2',
      assistant.config.salesOption2Message,
      [assistant.config.salesOption2],
      null
    );

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Support',
      assistant.config.supportMessage,
      ['support'],
      ['support-option-1', 'support-option-2', 'main-menu']
    );

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Support Option 1',
      assistant.config.supportOption1Message,
      [assistant.config.supportOption1],
      ['support-option-2', 'main-menu']
    );

    await createOrUpdateGenericTask(
      assistant,
      tasks,
      'Support Option 2',
      assistant.config.supportOption2Message,
      [assistant.config.supportOption2],
      null
    );

    await assistant.modelBuilds().create();
  } catch (e) {
    console.error(e);
  }
}

/**
 *
 * @return {object}
 */
function loadAssistantConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFile).toString());
  } catch (e) {
    return {
      companyName: 'Teldigo',
      startHour: '09:00',
      endHour: '17:00',
      // sales messages
      salesMessage:
        'You can ask about the apartment at 375 Beale, ask “who the realtor is”, or say “main menu” to start over.',
      salesOption1: 'tell me about the apartment',
      salesOption1Message:
        'The apartment at 375 beale is a $500 a month: 2 bedroom 1 bath and 650 square feet. What would you like to do, you can ask “who the realtor is” or say “main menu” to start over.',
      salesOption2: 'who the realtor is',
      salesOption2Message: 'Your realtor is Jom Dundel.',
      // support messages
      supportMessage:
        'What would you like to do, you can ask “who the support agent is”, "what the support hours are" or say “main menu” to start over.',
      supportOption1: 'who the support agent is',
      supportOption1Message: 'Your support agent is Jom Dundel.',
      supportOption2: 'what the support hours are',
      supportOption2Message:
        'Our support office hours are from 9:00AM to 5:00PM Monday - Friday, and from 10:00AM to 2:00PM on Saturday and Sunday. ',
      operatorPhoneNumber: '+1234567890',
    };
  }
}

/**
 * Save the assistant config to a JSON file
 */
function saveAssistantConfig() {
  fs.writeFile(configFile, JSON.stringify(assistant.config), () =>
    console.log('Setup saved!')
  );
}

module.exports = assistant;
