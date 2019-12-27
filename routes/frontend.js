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
  });
});

// GET: /setup
router.get('/setup', function(req, res, next) {
  Setup.get().then(setup => res.render('setup', setup));
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
      options: [],
    },
    support: {
      message: req.body['support.message'],
      options: [],
    },
    operator: {
      phoneNumber: req.body['operator.phoneNumber'],
    },
  };
  for (let i = 0; i < req.body['sales.option.questions'].length; i++) {
    data.sales.options.push({
      question: req.body['sales.option.questions'][i],
      response: req.body['sales.option.responses'][i],
    });
  }
  for (let i = 0; i < req.body['support.option.questions'].length; i++) {
    data.support.options.push({
      question: req.body['support.option.questions'][i],
      response: req.body['support.option.responses'][i],
    });
  }
  new Setup(data)
    .save()
    .then(setup => assistant.updateAssistant(setup, baseUrl));

  res.redirect('/');
});

module.exports = router;
