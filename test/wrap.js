// helper used to help rerun net/http/etc. tests under proxy

exports.setupProxy = function () {
  if (process.env.TM_API_KEY || process.env.PROXY_TOKEN) throw Error("Misconfiguration: neither TM_API_KEY nor PROXY_TOKEN should be set while running tests.");
  
  process.env.PROXY_IDLE = 1e3;   // so tests don't stare at their toes for a minute and a half…
  
  // TODO: remove this dev code once env vars support merged and production proxy back available
  process.env.PROXY_HOST = "localhost";
  process.env.PROXY_PORT = 5005;
  process.env.PROXY_TOKEN = "DEV-CRED";
  try {
    process.env.PROXY_CERT = require('fs').readFileSync("../proxy/config/public-cert.pem").toString();
  } catch (e) {
    // HACK: `make test` runs under different `process.cwd()` than when trying an individual test directly…
    process.env.PROXY_CERT = require('fs').readFileSync("../../../proxy/config/public-cert.pem").toString();
  }
  //process.env._PROXY_DBG = true;
  return;
  
  if (!process.env.TEST_TM_API_KEY) {
    console.warn("Cannot run proxied version of tests unless TEST_TM_API_KEY environment variable is set.");
    process.exit(0);
  }
  
  process.env.PROXY_TOKEN = process.env.TEST_TM_API_KEY;
};
