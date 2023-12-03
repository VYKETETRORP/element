import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
//import { setNextSeq } from '/imports/api/lib/nextSequence'

// lib
import throwError from '/imports/api/lib/throwError'

// collections
import MoneyTransfers, {
  insertMoneyTransferInput,
  updateMoneyTransferInput,
} from './money-transfer'

// Find
export const findMoneyTransfer = new ValidatedMethod({
  name: 'ex.findMoneyTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ selector = {}, query = {} }) {
    if (Meteor.isServer) {
      try {
        const skip = (query.page - 1) * query.pageSize
        const limit = query.pageSize
        // let firstMatch = {
        //   branchId: selector.branchId,
        //   tranDate: selector.tranDate,
        // }
        const data = MoneyTransfers.aggregate([
          {
            $match: selector,
          },
          {
            $sort: { tranDate: -1, refNo: -1 },
          },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'ex_exchangeCurrency',
              localField: 'currencyId',
              foreignField: '_id',
              as: 'currencyDoc',
            },
          },
          {
            $unwind: {
              path: '$currencyDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ex_customers',
              localField: 'customerId',
              foreignField: '_id',
              as: 'cusDoc',
            },
          },
          {
            $unwind: {
              path: '$cusDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'app_employees',
              localField: 'employeeId',
              foreignField: '_id',
              as: 'empDoc',
            },
          },
          {
            $unwind: {
              path: '$empDoc',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              tranDate: 1,
              refNo: 1,
              customerName: '$cusDoc.name',
              employeeName: '$empDoc.name',
              currencyName: '$currencyDoc.name',
              amount: 1,
              fee: 1,
              tranType: 1,
            },
          },
        ])

        return data
      } catch (error) {
        throwError('find money transfer', error)
      }
    }
  },
})

// Find
export const getMoneyTransferById = new ValidatedMethod({
  name: 'ex.getMoneyTransferById',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  run({ id }: { id: string }) {
    if (Meteor.isServer) {
      try {
        const data = MoneyTransfers.findOne({ _id: id })
        if (!data) throw `This record deleted!`

        return data
      } catch (error) {
        throwError('get fee charge by id', error)
      }
    }
  },
})

// Insert
export const insertMoneyTransfer = new ValidatedMethod({
  name: 'ex.insertMoneyTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: insertMoneyTransferInput,
  }).validator(),
  async run({ doc }: { doc: MoneyTransfer.InsertMoneyTransferInput }) {
    if (Meteor.isServer) {
      let id
      try {
        id = MoneyTransfers.insert(doc)

        // insert refno
        await setNextSeq.call({
          id: `ex_moneyTransferRefNo${doc.branchId}`,
          seqVal: doc.refNo,
        })
        return id
      } catch (error) {
        MoneyTransfers.remove({ _id: id })
        throwError('insert money transfer', error)
      }
    }
  },
})

// Update
export const updateMoneyTransfer = new ValidatedMethod({
  name: 'ex.updateMoneyTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    doc: updateMoneyTransferInput,
  }).validator(),
  run({ doc }: { doc: MoneyTransfer.UpdateMoneyTransferInput }) {
    if (Meteor.isServer) {
      try {
        const res = MoneyTransfers.update({ _id: doc._id }, { $set: doc })
        return res
      } catch (error) {
        throwError('update money transfer', error)
      }
    }
  },
})

// Remove
export const removeMoneyTransfer = new ValidatedMethod({
  name: 'ex.removeMoneyTransfer',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    id: String,
  }).validator(),
  run({ id }: { id: string }) {
    if (Meteor.isServer) {
      try {
        const res = MoneyTransfers.remove({ _id: id })
        return res
      } catch (error) {
        throwError('remove money transfer', error)
      }
    }
  },
})
