/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_SITE_URL || 'https://dapp-dev-comp.woof.software',
  generateRobotsTxt: true, // (optional),
  // outDir: "./pages",
};
