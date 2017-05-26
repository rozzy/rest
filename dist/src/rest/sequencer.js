'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repeat = repeat;
exports.createNew = createNew;
exports.next = next;
exports.registerNamedFunction = registerNamedFunction;
exports.isntRepeatingSequence = isntRepeatingSequence;
exports.isSequence = isSequence;
exports.getExecutableAction = getExecutableAction;
exports.parseAction = parseAction;
exports.expandSequence = expandSequence;
exports.injectIntoSequence = injectIntoSequence;
exports.runSequence = runSequence;
exports.executePattern = executePattern;
exports.isActionRegistered = isActionRegistered;
exports.findPattern = findPattern;

var _core = require('lodash/core');

// TODO
// how to improve sequencer:

// to allow a user repeat a particular sequence, execute onStart/onFinish/onError
// callbacks for a particular sequence, it is possible to emplement pointers
// which will be stored in a sequencer and will virtually split the stack into
// a set of sequences. it will store data in the sequencer object. when there is
// a sequence in the stack, before expanding the sequnce it will mark it's start
// (current index in the stack). then sequncer could be redirected to that stack
// index (implement goTo or repeatCurrentSequence), also user will be able
// to check the name of actual sequence to make more complex data calculations.

// implementing onFinish method could be pretty hard, because it is very hard
// to understand where is the end of a particular sequence: a method could expand
// the stack with returning a new sequence. so that, if onFinish is specified for
// a particular pattern, we could wrap the last element into a function that will
// execute this onFinish method and return original action. just a simple decorator.
// this could be also applied to onStart method. the only thing i have to think
// about is how to make this pattern callback execute after stack action that
// will be wrapped.

// implementing the pointers system. all pointers will be stored in a particular
// space inside of the sequencer object. it is a simple object with the following
// structure:
// pointers: {
//   0: 'pattern1',
//   2: 'pattern2',
//   3: [pattern1OnFinish, pattern2OnFinish]
// }
// this is how the pointers object will be stored for the following patterns:
// [{
//   name: 'pattern1',
//               0 in stack        1 in stack (index)
//   sequence: [someRandomMethod, someTestMethod, ':pattern2'],
//   onFinish: pattern1OnFinish
// }, {
//   name: 'pattern2',
//              2 in stack         3 in stack (index)
//   sequnce: [someAnotherMethod, someLastMethod],
//   onFinish: pattern2OnFinish
// }]
// since the first pattern has a link to the second pattern, and they both have
// onFinish callbacks, callbacks should be executed one after another.
// we can also see that in pointers object on 0 and 2 indexes there are names
// of patterns. that is how we can detect which sequence is used at the moment.
// we can also just set the current sequence name to sequencer object.

// the hardest part is to detect when the finish of the sequnce, because these
// 2 patterns from above will look like that in the stack:
//   0                 1               2                  3
// [someRandomMethod, someTestMethod, someAnotherMethod, someLastMethod]
// but i can try to implement the pattern described above.

var sequencer = {
  public: {
    index: 0,
    prevResolution: null,
    last: null,
    repeat: repeat
  },

  index: null,
  createNew: createNew, repeat: repeat, next: next
};

function repeat() {
  sequencer.public.index += 1;
  sequencer.index = 0;

  return sequencer.next(sequencer.instance);
}

function createNew(instance, pattern, executable) {
  this.public.index = 0;
  this.index = 0;
  this.pattern = pattern;
  this.stack = pattern.sequence;
  this.instance = instance;

  executable(this);

  return this;
}

function next(instance) {
  var _this = this;

  var next = this.next;
  var index = this.index;


  var currentAction = this.stack[index];

  var proceed = function proceed() {
    if (_this.index + 1 < _this.stack.length) {
      _this.index += 1;
      _this.public.index += 1;
      _this.next(instance);
    }
  };

  var checkResultTypeAndProceed = function checkResultTypeAndProceed(actionResult) {
    if (actionResult === true) {
      return proceed();
    } else if (!actionResult) {
      return;
    }

    registerNamedFunction(actionResult);

    if (isntRepeatingSequence(actionResult)) {
      injectIntoSequence(index + 1, actionResult, _this.stack, false);
      return proceed();
    }
  };

  registerNamedFunction(currentAction);

  if (isntRepeatingSequence(currentAction)) {
    var step = parseAction(currentAction, instance, this.stack, index);
    var executionResult = step.call(instance, instance._data, proceed, this.public, this.public.index, index);

    this.public.last = step;
    this.public.prevResolution = executionResult;

    if ((0, _core.isObject)(executionResult) && (0, _core.isFunction)(executionResult.then)) {
      executionResult.then(checkResultTypeAndProceed, checkResultTypeAndProceed);
    } else if (!!executionResult) {
      checkResultTypeAndProceed(executionResult);
    }
  }
}

function registerNamedFunction(func) {
  if ((0, _core.isFunction)(func) && func.name) {
    sequencer.instance.registerMethods(function (_) {
      return func;
    });
  }
}

function isntRepeatingSequence(action) {
  var isRepeatingSequence = isSequence(action) && action === ':' + sequencer.pattern.name;

  if (isRepeatingSequence) {
    sequencer.repeat();
  }

  return !isRepeatingSequence;
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

function parseAction(action, instance, sequence, index) {
  if (isSequence(action) || (0, _core.isArray)(action)) {
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
  var sequence = void 0;

  if ((0, _core.isArray)(action)) {
    sequence = action;
  } else {
    sequence = findPattern(instance, action).sequence;
  }

  injectIntoSequence(index, sequence, seq);

  var expandedResult = seq[index];
  return parseAction(expandedResult, instance, seq, index);
}

function injectIntoSequence(index, itemsToInject, sequence) {
  var replace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  if (!(0, _core.isArray)(itemsToInject)) {
    sequence.splice(index, +replace, itemsToInject);
  } else {
    sequence.splice.apply(sequence, [index, +replace].concat(itemsToInject));
  }
}

function runSequence(sequencer, instance, pattern) {
  sequencer.next(instance);
}

function executePattern(instance, pattern) {
  return sequencer.createNew(instance, pattern, function (sequencer) {
    return runSequence(sequencer, instance, pattern);
  });
}

function isActionRegistered(action, instance) {
  return !!instance && !!instance._methods && typeof action === 'string' && !!instance._methods[action] && (0, _core.isFunction)(instance._methods[action]);
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