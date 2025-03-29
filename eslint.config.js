import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{files: ['**/*.{js,mjs,cjs,ts}']},
	{languageOptions: { globals: globals.browser }},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					'argsIgnorePattern': '^_',
					'varsIgnorePattern': '^_',
					'caughtErrorsIgnorePattern': '^_',
				},
			],
			'no-trailing-spaces': 'error',
			complexity: ['error', 10],
			'no-console': 'error',
			'no-debugger': 'error',
			'no-unreachable': 'error',
			'max-depth': ['error', 4],
			'max-nested-callbacks': ['error', 2],
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
			'no-extra-semi': ['error'],
			'eol-last': ['error', 'always'],
			'sort-imports': ['error', {
				'ignoreCase': false,
				'ignoreDeclarationSort': false,
				'ignoreMemberSort': false,
				'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
				'allowSeparatedGroups': false,
			}],
		},
	},
]
