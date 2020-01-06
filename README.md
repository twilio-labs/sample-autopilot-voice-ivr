<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>
 
# Voice-Powered IVR Chatbot with Autopilot

[![Actions Status](https://github.com/TwilioDevEd/sample-autopilot-voice-ivr/workflows/Node%20CI/badge.svg)](https://github.com/TwilioDevEd/sample-autopilot-voice-ivr/actions)

## About

Interactive Voice Response or IVR is an automated telephony system that interacts with human callers through the use of voice and touch-tone keypad selections (DTMF tones).

This application shows how to build an IVR application using [Twilio Autopilot](https://www.twilio.com/docs/autopilot). Autopilot is a conversational AI platform to build, train, and deploy artificially intelligent applications that can interact with users over multiple channels.


Implementations in other languages:

| .NET | Java | Python | PHP | Ruby |
| :--- | :--- | :----- | :-- | :--- |
| TBD  | TBD  | TBD    | TBD | TBD  |

### How it works

This is a very simple application that provides a setup page where the user can enter all configurable values for the IVR tree. When the setup form is submitted it will run an async script to create all tasks for the IVR workflow in an [Autopilot Assistant](https://www.twilio.com/docs/autopilot/api/assistant). 

The application also provides a couple of endpoints to handle webhooks and return dynamic tasks for the IVR.

## Features

- Node.js web server using [Express.js](https://npm.im/express)
- User interface to setup IVR responses using [Twilio Helper Library](https://www.twilio.com/docs/libraries/node).
- Small JSON database using lowdb.
- Unit tests using [`mocha`](https://npm.im/mocha) and [`chai`](https://npm.im/chai)
- [Automated CI testing using GitHub Actions](/.github/workflows/nodejs.yml)
- One click deploy buttons for Heroku, Glitch and now.sh

## Set up

### Requirements

- [Node.js](https://nodejs.org/)
- A Twilio account - [sign up](https://www.twilio.com/try-twilio)

### Twilio Account Settings

This application should give you a ready-made starting point for writing your
own IVR application using Autopilot. Before we begin, we need to collect
all the config values we need to run the application:

| Config&nbsp;Value | Description                                                                                                                                                  |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                         |
| Auth&nbsp;Token   | Used to authenticate - [just like the above, you'll find this here](https://www.twilio.com/console).                                                         |
| Phone&nbsp;number | A Twilio phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164) - you can [get one here](https://www.twilio.com/console/phone-numbers/incoming) |

### Local development

After the above requirements have been met:

1. Clone this repository and `cd` into it

```bash
git clone git@github.com:TwilioDevEd/sample-autopilot-voice-ivr.git
cd sample-autopilot-voice-ivr
```

2. Install dependencies

```bash
npm install
```

3. Set your environment variables

```bash
npm run setup
```

See [Twilio Account Settings](#twilio-account-settings) to locate the necessary environment variables.

4. Run the application

```bash
npm start
```

Alternatively, you can use this command to start the server in development mode. It will reload whenever you change any files.

```bash
npm run dev
```

Your application is now accessible at [http://localhost:3000](http://localhost:3000/)

5. Make the application visible from the outside world using ngrok.

Your application needs to be accessible in a public internet address for Twilio to be able to connect with it. 

That's it!

### Tests

You can run the tests locally by typing:

```bash
npm test
```

### Cloud deployment

Additionally to trying out this application locally, you can deploy it to a variety of host services. Here is a small selection of them.

Please be aware that some of these might charge you for the usage or might make the source code for this application visible to the public. When in doubt research the respective hosting service first.

| Service                           |                                                                                                                                                                                                                           |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Heroku](https://www.heroku.com/) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/TwilioDeved/sample-autopilot-voice-ivr/tree/master)                                                                                                                                       |
| [Glitch](https://glitch.com)      | [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/clone-from-repo?REPO_URL=https://github.com/TwilioDevEd/sample-autopilot-voice-ivr.git) |
| [Zeit](https://zeit.co/)          | [![Deploy with ZEIT Now](https://zeit.co/button)](https://zeit.co/new/project?template=https://github.com/TwilioDevEd/sample-autopilot-voice-ivr/tree/master)                                                                 |


## Resources

- [Getting started with Twilio Autopilot (Video)](https://www.youtube.com/watch?v=edViFb-A0zw)
- [Autopilot Quickstart](https://www.twilio.com/docs/autopilot/quickstart)

## Contributing

This tutorial is open source and welcomes contributions. All contributions are subject to our [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

[Visit the project on GitHub](https://github.com/TwilioDevEd/sample-autopilot-voice-ivr)

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com
