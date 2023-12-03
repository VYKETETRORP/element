import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import { validSchema } from './collection-details'
const pickup = ({
  parentId,
  branchId,
  details,
}: {
  parentId: string
  branchId: string
  details: FeeChargeDetails.Input[]
}) => {
  new SimpleSchema({
    parentId: String,
    branchId: String,
    details: Array,
    'details.$': validSchema,
  }).validate({
    parentId,
    branchId,
    details,
  })

  const detailData: FeeChargeDetails.Schema[] = []

  for (let i = 0; i < details.length; i++) {
    const it = details[i]
    const id = new Mongo.ObjectID()
    detailData.push({
      _id: id.toHexString(),
      parentId,
      branchId,
      ...it,
    })
  }

  return detailData
}

export default pickup
