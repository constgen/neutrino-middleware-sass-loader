let jsToStylesVarLoader = require('js-to-styles-var-loader')

// Monkey patch method to fix compatibility wit `vue-loader`
// Remove this when PR is released https://github.com/tompascall/js-to-styles-var-loader/pull/10
jsToStylesVarLoader.operator.getPreprocessorType = function getPreprocessorType ({ resource } = {}) {
	const preProcs = [
		 {
			  type: 'sass',
			  reg : /\.scss$|\.sass$|\.vue\?.*?lang=scss|\.vue\?.*?lang=sass/
		 },
		 {
			  type: 'less',
			  reg : /\.less$|\.vue\?.*?lang=less/
		 }
	]

	const result = preProcs.find(item => item.reg.test(resource))

	if (result) return result.type
	throw new Error(`Unknown preprocesor type for ${resource}`)
}