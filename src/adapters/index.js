import fs from 'fs'
import yaml from 'node-yaml'

const AUTH_FILE = 'authtokens'

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
  return fs.existsSync(AUTH_FILE, exists => {
    if (!exists) {
      fs.writeFile(
        AUTH_FILE,
        { flag: 'wx' },
        createAuthFile.bind(null, callback)
      )
    } else if (callback) {
      callback()
    }
  })
}

export function getAuthfileContent() {
  return yaml.readSync(AUTH_FILE, 'utf-8') || {}
}

export function getToken(adapter) {
  let content = getAuthfileContent()

  return content && content[adapter] || null
}

export function writeToken(adapter, token) {
  createAuthfileIfNotExist()

  let content = getAuthfileContent()
  content[adapter] = token

  return yaml.writeSync(AUTH_FILE, content)
}

export function tokenExists(adapter) {
  return getToken(adapter) !== null
}
