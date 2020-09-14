let arrify    = require('arrify')
let deepmerge = require('deepmerge')
let dartSass  = require('sass')

module.exports = function (customSettings = {}) {
	return function (neutrino) {
		const SASS_EXTENSIONS        = /\.s[ac]ss$/
		const SASS_EXTENSION         = /\.sass$/
		const SCSS_EXTENSION         = /\.scss$/
		const SASS_MODULE_EXTENSIONS = /\.module\.s[ac]ss$/
		let { config }               = neutrino
		let styleRule                = config.module.rules.get('style')
		let sassRule                 = config.module.rule('sass')
		let styleExtensions          = styleRule && styleRule.get('test')
		let defaultSettings          = {
			include: [neutrino.options.source, neutrino.options.tests],
			exclude: [],
			sass   : {}
		}
		let settings                 = deepmerge(defaultSettings, customSettings)

		if (styleExtensions) {
			let extensions = arrify(styleExtensions).concat(SASS_EXTENSIONS)

			styleRule.test(extensions)
		}
		if (styleRule) {
			let oneOfs        = styleRule.oneOfs.values().filter(oneOf => oneOf.get('test'))
			let moduleOneOfs  = oneOfs.filter(oneOf => oneOf.uses.get('css').get('options').modules)
			let defaultOneOfs = oneOfs.filter(oneOf => !oneOf.uses.get('css').get('options').modules)

			moduleOneOfs.forEach(function (oneOf) {
				let extensions = arrify(oneOf.get('test')).concat(SASS_MODULE_EXTENSIONS)

				styleRule.oneOf(oneOf.name).test(extensions)
			})
			defaultOneOfs.forEach(function (oneOf) {
				let extensions = arrify(oneOf.get('test')).concat(SASS_EXTENSIONS)

				styleRule.oneOf(oneOf.name).test(extensions)
			})
		}

		sassRule
			.test(SASS_EXTENSIONS)
			.include
				.merge(settings.include || [])
				.end()
			.exclude
				.merge(settings.exclude || [])
				.end()
			.oneOf('scss')
				.test(SCSS_EXTENSION)
				.use('sass')
					.tap((options = {}) => options)
					.end()
				.end()
			.oneOf('sass')
				.test(SASS_EXTENSION)
				.use('sass')
					.tap((options = {}) => deepmerge({
						sassOptions: {
							indentedSyntax: true
						}
					}, options))
					.end()
				.end()

		sassRule.oneOfs.values().forEach(function (oneOf) {
			oneOf
				.use('resolve-url')
					.before('sass')
					.loader(require.resolve('resolve-url-loader'))
					.tap((options = {}) => options)
					.tap(options => deepmerge({
						root     : '',
						sourceMap: true,
						keepQuery: true,
						debug    : false,
						silent   : false
					}, options))
					.end()
				.use('sass')
					.loader(require.resolve('sass-loader'))
					.tap(options => deepmerge({
						sourceMap      : true,
						implementation : dartSass,
						webpackImporter: true
					}, options))
					.tap(options => deepmerge(options, { sassOptions: settings.sass }))
					.end()
				.use('style-var')
					.after('sass')
					.loader(require.resolve('js-to-styles-var-loader'))
					.end()
		})
	}
}