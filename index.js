import rest from './src/core'
import soundcloudAdapter from './src/adapters/soundcloud'

rest.registerAdapter(soundcloudAdapter)

export default rest
