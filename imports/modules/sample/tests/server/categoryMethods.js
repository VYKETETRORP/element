/* eslint-env mocha */

import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { assert } from 'chai'
import FakerData from '../FakerData'

import {
  insertCategory,
  updateCategory,
  removeCategory,
} from '../../api/categories/methods'

describe('Category Methods', function () {
  beforeEach(() => {
    resetDatabase()
  })

  describe('#insertCategory()', function () {
    it('can add a new (refNo: "1")', function () {
      const _id = insertCategory.call(FakerData.fakeCategory({ refNo: '1' }))
      assert.isString(_id)
    })
    it('can add a new (refNo: "")', function () {
      const _id = insertCategory.call(FakerData.fakeCategory())
      assert.isString(_id)
    })
  })

  describe('#updateCategory()', function () {
    it('can update', function () {
      let doc = FakerData.fakeCategory()
      doc._id = insertCategory.call(doc)
      doc.memo = 'Update'

      assert.equal(updateCategory.call(doc), 1)
    })
  })

  describe('#removeCategory()', function () {
    it('remove a doc', function () {
      const _id = insertCategory.call(FakerData.fakeCategory())
      assert.equal(removeCategory.call({ _id }), 1)
    })
  })
})
