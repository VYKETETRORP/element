import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'
import rateLimit from '/imports/api/lib/rate-limit'

export const reportSample = new ValidatedMethod({
  name: 'sample.reportSample',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Array,
    },
    'selector.$': {
      type: String,
    },
  }).validator(),
  run({ selector }) {
    if (Meteor.isServer) {
      Meteor._sleepForMs(500)

      let data = []
      _.times(100, (t) => {
        t += 1
        data.push({
          _id: t,
          code: t,
          name: 'Name',
          gender: 'Male',
          department: 'Admin',
          telephone: '###-###-###',
          salary: '500',
        })
      })

      let tmpData = _.filter(data, (o) => {
        return selector.length > 0 ? _.includes(selector, o.department) : true
      })

      return tmpData
    }
  },
})

rateLimit({
  methods: [reportSample],
})
