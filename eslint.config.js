// eslint.config.js
import eslint from "@eslint/js";
import angular from "angular-eslint";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Configuración de plugins compartidos
  {
    plugins: {
      prettier: prettier,
    },
    rules: {
      // Regla de Prettier que se aplica a todos los archivos que la usen
      "prettier/prettier": "error",
    },
  }, // 2. Configuración para archivos TypeScript

  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierConfig,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ], // La regla "prettier/prettier" ya está definida en el primer objeto
    },
  }, // 3. Configuración para archivos HTML

  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierConfig,
    ],
    rules: {
      "prettier/prettier": [
        "error",
        {
          parser: "html",
        },
      ],
    },
  },
);
