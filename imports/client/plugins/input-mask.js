import Inputmask from 'inputmask'

const InputMask = {
  install(app, options) {
    app.directive('inputmask', {
      beforeMount: function (el, binding) {
        var inputs = el.getElementsByTagName('INPUT')
        var input = inputs[0]
        if (inputs.length > 1) {
          input = inputs[inputs.length - 1]
        }
        // console.log(binding)
        new Inputmask(binding.value).mask(input)
      },
    })
  },
}

export default InputMask
