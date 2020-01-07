const cfg = require('./src/config');
const server = require('./server');

server.listen(cfg.port, function() {
  console.log(`Starting autopilot-ivr at http://localhost:${cfg.port}`);
});
