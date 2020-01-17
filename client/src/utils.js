import BigNumber from 'bignumber.js'
export const toDate = (seconds) => {
    return (new Date(new BigNumber(seconds).toNumber() * 1000)).toISOString().split('T').join(' ').split('-').join('/')
}