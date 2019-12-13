const moment = require('moment');

// eslint-disable-next-line require-jsdoc
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
      uri: `${baseUrl}/webhook/operator`,
      method: 'POST',
    },
  });
  return actions;
}

module.exports = {
  generateOperatorActions: generateOperatorActions,
};
