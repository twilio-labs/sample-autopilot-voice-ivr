'use strict';
require('dotenv-safe').config();

const express = require('express');

const cfg = require('../src/config');

const assistant = require('../src/assistant');

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
  res.render('setup', assistant.config);
});

router.post('/setup', function(req, res, next) {
  const baseUrl = `${req.protocol}://${req.hostname}${req.baseUrl}`;

  assistant.config = req.body;
  assistant.update(baseUrl).then(() => {
    assistant.saveConfig();
  });

  res.redirect('/setup');
});

module.exports = router;
