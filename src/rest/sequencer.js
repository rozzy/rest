import { isFunction, isArray, isObject } from 'lodash/core'

let sequencer = {
  index: null,
  prevResolution: null,

  createNew, repeat
}

export function repeat() {
  this.index += 1

  return this.last()
}

export function createNew(executable) {
  this.index = 0
  this.last = executable

  this.last()

  return this
}

export function commandExists(instance, commandName) {
  return isFunction(instance._methods[commandName])
}

export function runCommand(command) {
  if (typeof command === 'string' && isSequence(this, command)) {
    return runSequence.call(this, command)
  }

  if (isFunction(command) || commandExists(this, command)) {
    return execute(this, command)
  }

  throw new Error('Command doesn\'t exist', command)
}

export function findCommand(instance, command) {
  return instance._methods[command]
}

export function executeFunction(instance, method) {

  let executionResults = method.call(instance)
}

export function executeSequence(instance, command) {
  if (!isFunction(command)) {
    command = findCommand(instance, command)
  }

  return sequencer.createNew(() => executeFunction(instance, command))
}
