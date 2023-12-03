import roles from './roles'
import Roles from '/imports/api/roles/roles'
import Modules from '/imports/api/modules/modules'
import TranTypes from '/imports/modules/exchange/api/transaction-types/transaction-type'
import {
  migrateExchangeCurrency,
  migrateExchangeRateDetails,
} from './auto-migration'
Meteor.startup(async () => {
  let modules = [
    {
      name: 'exchangeModule',
      module: 'Exchange',
      index: 1,
    },
  ]
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    // Check module exist
    const exist = await Modules.findOne({ name: mod.name }).lean()
    if (!exist) {
      await Modules.create(mod)
    }
  }
  // Roles

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    if (role) {
      // Check role exist
      if (!Roles.findOne({ name: role.name })) {
        Roles.insert(role)
      }
      if (role.module === 'Setting') {
        if (
          !Roles.findOne({
            name: role.name,
            module: role.module,
            title: role.title,
          })
        ) {
          let _id = Roles.findOne({ name: role.name })._id
          if (_id) {
            Roles.update({ _id }, { $set: role })
          }
        }
      }
    }
  }

  // Transaction type
  const type = {
    name: 'General',
  }
  const countDoc = await TranTypes.find({}).countDocuments()
  if (!countDoc) {
    const doc = await TranTypes(type)
    await doc.save()
  }

  // Auto migrate
  await migrateExchangeCurrency()
  await migrateExchangeRateDetails()
})
