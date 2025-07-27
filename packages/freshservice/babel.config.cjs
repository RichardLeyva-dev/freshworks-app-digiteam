const path = require('path');

module.exports = function (api) {
  // Cache según modo (development/production)
  api.cache(() => process.env.NODE_ENV === 'production');

  return {
    // Aseguramos que Babel vea los TS/TSX aunque estén fuera del root (share)
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { esmodules: true },
          modules: false
        }
      ],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: process.env.NODE_ENV !== 'production'
        }
      ],
      [
        '@babel/preset-typescript',
        {
          isTSX: true,
          allExtensions: true, // <- Muy importante en monorepos
          allowDeclareFields: true
        }
      ]
    ],
    // Por si algún paquete trae JSX en .js
    overrides: [
      {
        test: /\.(js|jsx|ts|tsx|mjs)$/,
        plugins: []
      }
    ]
  };
};
