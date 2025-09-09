/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double initialization issues with Web3 providers
  swcMinify: true,
  trailingSlash: false,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // output: 'standalone', // Commented out for Vercel deployment
  transpilePackages: [
    '@reown/appkit',
    '@reown/appkit-scaffold-ui',
    '@walletconnect/ethereum-provider',
    'lit'
  ],
  webpack: (config, { isServer }) => {
    // Handle node modules that need to be transpiled
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Add support for importing contract ABIs
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Force resolution of lit packages from the root node_modules
    if (!config.resolve.alias) config.resolve.alias = {};
    
    // Comprehensive lit package resolution
    try {
      config.resolve.alias['lit'] = require.resolve('lit');
      config.resolve.alias['lit/decorators.js'] = require.resolve('lit/decorators.js');
      config.resolve.alias['lit/directives/if-defined.js'] = require.resolve('lit/directives/if-defined.js');
      config.resolve.alias['lit/directives/class-map.js'] = require.resolve('lit/directives/class-map.js');
      config.resolve.alias['lit/directives/style-map.js'] = require.resolve('lit/directives/style-map.js');
      config.resolve.alias['lit/directives/when.js'] = require.resolve('lit/directives/when.js');
      config.resolve.alias['lit/directives/unsafe-html.js'] = require.resolve('lit/directives/unsafe-html.js');
      config.resolve.alias['lit/directives/live.js'] = require.resolve('lit/directives/live.js');
      config.resolve.alias['lit/directives/ref.js'] = require.resolve('lit/directives/ref.js');
      config.resolve.alias['lit/directives/repeat.js'] = require.resolve('lit/directives/repeat.js');
      config.resolve.alias['@lit/reactive-element'] = require.resolve('@lit/reactive-element');
      config.resolve.alias['lit-element'] = require.resolve('lit-element');
      config.resolve.alias['lit-html'] = require.resolve('lit-html');
    } catch (error) {
      console.warn('Some lit packages could not be resolved:', error.message);
    }

    // Add node module paths to help with resolution
    if (!config.resolve.modules) config.resolve.modules = [];
    config.resolve.modules.push('node_modules', '../node_modules');

    // Enhanced fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    return config;
  },
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;",
          },
        ],
      },
    ];
  },
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;