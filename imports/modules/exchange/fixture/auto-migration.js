import ExcheangeRateDetails from '../api/exchange-rates/exchange-rate-details'
import ExchangeCurrency from '../api/exchange-currency/exchange-currency'

export const migrateExchangeRateDetails = async () => {
  const selector = {
    $or: [{ status: { $exists: false } }],
  }

  const data = await ExcheangeRateDetails.find(selector).lean()

  const ids = []
  for (let i = 0; i < data.length; i++) {
    const it = data[i]
    it.status = 'active'
    ids.push(it._id)
  }

  if (ids.length) {
    await ExcheangeRateDetails.deleteMany({ _id: { $in: ids } })
    await ExcheangeRateDetails.insertMany(data)
  }

  return 'success'
}

export const migrateExchangeCurrency = async () => {
  const selector = {
    $or: [{ base: { $exists: false } }],
  }

  const data = await ExchangeCurrency.find(selector).lean()

  const ids = []
  for (let i = 0; i < data.length; i++) {
    const it = data[i]
    it.base = true
    if (it.symbol == '៛') it.base = false
    ids.push(it._id)
  }

  if (ids.length) {
    await ExchangeCurrency.deleteMany({ _id: { $in: ids } })
    await ExchangeCurrency.insertMany(data)
  }

  return 'success'
}
