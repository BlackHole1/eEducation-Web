const {
  override,
  addBabelPlugins,
  addWebpackExternals,
  useBabelRc,
  addWebpackModuleRule,
} = require('customize-cra');

const isElectron = process.env.BROWSER === 'none';
// TODO: You can customize your env
// TODO: 这里你可以定制自己的env
const isProd = process.env.ENV === 'production';

const webWorkerConfig = () => config => {
  config.output = {
    ...config.output,
    globalObject: 'this'
  }
  return config;
}

const sourceMap = () => config => {
  // TODO: Please use 'source-map' in production environment
  // TODO: 建议上发布环境用 'source-map'
  config.devtool = isProd ? 'source-map' : 'cheap-module-eval-source-map'
  return config;
}

module.exports = override(
  sourceMap(),
  webWorkerConfig(),
  isElectron && addWebpackExternals({
    "agora-electron-sdk": "commonjs2 agora-electron-sdk"
  }),
  addBabelPlugins(
    '@babel/plugin-proposal-optional-chaining'
  ),
  useBabelRc()
)
