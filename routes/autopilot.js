'use strict';
const twilio = require('twilio');
const express = require('express');
const assistant = require('../src/assistant');

/* eslint-disable new-cap */
const router = express.Router();

// POST: /collect/main-menu
router.post('/collect-main-menu', function(req, res, next) {
  const options = JSON.parse(req.body.Memory).twilio.collected_data.options;
  if (options.status === 'complete') {
    if (['sales', 'support'].includes(options.answers.option.answer)) {
      res.send({
        actions: [{ redirect: `task://${options.answers.option.answer}` }],
      });
    } else if (options.answers.option.answer === 'operator') {
      res.send({
        actions: [
          {
            redirect: `${req.protocol}://${req.hostname}${req.baseUrl}/operator`,
          },
        ],
      });
    } else {
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
  }
});

router.post('/operator', function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}${req.baseUrl}`;
  const actions = assistant.getOperatorActions(baseUrl, new Date());
  res.send({ actions: actions });
});

router.post('/operator-webhook', function(req, res, next) {
  const response = new twilio.twiml.VoiceResponse();
  response.dial(assistant.config.operatorPhoneNumber);
  res.send(response.toString());
});

module.exports = router;
