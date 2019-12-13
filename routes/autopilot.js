'use strict';
require('dotenv-safe').config();

const twilio = require('twilio');
const express = require('express');
const generateOperatorActions = require('../src/actions');

const operatorPhoneNumber = process.env.OPERATOR_PHONE_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/* eslint-disable new-cap */
const router = express.Router();

// GET: /
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Voice-Powered IVR Chatbot with Autopilot',
    number: twilioPhoneNumber,
  });
});

// POST: /collect/main-menu
router.post('/autopilot/collect-main-menu', function(req, res, next) {
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
            redirect: `${req.protocol}://${req.hostname}${req.baseUrl}/autopilot/operator`,
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

router.post('/autopilot/operator', function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}${req.baseUrl}`;
  const actions = generateOperatorActions(baseUrl, new Date());
  res.send({ actions: actions });
});

router.post('/webhook/operator', function(req, res, next) {
  const response = new twilio.twiml.VoiceResponse();
  response.dial(operatorPhoneNumber);
  res.send(response.toString());
});

module.exports = router;
