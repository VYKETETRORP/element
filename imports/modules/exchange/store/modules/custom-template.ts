export default {
  namespace: true,
  state: {
    contents: [
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'បរិយា',
            styles: {
              'font-weight': 'bold',
            },
            className: '',
            propStyles: {},
          },
          {
            label: 'ចំនួន',
            styles: {
              'font-weight': 'bold',
            },
            className: '',
            propStyles: {},
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'ចំនួនទឹកប្រាក់ត្រូវប្តូរ',
            prop: 'exchangeAmount',
            styles: {},
            className: '',
            propStyles: {
              'font-weight': 'bold',
            },
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'អត្រាប្តូរប្រាក់',
            prop: 'rate',
            styles: {},
            className: '',
            propStyles: {
              'font-weight': 'bold',
            },
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'ចំនួនទឹកប្រាក់ទទួល',
            prop: 'received',
            styles: {},
            className: '',
            propStyles: {
              'font-weight': 'bold',
            },
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'ចំនួនទឹកប្រាក់ប្តូរបាន',
            prop: 'amount',
            styles: {},
            className: '',
            propStyles: {
              'font-size': '16px',
              'font-weight': 'bold',
            },
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
      {
        tag: 'p',
        label: 'Table',
        value: [
          {
            label: 'ចំនួនទឹកប្រាក់អាប់',
            prop: 'return',
            styles: {},
            className: '',
            propStyles: {
              'font-size': '16px',
              'font-weight': 'bold',
            },
          },
        ],
        className: 'template-display', // template-display thank-text
        styles: {
          // 'font-size': '12px',
          margin: '0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
    ],
    headers: [
      {
        tag: 'p',
        label: 'Logo & company name',
        value: [
          {
            label: 'មជ្ឈមណ្ឌលបណ្តុះបណ្តាល រ៉ាប៊ីត',
            styles: {
              padding: '0',
              margin: '0',
              'line-height': '1.5',
            },
            propStyles: {},
            className: '',
            prop: '',
          },
        ],
        className: 'template-display',
        styles: {
          'font-size': '20px',
          'font-weight': '400',
          margin: '0',
          'font-family': "'Roboto','Moul' !important",
        },
      },
      {
        tag: 'p',
        label: 'English Company Name',
        value: [
          {
            label: '',
            styles: {},
            propStyles: {},
            className: '',
            prop: 'enBusinessName',
          },
        ],
        className: 'template-display',
        styles: {
          'font-size': '20px',
          'font-weight': '400',
          margin: '2px 0px 0px 0px',
        },
      },
      {
        tag: 'p',
        label: 'Description',
        value: [
          {
            label: 'លក់ទិញ ប្តូរប្រាក់ខ្មែរ បរទេស និងផ្ទេរប្រាក់',
            styles: {},
            propStyles: {},
            className: '',
          },
          {
            label: 'BUYING-SELLING EXCHANGE',
            styles: {},
            propStyles: {},
            className: '',
          },
        ],
        className: 'template-display',
        styles: {
          margin: '0px',
          'font-size': '12px',
        },
      },
      {
        tag: 'p',
        label: 'Address & contact',
        value: [
          {
            label: '',
            styles: {},
            propStyles: {},
            className: '',
            prop: 'address',
          },
          {
            label: '',
            styles: {},
            propStyles: {},
            className: '',
            prop: 'telephone',
          },
        ],
        className: 'template-display',
        styles: {
          margin: '0px',
          'font-size': '11px',
        },
      },
      {
        tag: 'p',
        label: 'Info 1',
        value: [
          {
            label: 'វិក័យបត្រ:',
            styles: {
              'font-weight': '700',
            },
            propStyles: {
              'font-weight': 'normal',
            },
            className: '',
            prop: 'refNo',
          },
          {
            label: 'កាលបរិច្ឆេទ:',
            styles: {
              'font-weight': '700',
            },
            className: '',
            propStyles: {
              'font-weight': 'normal',
            },
            prop: 'date',
          },
        ],
        className: 'template-display',
        styles: {
          margin: '0px',
          'font-size': '12px',
          'font-weight': '',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
          'border-top': '1px solid black',
          padding: '5px 0px 0px 0px',
        },
      },
      {
        tag: 'p',
        label: 'Info 2',
        value: [
          {
            label: 'បុគ្គលិក:',
            styles: {
              'font-weight': '700',
            },
            propStyles: {
              'font-weight': 'normal',
            },
            className: '',
            prop: 'employeeName',
          },
          {
            label: 'ម៉ោង:',
            styles: {
              'font-weight': '700',
            },
            propStyles: {
              'font-weight': 'normal',
            },
            className: '',
            prop: 'time',
          },
        ],
        className: 'template-display',
        styles: {
          'font-size': '12px',
          'font-weight': '',
          'border-bottom': '1px solid black',
          padding: '0px 0px 5px 0px',
          margin: '0px 0px 5px 0px',
          display: 'flex',
          'flex-direction': 'row',
          'justify-content': 'space-between',
        },
      },
    ],
    footers: [
      {
        tag: 'p',
        label: 'Thank Text',
        value: [
          {
            label: 'សូមពិនិត្យប្រាក់អោយបានត្រឹមត្រូវមុននឹងចាកចេញ សូមអគុណ!',
            styles: {},
            propStyles: {},
            className: '',
          },
        ],
        className: 'template-display',
        styles: {
          'font-size': '12px',
          'border-top': '',
          padding: '5px 0px 0px 0px',
          margin: '5px 0px 5px 0px',
        },
      },
      {
        tag: 'p',
        label: 'Ruler',
        value: [],
        className: 'template-display',
        styles: {
          'border-bottom': '1px dashed #8c8b8b',
          margin: '0px',
          padding: '0px',
        },
      },
      {
        tag: 'p',
        label: 'Tran date',
        value: [],
        className: 'template-display',
        styles: {
          'font-size': '16px',
          'font-weight': '700',
          margin: '5px 0px 5px 0px',
        },
        propStyles: {},
      },
      {
        tag: 'p',
        label: 'Power by',
        value: [
          {
            label: 'Powered by Rabbit Technology',
            styles: {
              margin: '0px',
              padding: '0px',
            },
            className: '',
          },
        ],
        className: 'template-display',
        styles: {
          margin: '0px',
          'font-size': '9px',
          padding: '0px',
        },
      },
    ],
    type: null,
    parentIndex: null,
    childIndex: null,
  },
  mutations: {
    UPDATE_FOOTERS(state: any, value: any) {
      // update footer
      state.footers = value
    },
    UPDATE_CONTENTS(state: any, value: any) {
      // update footer
      state.contents = value
    },
    UPDATE_HEADERS(state: any, value: any) {
      // update footer
      state.headers = value
    },
    ADD_NEW_PARENT_CONTENT(
      state: any,
      { type, value }: { type: string; value: any }
    ) {
      state[type].push(value)
    },
    ADD_NEW_CHILD_CONTENT(
      state: any,
      { index, value, type }: { index: number; value: any; type: string }
    ) {
      state[type][index].value.push(value)
    },
    REMOVE_CONTENT(
      state: any,
      {
        index,
        childIndex,
        type,
      }: {
        index: number
        childIndex?: number
        type: string
      }
    ) {
      if (childIndex != null) state[type][index].value.splice(childIndex, 1)
      if (childIndex == null) state[type].splice(index, 1)
    },
    UPDATE_CURRENT_INDEX(
      state: any,
      {
        parentIndex,
        childIndex,
        type,
      }: { parentIndex?: number; childIndex?: number; type?: string }
    ) {
      state.parentIndex = parentIndex
      state.childIndex = childIndex
      state.type = type
    },
  },
  actions: {
    updateContents({ commit }: any, value: any) {
      commit('UPDATE_CONTENTS', value)
    },
    updateHeaders({ commit }: any, value: any) {
      commit('UPDATE_HEADERS', value)
    },
    updateFooters({ commit }: any, value: any) {
      commit('UPDATE_FOOTERS', value)
    },
    addNewParentContent({ commit }: any, { type }: { type: string }) {
      const value = {
        tag: 'p',
        label: `New ${type.toUpperCase()}`,
        value: [
          {
            label: `New ${type.toUpperCase()}`,
            className: '',
            styles: { margin: '0px', padding: '0px', 'font-size': '12px' },
            propStyles: {},
            src: '',
            imageId: '',
            prop: '',
          },
        ],
        className: 'template-display',
        styles: { margin: '0px', padding: '0px' },
      }
      commit('ADD_NEW_PARENT_CONTENT', { type, value })
    },
    addNewChildContent(
      { commit }: any,
      { index, type }: { index: number; type: string }
    ) {
      const value = {
        label: `New ${type.toUpperCase()}`,
        styles: { margin: '0px', padding: '0px' },
        prop: '',
        src: '',
        imageId: '',
        propStyles: {},
      }
      commit('ADD_NEW_CHILD_CONTENT', { index, value, type })
    },
    removeContent(
      { commit }: any,
      {
        index,
        childIndex,
        type,
      }: {
        index: number
        childIndex?: number
        type: string
      }
    ) {
      commit('REMOVE_CONTENT', { index, childIndex, type })
    },
    updateCurrentIndex(
      { commit }: any,
      {
        parentIndex,
        childIndex,
        type,
      }: { parentIndex?: number; childIndex?: number; type?: string }
    ) {
      commit('UPDATE_CURRENT_INDEX', { parentIndex, childIndex, type })
    },
  },
}
