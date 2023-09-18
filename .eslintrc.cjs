/** @type {import('eslint').Linter.Config} */
module.exports = 
{
  "extends": [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "prettier"
  ],
  "ignorePatterns": ["node_modules", "build", ".cache"],
  "plugins": ["prettier", "simple-import-sort"],
  "overrides": [
    {
      // No default exports other than in root files and routes
      "files": ["./app/*/*.{js,jsx,ts,tsx}"],
      "excludedFiles": ["./app/routes/**"],
      "rules": {
        "import/no-default-export": "error"
      }
    }
  ],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "prettier/prettier": [
      "error",
      {
        "semi": false,
        "printWidth": 80,
        "bracketSpacing": false,
        "singleQuote": true
      }
    ]
  }
}