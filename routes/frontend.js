'use strict';
const express = require('express');
const cfg = require('../src/config');
const assistant = require('../src/assistant');
const Setup = require('../src/db').Setup;

/* eslint-disable new-cap */
const router = express.Router();

// GET: /
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Voice-Powered IVR Chatbot with Autopilot',
    number: cfg.twilioPhoneNumber,
    local: req.hostname.includes('local'),
  });
});

// GET: /setup
router.get('/setup', function(req, res, next) {
  Setup.get().then(setup =>
    res.render('setup', { setup: setup, local: req.hostname.includes('local') })
  );
});

router.post('/setup', function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}${req.baseUrl}`;
  const data = {
    companyName: req.body.companyName,
    businessHours: {
      start: req.body['businessHours.start'],
      end: req.body['businessHours.end'],
    },
    sales: {
      message: req.body['sales.message'],
      options: createOptions(
        req.body['sales.option.questions'],
        req.body['sales.option.responses']
      ),
    },
    support: {
      message: req.body['support.message'],
      options: createOptions(
        req.body['support.option.questions'],
        req.body['support.option.responses']
      ),
    },
    operator: {
      phoneNumber: req.body['operator.phoneNumber'],
    },
  };
  new Setup(data)
    .save()
    .then(setup => assistant.updateAssistant(setup, baseUrl));

  res.redirect('/');
});

/**
 * Zip questions and responses in a single array of objects
 * @param {string[]} questions
 * @param {string[]} responses
 * @return {object[]}
 */
function createOptions(questions, responses) {
  return questions.map((q, i) => ({
    question: q,
    response: responses[i],
  }));
}

module.exports = router;
