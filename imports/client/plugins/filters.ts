import { App } from 'vue'
import { ceil, defaults, floor, padEnd, round } from 'lodash'
import numeral from 'numeral'
import moment from 'moment'
import { Decimal } from 'decimal.js'
import { store } from '/imports/store'

const Filters = {
  install: (app: App) => {
    const $filters = {
      date: formatDate,
      dateTime: formatDateTime,
      number: formatNumber,
      numberDigit: formatNumberDigit,
      currency: formatCurrency,
      positive: formatPositive,
      exchangeCurrency: formatExchangeCurrency, //for exchange rate
      exchangeBaseCurrency: formatExchangeBaseCurrency, //for Exchange rate
      jsonStrWithoutBraces: jsonStrWithoutBraces,
      refPrefix,
      roundCurrency,
    }
    app.config.globalProperties.$filters = $filters // global var

    // Loop provide to component
    for (const key of Object.keys($filters)) {
      const filter = $filters[key]
      app.provide(`$filters.${key}`, filter) // use: const formatDate = inject('$filters.date')
    }
  },
}

export default Filters

/**
 * Functions
 */
const formatDate = (value: Date, opts?: { [key: string]: any }) => {
  const setting =
    store &&
    store.state.app &&
    store.state.app.company &&
    store.state.app.company.setting

  opts = opts || {}
  defaults(opts, {
    nullFormat: '',
    format: (setting && setting.dateFormat.split(' ')[0]) || 'DD/MM/YYYY',
  })

  return value ? moment(new Date(value)).format(opts.format) : opts.nullFormat
}

const formatDateTime = (value: Date, opts?: { [key: string]: any }) => {
  const setting =
    store &&
    store.state.app &&
    store.state.app.company &&
    store.state.app.company.setting

  opts = opts || {}
  defaults(opts, {
    nullFormat: '',
    format: (setting && setting.dateFormat) || 'DD/MM/YYYY H:mm:ss',
  })

  return value ? moment(new Date(value)).format(opts.format) : opts.nullFormat
}

const formatNumber = (
  value: number | Decimal,
  currency?: string,
  opts?: { [key: string]: any }
): string => {
  const decimalNumber: number =
    (store &&
      store.state.app &&
      store.state.app.company &&
      store.state.app.company.setting.decimalNumber) ||
    2
  const settingBase =
    store &&
    store.state.app &&
    store.state.app.company &&
    store.state.app.company.setting &&
    store.state.app.company.setting.baseCurrency

  let checkCurrency = decimalNumber

  if (currency) {
    checkCurrency =
      settingBase == 'USD' && currency == 'usd'
        ? decimalNumber
        : settingBase == 'KHR' && currency == 'usd'
        ? decimalNumber
        : settingBase == 'THB' && currency == 'usd'
        ? decimalNumber
        : 0
  } else {
    checkCurrency = settingBase == 'USD' ? decimalNumber : 0
  }
  opts = opts || {}
  defaults(opts, {
    zeroNullFormat: '',
    format: `0,0.` + padEnd('', checkCurrency, '0') || '0,0.00',
  })

  let valueNumber: number = Decimal.isDecimal(value)
    ? (value as Decimal).toNumber()
    : (value as number)

  if (valueNumber) {
    valueNumber = Decimal(valueNumber)
    if (valueNumber.isNeg()) {
      valueNumber = valueNumber.times(-1)
      valueNumber = (valueNumber as Decimal).toNumber()
      if (currency) {
        valueNumber =
          settingBase == 'USD' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : settingBase == 'KHR' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : settingBase == 'THB' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : (value as number)
      } else {
        valueNumber =
          settingBase == 'USD' ? round(valueNumber, decimalNumber) : valueNumber
      }
      valueNumber = valueNumber * -1
    } else {
      valueNumber = Decimal.isDecimal(valueNumber)
        ? (valueNumber as Decimal).toNumber()
        : (valueNumber as number)
      if (currency) {
        valueNumber =
          settingBase == 'USD' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : settingBase == 'KHR' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : settingBase == 'THB' && currency == 'usd'
            ? round(valueNumber, decimalNumber)
            : (value as number)
      } else {
        valueNumber =
          settingBase == 'USD' ? round(valueNumber, decimalNumber) : valueNumber
      }
    }
  }

  return valueNumber
    ? numeral(valueNumber).format(opts.format)
    : opts.zeroNullFormat
}

