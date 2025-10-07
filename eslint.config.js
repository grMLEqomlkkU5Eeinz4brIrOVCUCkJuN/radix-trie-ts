import tseslint from "typescript-eslint";

export default [
	{
		files: ["**/*.{js,mjs,cjs,ts,tsx}"],
		languageOptions: {
			parser: tseslint.parser,
		},
		rules: {
			quotes: ["error", "double"],
			indent: ["error", "tab"],
			"no-tabs": "off",
		},
	},
	{
		files: ["tests/**/*.{js,ts}"],
		languageOptions: {
			parser: tseslint.parser,
			globals: {
				describe: "readonly",
				it: "readonly",
				expect: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
			},
		},
		rules: {
			quotes: ["error", "double"],
			indent: ["error", "tab"],
			"no-tabs": "off",
		},
	}
];