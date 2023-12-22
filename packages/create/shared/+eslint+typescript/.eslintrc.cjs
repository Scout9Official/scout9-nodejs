/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.scout9']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	// overrides: [
	// 	{
	// 		files: ['*.scout9'],
	// 		parser: 'scout9-eslint-parser',
	// 		parserOptions: {
	// 			parser: '@typescript-eslint/parser'
	// 		}
	// 	}
	// ]
};
