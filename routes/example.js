'use strict';

const express = require('express');

/* eslint-disable new-cap */
const router = express.Router();

// GET: /appointments
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Template App' });
});

// POST: /appointments
router.get('/example', function(req, res, next) {
  res.send({
    example: true,
  });
});

module.exports = router;
