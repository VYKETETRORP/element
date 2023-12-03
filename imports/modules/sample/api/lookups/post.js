import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { check } from 'meteor/check'
import SimpleSchema from 'simpl-schema'
import _ from 'lodash'

// Lib
import rateLimit from '/imports/api/lib/rate-limit'

// Collection
import Posts from '../posts/Posts'

export const lookupPost = new ValidatedMethod({
  name: 'sample.lookupPost',
  mixins: [CallPromiseMixin],
  validate(selector) {
    selector = selector || {}
    check(selector, Object)
  },
  run(selector) {
    if (Meteor.isServer) {
      Meteor._sleepForMs(100)
      selector = selector || {}
      let sort = { title: 1 }

      let list = []
      let data = Posts.find(selector, { sort }).fetch()
      data.forEach(o => {
        let custom = `
                    <span class="custom-select-opts-left">${o.title}</span>
                    <span class="custom-select-opts-right">${o.status}</span>
                    `
        list.push({
          label: o.title,
          value: o._id,
          labelCustom: custom,
          memo: o.memo,
        })
      })

      return list
    }
  },
})

rateLimit({
  methods: [lookupPost],
})
