import BigNumber from 'bignumber.js'
export const toDate = (seconds) => {
  return (new Date(new BigNumber(seconds).toNumber() * 1000)).toISOString().split('T').join(' ').split('-').join('/').split('.000Z')[0]
}

export const pathAppend = (base, path) => {
  return base + (base[base.length - 1] === '/' ? '' : '/') + path
}

export const ignoreReject = async (fn) => {
  try {
    const result = await fn()
    return result
  } catch (e) {
    if (e.code !== 4001) {
      throw e
    }
    return false
  }
}

export const addressZero = '0x0000000000000000000000000000000000000000'

export const logListen = (web3, config, cb) => (
  web3.eth.subscribe('logs', config, (error, log) => {
    if (error) {
      console.error(error)
    }
    console.log(log)
  }).on('data', cb)
)
