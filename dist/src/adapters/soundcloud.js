'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = soundcloudAdapter;
function soundcloudAdapter(restSettings) {
  return {
    name: 'soundcloud',
    defaultThreads: 1,
    defaultLimist: {
      callsPerPeriod: 15000,
      period: 86400
    },

    authorize: function authorize(credentials, settings, instance) {
      // console.log('@authorize', [restSettings, credentials, settings], instance, "\n -------------\n")
    },
    deauthorize: function deauthorize(credentials, settings, instance) {
      console.log('@deauthorize', [restSettings, credentials, settings], instance);
    }
  };
}