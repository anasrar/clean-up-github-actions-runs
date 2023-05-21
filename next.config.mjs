/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/clean-up-github-actions-runs",
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
}

export default nextConfig
