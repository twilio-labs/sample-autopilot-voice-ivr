const fs = require('fs');
const path = require('path');

/**
 * Mocks the helper library http client request
 * @param {object[]} options
 * @return {function}
 */
function mockApiRequest(options) {
  return function(requestOptions) {
    for (const option of options) {
      if (requestOptions.uri.includes(option.resource)) {
        let filename = `${option.resource}`;
        if (
          new RegExp(`${option.resource}(\.json)?$`).test(requestOptions.uri)
        ) {
          if (requestOptions.method === 'POST') {
            filename += '.instance';
          } else {
            filename += '.list';
            if (option.isEmpty) {
              filename += '.empty';
            }
          }
        } else {
          filename += '.instance';
        }
        const value = {
          statusCode: 200,
          body: fs.readFileSync(
            path.join(__dirname, `fixtures/${filename}.json`)
          ),
        };
        return new Promise(function(resolve, reject) {
          resolve(value);
        });
      }
    }
  };
}

module.exports = { mockApiRequest };
