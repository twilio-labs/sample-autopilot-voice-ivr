/**
 * Creates an slug from a name or title
 * @param {string} title
 * @return {string}
 */
function slugify(title) {
  return title.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Gets or creates a new assistant for the IVR Tutorial
 * @param {TwilioClient} client
 * @param {string} name
 * @param {string} baseUrl
 * @return {Promise<AssistantInstance>}
 */
async function updateOrCreateAssistant(client, name, baseUrl) {
  const uniqueName = slugify(name);
  const defaults = {
    defaults: {
      assistant_initiation: `${baseUrl}/autopilot/greeting`,
      fallback: `task://main-menu`,
    },
  };
  const styleSheets = {
    style_sheet: {
      voice: {
        say_voice: 'Polly.Matthew',
      },
    },
  };

  const assistants = await client.autopilot.assistants.list();
  let assistant = assistants.find(
    assistant => assistant.uniqueName === uniqueName
  );
  if (assistant === undefined) {
    console.log(`Create assistant: "${name}"`);
    assistant = await client.autopilot.assistants.create({
      friendlyName: name,
      uniqueName: uniqueName,
      defaults: defaults,
      styleSheet: styleSheets,
    });
  } else {
    console.log(`Update assistant: "${name}"`);
    await assistant.update({
      defaults: defaults,
      styleSheet: styleSheets,
    });
  }

  return assistant;
}

/**
 * Links a phone number to an autopilot assistant
 * @param {TwilioClient} client
 * @param {AssistantInstance} assistant
 * @param {string} accountSid
 * @param {string} phoneNumber
 * @return {Promise<IncomingPhoneNumberInstance|undefined>}
 */
async function linkAssistantToPhoneNumber(
  client,
  assistant,
  accountSid,
  phoneNumber
) {
  console.log('Link phone number to assistant');
  const incomingPhoneNumbers = await client.api.incomingPhoneNumbers.list();
  const incomingPhoneNumber = incomingPhoneNumbers.find(
    incomingPhoneNumbers => incomingPhoneNumbers.phoneNumber === phoneNumber
  );
  if (!incomingPhoneNumber) {
    return incomingPhoneNumber;
  }
  return await incomingPhoneNumber.update({
    voiceMethod: 'POST',
    voiceUrl: `https://channels.autopilot.twilio.com/v1/${accountSid}/${assistant.sid}/twilio-voice`,
  });
}

/**
 * Create or update the Main Menu task for the assistant
 * @param {AssistantInstance} assistant
 * @param {TaskInstance[]} tasks
 * @param {string} baseUrl
 * @return {Promise<TaskInstance>}
 */
async function createOrUpdateMainMenuTask(assistant, tasks, baseUrl) {
  let task = tasks.find(task => task.uniqueName === 'main-menu');
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
    console.log('Update "Main Menu" task');
    await task.update({
      actions: actions,
    });
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
 * @param {string[]} nextTasks
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

  if (nextTasks.length > 1) {
    actions.actions.push({
      listen: { tasks: nextTasks },
    });
  } else {
    actions.actions.push({
      redirect: `task://${nextTasks[0]}`,
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
 * Create all tasks for an option
 * @param {AssistantInstance} assistant
 * @param {TaskInstance[]} tasks
 * @param {string} name
 * @param {object[]} options
 * @param {string} message
 * @return {Promise<void>}
 */
async function createOrUpdateOptionTasks(
  assistant,
  tasks,
  name,
  options,
  message
) {
  const nextTasks = [];
  for (let idx = options.length; idx > 0; idx--) {
    const taskName = `${name} Option ${idx}`;
    const option = options[idx - 1];
    await createOrUpdateGenericTask(
      assistant,
      tasks,
      taskName,
      option.response,
      [option.question],
      ['main-menu'].concat(nextTasks)
    );
    nextTasks.push(slugify(taskName));
  }
  await createOrUpdateGenericTask(
    assistant,
    tasks,
    name,
    message,
    [name.toLowerCase()],
    ['main-menu'].concat(nextTasks)
  );
}

module.exports = {
  updateOrCreateAssistant,
  linkAssistantToPhoneNumber,
  createOrUpdateMainMenuTask,
  createOrUpdateGenericTask,
  createOrUpdateOptionTasks,
};
