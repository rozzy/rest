import fs from 'fs'
import path from 'path'
import yaml from 'node-yaml'

// there is a .gitignored file in the folder
// which creates automatically (if not exists)
// and stores the auth tokens to not authorize user several times in a row
const AUTH_FILE = path.join(__dirname, 'authtokens')

export function createAuthFile(callback, err, data) {
  if (err) {
    if (!callback) {
      throw new Error(err)
    } else {
      return callback(err)
    }
  } else if (callback) {
    return callback(null, data)
  }
}

export function createAuthfileIfNotExist(callback) {
  let exists = fs.existsSync(AUTH_FILE)

  if (!exists) {
    createAuthFile.bind(null, callback)

    fs.writeFile(
      AUTH_FILE,
      { flag: 'wx' },
      ''
    )
  } else if (callback) {
    return callback()
  }
}

export function getAuthfileContent() {
  return yaml.readSync(AUTH_FILE, 'utf-8') || {}
}

export function getToken(adapter) {
  let content = getAuthfileContent()

  return content && content[adapter] || null
}

export function writeToken(adapter, token) {
  let content = getAuthfileContent()
  content[adapter] = token

  return yaml.writeSync(AUTH_FILE, content)
}

export function tokenExists(adapter) {
  return getToken(adapter) !== null
}
