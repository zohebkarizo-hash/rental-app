const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3000 });
  console.log("TUNNEL_URL=" + tunnel.url);
})();
