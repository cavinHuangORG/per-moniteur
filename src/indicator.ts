import { getObserver, hiddenTime } from './utils'
import { logIndicator } from './log'

export const getNavigationTime = () => {
  const navigation = window.performance.getEntriesByType('navigation')
  if (navigation.length > 0) {
    const timing = navigation[0] as PerformanceNavigationTiming
    if (timing) {
      const {
        domainLookupEnd,
        domainLookupStart,
        transferSize,
        encodedBodySize,
        connectEnd,
        connectStart,
        workerStart,
        redirectEnd,
        redirectStart,
        redirectCount,
        domInteractive,
        responseEnd,
        responseStart,
        fetchStart,
        domContentLoadedEventEnd,
        domContentLoadedEventStart,
        requestStart,
      } = timing

      return {
        redirect: {
          count: redirectCount,
          time: redirectEnd - redirectStart,
        },
        appCache: domainLookupStart - fetchStart,
        // dns lookup time
        dnsTime: domainLookupEnd - domainLookupStart,
        // handshake end - handshake start time
        TCP: connectEnd - connectStart,
        // HTTP head size
        headSize: transferSize - encodedBodySize || 0,
        responseTime: responseEnd - responseStart,
        // Time to First Byte
        TTFB: responseStart - requestStart,
        // fetch resource time
        fetchTime: responseEnd - fetchStart,
        // Service work response time
        workerTime: workerStart > 0 ? responseEnd - workerStart : 0,
        domReady: domContentLoadedEventEnd - fetchStart,
        // time to interactive
        tti: domInteractive - fetchStart,
        // DOMContentLoaded time
        DCL: domContentLoadedEventEnd - domContentLoadedEventStart,
      }
    }
  }
  return {}
}

export const getNetworkInfo = () => {
  if ('connection' in window.navigator) {
    const connection = window.navigator['connection'] || {}
    const { effectiveType, downlink, rtt, saveData } = connection
    return {
      effectiveType,
      downlink,
      // round-trip time
      rtt,
      saveData,
    }
  }
  return {}
}

export const getPaintTime = () => {
  const data: { [key: string]: number } = ({} = {})
  getObserver('paint', (entries) => {
    entries.forEach((entry) => {
      data[entry.name] = entry.startTime
    })
  })
  return data
}

export const getFID = () => {
  getObserver('first-input', (entries) => {
    entries.forEach((entry) => {
      if (entry.startTime < hiddenTime) {
        logIndicator('FID', entry.processingStart - entry.startTime)
      }
    })
  })
}

export const getLCP = () => {
  getObserver('largest-contentful-paint', (entries) => {
    entries.forEach((entry) => {
      if (entry.startTime < hiddenTime) {
        logIndicator('LCP Update', entry)
      }
    })
  })
}

export const getCLS = () => {
  getObserver('layout-shift', (entries) => {
    let cls = 0
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        cls += entry.value
      }
    })
    logIndicator('CLS Update', cls)
  })
}
