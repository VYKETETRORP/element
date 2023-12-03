import { Meteor } from 'meteor/meteor'
import _ from 'lodash'

// Collection
import Categories from '../../api/categories/Categories'

// Method
import { insertCategory } from '../../api/categories/methods'

Meteor.startup(function() {
  /**
   * Development
   */
  if (Meteor.isDevelopment) {
    // Category
    if (Categories.find().count() === 0) {
      const data = [
        { refNo: '001', name: 'Beer' },
        { refNo: '002', name: 'Wine' },
        { refNo: '003', name: 'Pur Water' },
      ]

      data.forEach(it => {
        insertCategory.call(it)
      })
    }
  }

  /**
   * Production
   */
})
