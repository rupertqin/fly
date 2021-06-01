const http = require("http")
const https = require("https")

const methods = ['get', 'post', 'head', 'put', 'delete'];
const httpRequest = {};

for (let actionName of methods) {
  httpRequest[actionName] = (...args) => action(actionName, ...args)
}

function action(method, url, body = null) {
  if (!methods.includes(method)) {
    throw new Error(`Invalid method: ${method}`);
  }

  let urlObject;

  try {
    urlObject = new URL(url);
  } catch (error) {
    throw new Error(`Invalid url ${url}`);
  }

  if (body && method !== 'post') {
    throw new Error(`Invalid use of the body parameter while using the ${method.toUpperCase()} method.`);
  }

  const isSecurity = url.startsWith('https')
  const port = urlObject.port || isSecurity ? 443 : 80;
  const httpInstance = isSecurity ? https : http;

  let options = {
    method: method.toUpperCase(),
    hostname: urlObject.hostname,
    path: urlObject.pathname,
    port,
  };

  if (body) {
    options.headers = {'Content-Length': Buffer.byteLength(body)};
  }

  return new Promise((resolve, reject) => {
    const clientRequest = httpInstance.request(options, res => {

      // Response object.
      let response = {
        statusCode: res.statusCode,
        headers: res.headers,
        body: []
      };

      // Collect response body data.
      res.on('data', chunk => {
        // chunk: Buffer
        response.body.push(chunk);
      });

      // Resolve on end.
      res.on('end', () => {
        if (response.body.length) {
          response.body = response.body.join();

          try {
            response.body = JSON.parse(response.body);
          } catch (error) {
            // Silently fail if response is not JSON.
          }
        }

        resolve(response);
      });
    });
    
    // Reject on request error.
    clientRequest.on('error', error => {
      reject(error);
    });

    // Write request body if present.
    if (body) {
      clientRequest.write(body);
    }

    // Close HTTP connection.
    clientRequest.end();
  });
}

module.exports = httpRequest

 
