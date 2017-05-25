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

var _nodeYaml = require('node-yaml');

var _nodeYaml2 = _interopRequireDefault(_nodeYaml);

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
      callback(err);
    }
  } else if (callback) {
    callback(null, data);
  }

  return '';
}

function createAuthfileIfNotExist(callback) {
  var exists = _fs2.default.existsSync(AUTH_FILE);

  if (!exists) {
    _fs2.default.writeFile(AUTH_FILE, { flag: 'wx' }, createAuthFile.bind(null, callback));
  } else if (callback) {
    return callback();
  }
}

function getAuthfileContent() {
  return _nodeYaml2.default.readSync(AUTH_FILE, 'utf-8') || {};
}

function getToken(adapter) {
  var content = getAuthfileContent();

  return content && content[adapter] || null;
}

function writeToken(adapter, token) {
  var content = getAuthfileContent();
  content[adapter] = token;

  return _nodeYaml2.default.writeSync(AUTH_FILE, content);
}

function tokenExists(adapter) {
  return getToken(adapter) !== null;
}