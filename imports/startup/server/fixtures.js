import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { EJSON } from 'meteor/ejson'
import moment from 'moment'

import roleData from './roles'

import Company from '../../api/company/company'
import Branches from '../../api/branches/branches'
import Currencies from '../../api/currencies/currencies'
import Exchanges from '../../api/exchanges/exchanges'
import Employees from '../../api/employees/employees'
import ShellJs from '../../api/shellJs/ShellJs'
import ClosingDate from '../../api/closing-date/ClosingDate'
// import JournalTypes from '../../api/journal-types/journal-types'
// import AccountTypes from '/imports/api/account-types/account-types'
// import ChartAccounts from '/imports/api/chart-accounts/chart-accounts'

import { insertBranch } from '../../api/branches/methods'
import { insertClosingDate } from '../../api/closing-date/methods'
// import { insertAccountType } from '/imports/api/account-types/methods'
// import { insertChartAccount } from '/imports/api/chart-accounts/methods'

import Roles from '../../api/roles/roles.js'
import Modules from '../../api/modules/modules'

Meteor.startup(async function () {
  // Modules
  const modules = EJSON.parse(Assets.getText('core/modules.json'))
  for (let mod of modules) {
    // Check role exist
    if ((await Modules.findOne({ name: mod.name }).lean()) == null) {
      await Modules.create(mod)
    }
  }

  /**
   * Production
   */
  // Backup data
  if (ShellJs.find().count() === 0) {
    const data = [
      {
        name: 'Local Backup',
        tranType: 'Backup',
        command: `
          #!/bin/bash
          HOST="127.0.0.1"
          PORT="27017"
          DB_NAME="dbName"

          BACKUP_PATH="/data"
          BACKUP_NAME="Backup_$(date +%Y-%m-%d)"

          GDRIVE_PATH="123456"

          # Mongo Backup
          mongodump --host $HOST --port $PORT --db $DB_NAME --out $BACKUP_PATH/$BACKUP_NAME

          # Compress File
          cd $BACKUP_PATH
          tar -czvf $BACKUP_NAME.tar.gz $BACKUP_NAME

          # Remove Backup Directory
          rm -rf $BACKUP_PATH/$BACKUP_NAME

          # Gdrive Upload
          gdrive upload --parent $GDRIVE_PATH $BACKUP_NAME.tar.gz
        `,
      },
      {
        name: 'Docker Backup',
        tranType: 'Backup',
        command: `
          #!/bin/bash
          HOST="127.0.0.1"
          PORT="27017"
          DB_NAME="dbName"

          BACKUP_PATH="/data"
          BACKUP_NAME="Backup_$(date +%Y-%m-%d)"

          DOCKER_CONTAINER="mongodb"
          DOCKER_PATH="/backup"

          GDRIVE_PATH="123456"

          # Mongo Backup
          docker exec $DOCKER_CONTAINER mongodump --host $HOST --port $PORT --db $DB_NAME --out $DOCKER_PATH/$BACKUP_NAME
          docker cp $DOCKER_CONTAINER:/$DOCKER_PATH/$BACKUP_NAME /$BACKUP_PATH

          # Compress File
          cd $BACKUP_PATH
          tar -czvf $BACKUP_NAME.tar.gz $BACKUP_NAME

          # Gdrive Upload
          gdrive upload --parent $GDRIVE_PATH $BACKUP_NAME.tar.gz

          # Remove
          rm -rf $BACKUP_PATH/$BACKUP_NAME
          #rm $BACKUP_PATH/$BACKUP_NAME.tar.gz
          docker exec $DOCKER_CONTAINER rm -rf /$DOCKER_PATH/$BACKUP_NAME
        `,
      },
    ]

    data.forEach((it) => {
      ShellJs.insert(it)
    })
  }

  // Company
  if (Company.find().count() === 0) {
    const data = EJSON.parse(Assets.getText('core/company.json'))
    data.setting['fiscalDate'] = moment().startOf('year').toDate()
    Company.insert(data)
  }

  // Branch
  if (Branches.find().count() === 0) {
    const data = EJSON.parse(Assets.getText('core/branch.json'))
    data.forEach((doc) => {
      insertBranch.call(doc)
    })
  }

  // Closing date
  if (ClosingDate.find().count() === 0) {
    let branches = Branches.find({}).fetch()
    // Loop branch
    branches.forEach((it) => {
      let closingData = ClosingDate.findOne({ branchId: it['_id'] })
      if (!closingData) {
        let data = {
          closingDate: moment().endOf('day').toDate(),
          branchId: it['_id'],
        }
        insertClosingDate.call({ doc: data })
      }
    })
  }

  // Currencies
  if (Currencies.find().count() === 0) {
    const data = EJSON.parse(Assets.getText('core/currency.json'))
    data.forEach((doc) => {
      Currencies.insert(doc)
    })
  }

  // Exchange
  if (Exchanges.find().count() === 0) {
    const data = [
      {
        base: 'USD',
        exDate: moment().toDate(),
        usd: 1,
        khr: 4000,
        thb: 30,
      },
    ]

    data.forEach((doc) => {
      Exchanges.insert(doc)
    })
  }

  // Roles
  roleData.forEach((role) => {
    if (role) {
      // Check role exist
      if (!Roles.findOne({ name: role.name })) {
        Roles.insert(role)
      }

      if (role.module === 'Setting') {
        if (!Roles.findOne({ name: role.name })) {
          let _id = Roles.findOne({ name: role.name })._id
          if (_id) {
            Roles.update({ _id }, { $set: role })
          }
        }
      }
    }
  })

  // User
  if (Meteor.users.find().count() === 0) {
    const data = EJSON.parse(Assets.getText('core/user.json'))

    data.forEach(({ username, email, password, profile }) => {
      if (Meteor.isProduction) {
        password = `superpwd@${moment().format('YYYY')}`
      }
      const userExists = Accounts.findUserByUsername(username)
      if (!userExists) {
        Accounts.createUser({
          username,
          email,
          password,
          profile,
        })
      }
    })
  }

  // Employee
  const exist = await Employees.find({}).countDocuments()
  if (exist === 0) {
    let data = EJSON.parse(Assets.getText('core/employee.json'))
    await Employees.create(data)
  }

  // // Journal Type
  // let journalTypeData = EJSON.parse(Assets.getText('core/journalType.json'))
  // journalTypeData.forEach((it) => {
  //   // Check exist
  //   if (it) {
  //     if (!JournalTypes.findOne({ name: it.name })) {
  //       JournalTypes.insert(it)
  //     }
  //   }
  // })

  // // Account type
  // const accountTypes = EJSON.parse(Assets.getText('core/accountType.json'))
  // const countAccountType = await AccountTypes.find({}).countDocuments()
  // if (countAccountType === 0) {
  //   for (let i = 0; i < accountTypes.length; i++) {
  //     const doc = accountTypes[i]
  //     doc['name'] = doc['name'].trim()
  //     await insertAccountType.call(doc)
  //   }
  // }

  // // Chart account
  // const chatAccounts = EJSON.parse(Assets.getText('core/chartAccount.json'))
  // const countChartAccounts = await ChartAccounts.find({}).countDocuments()
  // if (countChartAccounts === 0) {
  //   for (let i = 0; i < chatAccounts.length; i++) {
  //     const it = chatAccounts[i]

  //     const accountType = await AccountTypes.findOne({
  //       name: it['accountType'].trim(),
  //     }).lean()

  //     const doc = {
  //       accountTypeId: accountType._id,
  //       code: it['code'],
  //       name: it['name'].trim(),
  //       status: it['status'],
  //       memo: it['memo'],
  //     }
  //     if (it['parent']) {
  //       const chatAccount = await ChartAccounts.findOne({
  //         name: it['parent'],
  //       }).lean()
  //       doc['parent'] = chatAccount._id
  //     }
  //     await insertChartAccount.call(doc)
  //   }
  // }
})
