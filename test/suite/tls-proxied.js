require("../wrap").setupProxy();
process.env.PROXY_TRUSTED = true;
require("./tls.js");
