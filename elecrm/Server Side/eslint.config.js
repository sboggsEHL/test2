// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Add your custom rules here
      '@typescript-eslint/no-explicit-any': 'off', // Turn off the 'no-explicit-any' rule
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Optionally disable this rule too
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      // Add other rules as needed
    }
  },
);
