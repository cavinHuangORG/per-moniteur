import { isSupportPerformance } from './utils'
import { log, logIndicator } from './log'
import {
  getNavigationTime,
  getNetworkInfo,
  getPaintTime,
  getFID,
  getLCP,
  getCLS,
} from './indicator'
import { hiddenTime } from './utils'

export default class Per {
  constructor() {
    if (!isSupportPerformance) {
      log('该浏览器不支持 Performance API')
      return
    }
    logIndicator('Navigation Time', getNavigationTime())
    logIndicator('Network Info', getNetworkInfo())
    logIndicator('Paint Time', getPaintTime())
    getFID()
    getLCP()
    getCLS()

    // indicator not be measured when the page is loaded in a background tab
    document.addEventListener(
      'visibilitychange',
      (event) => {
        // @ts-ignore
        hiddenTime = Math.min(hiddenTime, event.timeStamp)
      },
      { once: true }
    )
  }
}
