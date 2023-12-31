import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions'

checkNpmVersions(
  {
    vue: '^3.2.13'
  },
  'vuejs:vue3'
)

if (process.env.PUBLISHING_METEOR_VUE !== 'true') {
  const { VueCompiler } = require('./compiler')

  Plugin.registerCompiler(
    {
      extensions: ['vue'],
      filenames: ['.vueignore']
    },
    () => new VueCompiler()
  )
}
