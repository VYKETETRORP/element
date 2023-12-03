import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'

// Lib
import rateLimit from '/imports/api/lib/rate-limit'

// Collection
import Categories from '../categories/Categories'

export const lookupCategory = new ValidatedMethod({
  name: 'sample.lookupCategory',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ selector }) {
    if (Meteor.isServer) {
      Meteor._sleepForMs(100)
      selector = selector || {}
      let sort = { name: 1 }

      let list = []
      let data = Categories.find(selector, { sort }).fetch()
      data.forEach(o => {
        let labelCustom = `
                    <span class="custom-select-opts-left">${o.name}</span>
                    <span class="custom-select-opts-right">${o.memo}</span>
                    `
        list.push({
          label: o.name,
          value: o._id,
          labelCustom,
        })
      })

      return list
    }
  },
})

export const lookupRemoteCategory = new ValidatedMethod({
  name: 'sample.lookupRemoteCategory',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    query: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ query }) {
    if (Meteor.isServer) {
      Meteor._sleepForMs(500)

      const limit = 100
      let selector = {}
      if (query) {
        selector.$or = [
          { refNo: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ]
      }
      let list = []
      Categories.find(selector, { sort: { refNo: 1 }, limit })
        .fetch()
        .forEach(it => {
          list.push({ label: it.name, value: it._id })
        })

      return list
    }
  },
})

rateLimit({
  methods: [lookupCategory],
})
