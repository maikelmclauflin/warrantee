import BigNumber from 'bignumber.js'
export const toDate = (seconds) => {
    return (new Date(new BigNumber(seconds).toNumber() * 1000)).toISOString().split('T').join(' ').split('-').join('/').split('.000Z')[0]
}

export const pathAppend = (base, path) => {
    return base + (base[base.length - 1] === '/' ? '' : '/') + path
}

export const ignoreReject = async (fn) => {
    try {
        await fn()
    } catch (e) {
        debugger;
        if (e.code !== 4001) {
            throw e
        }
    }
}

export const addressZero = '0x0000000000000000000000000000000000000000'
