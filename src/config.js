if (!process.env.CI) {
  require('dotenv-safe').config();
}

const cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
cfg.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || 'ACxxxxxxxxxxxxx';
cfg.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '1234567890abc';

// A Twilio number you control - choose one from:
// Specify in E.164 format, e.g. "+16519998877"
cfg.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Export configuration object
module.exports = cfg;
