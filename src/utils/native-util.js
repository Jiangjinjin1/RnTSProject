import { NativeModules } from 'react-native';

export const RNToNativeBridge = NativeModules.RNToNativeBridge || {}

export const getAppVersion = () => new Promise((resolve) => {
    let version = ''
    try {
      RNToNativeBridge.getAppVersion((res = {}) => {
        version = res.appVersion
        console.log('version:',version)
        return resolve(version)
      })
    } catch (e) {
      console.log('version-err:',e)
      return resolve(version)
    }
})

export default {}

