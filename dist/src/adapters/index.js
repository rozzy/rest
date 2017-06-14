'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAuthFile = createAuthFile;
exports.createAuthfileIfNotExist = createAuthfileIfNotExist;
exports.getAuthfileContent = getAuthfileContent;
exports.getToken = getToken;
exports.writeToken = writeToken;
exports.tokenExists = tokenExists;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// there is a .gitignored file in the folder
// which creates automatically (if not exists)
// and stores the auth tokens to not authorize user several times in a row
var AUTH_FILE = _path2.default.join(__dirname, 'authtokens');

function createAuthFile(callback, err, data) {
  if (err) {
    if (!callback) {
      throw new Error(err);
    } else {
      return callback(err);
    }
  } else if (callback) {
    return callback(null, data);
  }
}

function createAuthfileIfNotExist(callback) {
  var exists = _fs2.default.existsSync(AUTH_FILE);

  if (!exists) {
    _fs2.default.writeFile(AUTH_FILE, '{}', { flag: 'wx' }, createAuthFile.bind(null, callback));
  } else if (callback) {
    return callback();
  }
}

function getAuthfileContent() {
  return _jsonfile2.default.readFileSync(AUTH_FILE);
}

function getToken(adapter) {
  var content = getAuthfileContent();

  return content && content[adapter] || null;
}

function writeToken(adapter, token) {
  var content = getAuthfileContent();
  content[adapter] = token;
  // return fs.writeFileSync(AUTH_FILE, yaml.dump(content))
  _jsonfile2.default.writeFile(AUTH_FILE, content);
}

function tokenExists(adapter) {
  return getToken(adapter) !== null;
}