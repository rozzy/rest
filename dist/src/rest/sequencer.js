'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repeat = repeat;
exports.createNew = createNew;
exports.next = next;
exports.executeMethod = executeMethod;
exports.commandExists = commandExists;
exports.runCommand = runCommand;
exports.isSequence = isSequence;
exports.getExecutableAction = getExecutableAction;
exports.executeAction = executeAction;
exports.parseCurrentStep = parseCurrentStep;
exports.expandSequence = expandSequence;
exports.injectIntoSequence = injectIntoSequence;
exports.runSequence = runSequence;
exports.executePattern = executePattern;
exports.isActionRegistered = isActionRegistered;
exports.checkSequenceAction = checkSequenceAction;
exports.checkPatternSequence = checkPatternSequence;
exports.checkPattern = checkPattern;
exports.checkAllPatterns = checkAllPatterns;
exports.isMethodRegistered = isMethodRegistered;
exports.findPattern = findPattern;

var _core = require('lodash/core');

var sequencer = {
  index: null,

  createNew: createNew, repeat: repeat, executeMethod: executeMethod, next: next
};

function repeat() {
  this.index += 1;

  return this.last();
}

function createNew(pattern, executable) {
  this.index = 0;
  this.last = null;
  this._pattern = pattern;
  this.sequence = pattern.sequence;

  executable(this);

  return this;
}

function next(instance) {
  var _this = this;

  var index = this.index,
      next = this.next;


  var proceed = function proceed() {
    if (_this.index + 1 < _this.sequence.length) {
      _this.index += 1;
      _this.next(instance);
    }
  };

  // console.log('next 0--->', this.sequence);
  // console.log('next 1--->', index);
  var step = parseCurrentStep(this.sequence[index], instance, this.sequence, index);
  var executionResults = step.call(instance, this, proceed, index);

  if (executionResults === true) {
    return proceed();
  }

  // if (executionResults === )
}

function executeMethod(executable) {
  var executionResults = executable({ index: ++this.index, done: function done() {} });

  // console.log('===> result:', executionResults)
}

function commandExists(instance, commandName) {
  return (0, _core.isFunction)(instance._methods[commandName]);
}

function runCommand(command) {
  if (typeof command === 'string' && isSequence(this, command)) {
    return executeSequence.call(this, command);
  }

  if ((0, _core.isFunction)(command) || commandExists(this, command)) {
    return execute(this, command);
  }

  throw new Error('Command doesn\'t exist', command);
}

function isSequence(givenAction) {
  return typeof givenAction === 'string' && givenAction[0] === ':';
}

function getExecutableAction(action, instance) {
  if ((0, _core.isFunction)(action)) {
    return action;
  }

  if (!instance || !instance._methods) {
    throw new Error('Instance doesn\'t have any methods registered');
  }

  return instance._methods[action];
}

function executeAction(action, instance, sequencer) {
  var executableAction = getExecutableAction(action, instance);

  sequencer.executeMethod(function (execution) {
    return executableAction.call(instance, sequencer, execution.done, execution.index);
  });
}

// sequencer = {}
//
// sequence = [.., .., .., .., [.., .., .., [.., .., ..]]]
// sequencer.registerSequence(sequence)
//
// sequencer.next(localIndex)
// next(index) {
//   let proceed = () => next(index + 1)
//   let executionResult = sequence[index](sequencer, proceed, index)
//
//   if (!sequence[index + 1]) {
//     return sequence.pattern.onFinish
//   }
//
//   function checkResultTypeAndProceed(result) {
//     if (result === true) {
//       return proceed()
//     }
//
//     if (result === 'string') {
//       executable = getExecutable(result)
//       injectIntoStack(index, executable)
//       return proceed()
//     }
//
//     if (result === 'function') {
//       injectIntoStack(index, result)
//       return proceed()
//     }
//
//     if (result === 'array' && validSequence(result)) {
//       result.forEach((executable, exIndex) => {
//         injectIntoStack(index + exIndex, executable)
//       })
//       return proceed()
//     }
//
//     if (isFunction(pattern.onFinish)) {
//       pattern.onFinish(index)
//     }
//     return false
//   }
//
//   if (executionResult === 'promise') {
//     result.then(promiseResult => {
//       checkResultTypeAndProceed(promiseResult)
//     })
//   } else {
//     checkResultTypeAndProceed(executionResult)
//   }
// }