function formatNumberDigit(
  value: number | Decimal,
  opts?: { [key: string]: any }
): string {
  let decimalNumber = 2

  let valueNumber: number = Decimal.isDecimal(value)
    ? (value as Decimal).toNumber()
    : (value as number)

  if (valueNumber) {
    valueNumber = Decimal(valueNumber)
    if (valueNumber.isNeg()) {
      valueNumber = valueNumber.times(-1)
      valueNumber = (valueNumber as Decimal).toNumber()

      if (getPrecision(valueNumber) >= 7) {
        decimalNumber = 7
        valueNumber = round(valueNumber, decimalNumber)
      } else {
        decimalNumber = getPrecision(valueNumber)
        valueNumber = round(valueNumber, decimalNumber)
      }

      valueNumber = valueNumber * -1
    } else {
      valueNumber = Decimal.isDecimal(valueNumber)
        ? (valueNumber as Decimal).toNumber()
        : (valueNumber as number)
      if (getPrecision(valueNumber) >= 7) {
        decimalNumber = 7
        valueNumber = round(valueNumber, decimalNumber)
      } else {
        decimalNumber = getPrecision(valueNumber)
        valueNumber = round(valueNumber, decimalNumber)
      }
    }
  }

  opts = opts || {}
  defaults(opts, {
    zeroNullFormat: '',
    format: `0,0.` + padEnd('', decimalNumber, '0') || '0,0.00',
  })
  return valueNumber
    ? numeral(valueNumber).format(opts.format)
    : opts.zeroNullFormat
}

function getPrecision(num: number | string): number {
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
  if (!match) {
    return 0
  }
  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) -
      // Adjust for scientific notation.
      (match[2] ? +match[2] : 0)
  )
}

function formatCurrency(
  value: number | Decimal,
  opts: { [key: string]: any }
): string {
  const baseCurrency: string =
    store &&
    store.state.app &&
    store.state.app.company &&
    store.state.app.company.setting &&
    store.state.app.company.setting.baseCurrency

  let curr: string = baseCurrency

  if (baseCurrency == 'USD') {
    curr = '$'
  } else if (baseCurrency == 'KHR') {
    curr = '៛'
  } else if (baseCurrency == 'THB') {
    curr = 'B'
  }
  return formatNumber(value, undefined, opts) + ' ' + (curr ? curr : '$')
}

function formatPositive(value: number) {
  return value < 0 ? -value : value
}

function jsonStrWithoutBraces(value: { [key: string]: any }) {
  return JSON.stringify(value).replace(/[{}]/g, '')
}

function refPrefix(value: string, prefix: string) {
  return value.replaceFirst(`${prefix || ''}`, '')
}

function roundCurrency(
  value: number,
  currency?: string,
  type?: string
): string {
  const setting =
    store &&
    store.state.app &&
    store.state.app.company &&
    store.state.app.company.setting
  currency = currency || setting.baseCurrency.toLowerCase()
  let res = 0
  if (type === 'general') {
    if (currency === 'usd') res = round(value, 2)
    else if (currency === 'khr') res = round(value, -2)
    else if (currency === 'thb') res = round(value, 0)
  } else if (type === 'up') {
    if (currency === 'usd') res = ceil(value, 2)
    else if (currency === 'khr') res = ceil(value, -2)
    else if (currency === 'thb') res = ceil(value, 0)
  } else if (type === 'down') {
    if (currency === 'usd') res = floor(value, 2)
    else if (currency === 'khr') res = floor(value, -2)
    else if (currency === 'thb') res = floor(value, 0)
  }

  return formatNumber(res, currency)
}

function formatExchangeCurrency(value, frm, opts) {
  let curr = ''
  let digit = 0
  if (frm === '2') {
    curr = '$'
    digit = 2
  } else if (frm === '-2') {
    curr = '៛'
    digit = 0
  } else if (frm === '0') {
    curr = '฿'
    digit = 0
  }
  const convertStrNum = parseInt(frm)
  opts = opts || {}
  defaults(opts, {
    zeroNullFormat: '',
    format: `0,0.` + padEnd('', convertStrNum, '0') || '0,0.00',
  })
  return value
    ? numeral(round(value, convertStrNum)).format(opts.format) + curr
    : opts.zeroNullFormat
}
function formatExchangeBaseCurrency(value, frm, opts) {
  const curr = ''
  // let digit = 2
  // if (frm === '$') {
  //   curr = '$'
  //   digit = 2
  // } else if (frm === '៛') {
  //   curr = '៛'
  //   digit = -2
  // } else if (frm === '฿') {
  //   curr = '฿'
  //   digit = 0
  // }
  // const convertStrNum = parseInt(frm)

  const digit =
    (store &&
      store.state.app &&
      store.state.app.company &&
      store.state.app.company.setting.decimalNumber) ||
    2
  opts = opts || {}
  defaults(opts, {
    zeroNullFormat: '',
    format: `0,0.` + padEnd('', digit, '0') || '0,0.00',
  })
  return value
    ? numeral(round(value, digit)).format(opts.format) + curr
    : opts.zeroNullFormat
}
