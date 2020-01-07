'use strict';
const twilio = require('twilio');
const express = require('express');
const assistant = require('../src/assistant');
const Setup = require('../src/db').Setup;

/* eslint-disable new-cap */
const router = express.Router();

// POST: /collect/main-menu
router.post('/collect-main-menu', function(req, res, next) {
  const options = JSON.parse(req.body.Memory).twilio.collected_data.options;
  const answer = options.answers.option.answer;
  if (options.status === 'complete') {
    switch (answer) {
      case 'sales':
      case 'support':
        res.send({
          actions: [{ redirect: `task://${answer}` }],
        });
        break;
      case 'operator':
        res.send({
          actions: [
            {
              handoff: {
                channel: 'voice',
                uri: `${req.protocol}://${req.hostname}${req.baseUrl}/operator-webhook`,
                method: 'POST',
              },
            },
          ],
        });
        break;
      default:
        res.send({
          actions: [
            {
              say: 'Invalid option',
            },
            {
              redirect: 'task://main-menu',
            },
          ],
        });
    }
  } else {
    console.error('%0', options);
  }
});

router.post('/greeting', function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}${req.baseUrl}`;
  Setup.get().then(setup =>
    res.send({
      actions: assistant.getGreetingActions(setup, baseUrl, new Date()),
    })
  );
});

router.post('/operator-webhook', function(req, res, next) {
  const response = new twilio.twiml.VoiceResponse();
  Setup.get().then(setup => {
    response.dial(setup.operator.phoneNumber);
    res.send(response.toString());
  });
});

module.exports = router;
