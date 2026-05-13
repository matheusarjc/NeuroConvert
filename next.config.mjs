/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Pastas sincronizadas (ex.: OneDrive) corrompem com frequência o cache em disco do
      // Webpack durante o HMR, levando a "Cannot find module './NNN.js'". Cache só em RAM
      // evita essa escrita e reduz esse tipo de falha.
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
