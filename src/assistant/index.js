const moment = require('moment');

const cfg = require('../config');

const client = require('twilio')(cfg.twilioAccountSid, cfg.twilioAuthToken);

const autopilot = require('./autopilot');
/**
 * Update or creates the whole workflow of the autopilot assistant
 * @param {Setup} setup
 * @param {string} baseUrl
 * @return {Promise<void>}
 */
async function updateAssistant(setup, baseUrl) {
  try {
    const assistant = await autopilot.updateOrCreateAssistant(
      client,
      'IVR Tutorial',
      baseUrl
    );
    if (
      (await autopilot.linkAssistantToPhoneNumber(
        client,
        assistant,
        cfg.twilioAccountSid,
        cfg.twilioPhoneNumber
      )) === undefined
    ) {
      console.log('Phone number not found. Setup aborted!');
      return;
    }

    const tasks = await assistant.tasks().list();

    await autopilot.createOrUpdateMainMenuTask(assistant, tasks, baseUrl);

    await autopilot.createOrUpdateOptionTasks(
      assistant,
      tasks,
      'Sales',
      setup.sales.options,
      setup.sales.message
    );

    await autopilot.createOrUpdateOptionTasks(
      assistant,
      tasks,
      'Support',
      setup.support.options,
      setup.support.message
    );

    await assistant.modelBuilds().create();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Generates the actions for the operator task
 * @param {Setup} setup
 * @param {string} baseUrl
 * @param {Date} date
 * @return {object[]}
 */
function getGreetingActions(setup, baseUrl, date) {
  const message = `Thanks for calling ${setup.companyName}.`;
  const startParts = setup.businessHours.start.split(':');
  const start = moment(date)
    .set('hours', parseInt(startParts[0]))
    .set('minutes', parseInt(startParts[1]));
  const endParts = setup.businessHours.end.split(':');
  const end = moment(date)
    .set('hours', parseInt(endParts[0]))
    .set('minutes', parseInt(endParts[1]));
  const now = moment(date);
  let actions;
  const isWeekend = 0 === now.weekday() || now.weekday() === 6;
  const outsideBusinessHours = now < start || now > end;
  if (isWeekend || outsideBusinessHours) {
    actions = [
      {
        say: `${message} Please hold while we connect you with an operator as you are calling outside of regular business hours.`,
      },
      {
        handoff: {
          channel: 'voice',
          uri: `${baseUrl}/operator-webhook`,
          method: 'POST',
        },
      },
    ];
  } else {
    actions = [
      {
        say: message,
      },
      {
        redirect: 'task://main-menu',
      },
    ];
  }
  return actions;
}

module.exports = {
  updateAssistant,
  getGreetingActions,
};
