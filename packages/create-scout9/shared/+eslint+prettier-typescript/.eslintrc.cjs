/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.scout9']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
