import babel from 'rollup-plugin-babel';

export default {
  // tell rollup our main entry point
  entry: 'src/MarkdownRenderer.js',
  dest: 'lib/index.js',
  format: 'cjs',
  moduleName: 'MarkdownRenderer',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: 'es2015-rollup'
    })
  ]
}