function parseCurrentStep(action, instance, sequence, index) {
  // console.log('parseCurrentStep ------>', action)
  if (isSequence(action)) {
    return expandSequence(action, instance, sequence, index);
  }

  if ((0, _core.isFunction)(action)) {
    return action;
  }

  if (isActionRegistered(action, instance)) {
    return getExecutableAction(action, instance);
  }

  throw new Error('Action is unregistered: ' + action);
}

function expandSequence(action, instance, seq, index) {
  var _findPattern = findPattern(instance, action),
      sequence = _findPattern.sequence;

  injectIntoSequence(index, sequence, seq);

  var expandedResult = seq[index];
  return parseCurrentStep(expandedResult, instance, seq, index);
}

function injectIntoSequence(index, itemsToInject, sequence) {
  if (!(0, _core.isArray)(itemsToInject)) {
    sequence.splice(index, 1, itemsToInject);
  } else {
    sequence.splice.apply(sequence, [index, 1].concat(itemsToInject));
  }
}

function runSequence(sequencer, instance, pattern) {
  sequencer.next(instance);
}

function executePattern(instance, pattern) {
  return sequencer.createNew(pattern, function (sequencer) {
    return runSequence(sequencer, instance, pattern);
  });
}

function isActionRegistered(action, instance) {
  return !!instance && !!instance._methods && typeof action === 'string' && !!instance._methods[action] && (0, _core.isFunction)(instance._methods[action]);
}

function checkSequenceAction(action) {
  var isString = typeof action === 'string';
  var isFunc = (0, _core.isFunction)(action);

  if (!isFunc && !isString) {
    throw new TypeError('Sequence could only contain strings or functions');
  }

  if (!isFunc && !isActionRegistered.call(this, action)) {
    throw new Error('There is no registered action "' + action + '"');
  }

  return true;
}

function checkPatternSequence(sequence, context) {
  if (!sequence || !sequence.map) {
    throw new TypeError('"sequence" should be an array of sequences');
  }

  return sequence.map(checkSequenceAction.bind(context));
}

function checkPattern(pattern) {
  if (!(0, _core.isObject)(pattern)) {
    throw new TypeError('Pattern should be a plain object');
  }

  if (!pattern.hasOwnProperty('sequence')) {
    throw new TypeError('Pattern should contain the "sequence" property');
  }

  if (!(0, _core.isArray)(pattern.sequence)) {
    throw new TypeError('"Sequence" property should be an array of actions (see docs: sequence)');
  }

  checkPatternSequence(pattern.sequence, this);

  return true;
}

function checkAllPatterns(patterns, context) {
  return patterns.forEach(checkPattern.bind(context));
}

function isMethodRegistered(wantedMethod) {
  if (!this._methods) {
    return false;
  }

  var foundMethod = this._methods.filter(function (method) {
    return method === wantedMethod;
  });

  return foundMethod && foundMethod.length > 0;
}

// looks if the pattern was registered previously in the instance
// returns it when found
function findPattern(instance, givenPattern) {
  if ((0, _core.isArray)(givenPattern)) {
    // this is an anonymous pattern
    return { sequence: givenPattern };
  }

  if (typeof givenPattern !== 'string') {
    throw new TypeError('"pattern" should be a string/array');
  }

  if (givenPattern[0] === ':') {
    givenPattern = givenPattern.slice(1);
  }

  var foundPattern = instance._patterns.filter(function (currentPattern) {
    return currentPattern.name === givenPattern;
  });

  var pattern = foundPattern && foundPattern[0];

  if (!pattern) {
    throw new Error('Not a pattern: ' + givenPattern);
  }

  if (!pattern.sequence || !(0, _core.isArray)(pattern.sequence)) {
    throw new TypeError('The pattern should contain a sequence (array): ' + givenPattern);
  }

  return pattern;
}