//import { Accounts } from 'meteor/accounts-base'
//import { Meteor } from 'meteor/meteor'
//Accounts.config({
//  // loginExpirationInDays: (1 / 24 / 60) * 15, // 15 min
//  // 1 min = 60000 milliseconds
//  // loginExpiration: 60000 * 15,
//})

//Accounts.validateLoginAttempt(function (attempt) {
//  if (!attempt.allowed) {
//    return false
//  }

//  let { profile, username } = attempt?.user

//  // user : super
//  if (username === 'super') return true

//  // User inactive
//  if (profile?.status === 'Inactive') {
//    throw new Meteor.Error('Account', 'Your account is inactive!')
//  }

//  return true
//})
//Accounts.validateLoginAttempt(function (attempt) {
//  if (!attempt.allowed) {
//    return false
//  }

//  let { profile, username } = attempt?.user

//  // user : super
//  if (username === 'super') return true

//  // User inactive
//  if (profile?.status === 'Inactive') {
//    throw new Meteor.Error('Account', 'Your account is inactive!')
//  }

//  return true
//})
