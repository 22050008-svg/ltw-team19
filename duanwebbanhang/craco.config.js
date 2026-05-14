// craco.config.js

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          // Cung cấp các "bản thay thế" cho các module của Node.js
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "stream": require.resolve("stream-browserify"),
          "zlib": require.resolve("zlib-browserify"),
        },
      },
    },
  },
};