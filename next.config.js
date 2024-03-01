/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: [
			"localhost",
			"digishark-production.up.railway.app",
			"digishark.up.railway.app",
		],
	},
};

module.exports = nextConfig;
