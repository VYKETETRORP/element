import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import SimpleSchema from 'simpl-schema'

import rateLimit from '/imports/api/lib/rate-limit'

import FilesCollection from '/imports/api/files/files'
import CustomTemplate from './collection'

// Find
export const findOneCustomTemplate = new ValidatedMethod({
  name: 'ex.findCustomTemplate',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    selector: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  async run({ selector }: { selector: any }) {
    if (Meteor.isServer) {
      try {
        const doc = await CustomTemplate.findOne(selector).lean()
        if (!doc) return undefined

        delete doc?.__v
        doc.headers = doc?.headers || []
        doc.contents = doc?.contents || []
        doc.footers = doc?.footers || []
        // Get logo
        doc?.headers?.forEach((header: any) => {
          header.value.forEach((it: any) => {
            it.src = ''
            if (it.imageId) {
              const image = FilesCollection.findOne({ _id: it.imageId })
              if (image) {
                it.src = image.link()
              }
            }
          })
        })

        return doc
      } catch (error: any) {
        console.log(error)
        throw new Meteor.Error(error)
      }
    }
  },
})

export const upSertCustomTemplate = new ValidatedMethod({
  name: 'ex.upSertCustomTemplate',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    _id: {
      type: String,
      optional: true,
    },
    headers: Array,
    'headers.$': {
      type: Object,
      blackbox: true,
      optional: true,
    },
    contents: Array,
    'contents.$': {
      type: Object,
      blackbox: true,
      optional: true,
    },
    footers: Array,
    'footers.$': {
      type: Object,
      blackbox: true,
      optional: true,
    },
    branchId: String,
  }).validator(),
  async run(doc) {
    if (Meteor.isServer) {
      try {
        if (doc._id) {
          return await CustomTemplate.updateOne({ _id: doc._id }, { $set: doc })
        } else {
          const temDoc = new CustomTemplate(doc)
          const res = await temDoc.save()
          return res.id
        }
      } catch (error: any) {
        console.log('error', error)
        throw new Meteor.Error(error)
      }
    }
  },
})

rateLimit({
  methods: [upSertCustomTemplate],
})
