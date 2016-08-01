import babel from 'rollup-plugin-babel';

export default {
  // tell rollup our main entry point
  entry: 'src/MarkdownRenderer.js',
  dest: 'lib/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: 'es2015-rollup'
    })
  ]
}
