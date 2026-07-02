// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: {
          // test/ no está en el include de tsconfig.json (solo cubre src/**/*),
          // así que el project service no encuentra a qué tsconfig pertenece.
          // Se le asigna un proyecto por defecto en vez de agregarlo al
          // tsconfig principal, para no afectar rootDir/outDir del build real.
          allowDefaultProject: ['test/*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
  {
    // Los tests dependen de APIs de Jest tipadas como `any` a propósito
    // (expect.any(), expect.objectContaining(), jest.fn() sin tipar) y de
    // mocks manuales sin interfaz explícita. Perseguir cada ocurrencia con
    // casts no agrega seguridad real — es el caso de uso estándar para
    // relajar estas reglas específicamente en archivos de test.
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);