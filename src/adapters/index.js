import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'

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
    fs.writeFile(
      AUTH_FILE,
      '{}',
      { flag: 'wx' },
      createAuthFile.bind(null, callback)
    )
  } else if (callback) {
    return callback()
  }
}

export function getAuthfileContent() {
  return jsonfile.readFileSync(AUTH_FILE)
}

export function getToken(adapter) {
  let content = getAuthfileContent()

  return content && content[adapter] || null
}

export function writeToken(adapter, token) {
  let content = getAuthfileContent()
  content[adapter] = token
  // return fs.writeFileSync(AUTH_FILE, yaml.dump(content))
  jsonfile.writeFile(AUTH_FILE, content)
}

export function tokenExists(adapter) {
  return getToken(adapter) !== null
}
