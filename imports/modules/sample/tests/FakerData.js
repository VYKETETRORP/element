import faker from '@faker-js/faker'

const FakerData = {
  fakeCategory(params = {}) {
    let data = {
      refNo: params.refNo || '',
      name: params.name || faker.commerce.department(),
      memo: params.memo || '',
    }

    return data
  },
}

export default FakerData
