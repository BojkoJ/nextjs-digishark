/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: "localhost",
				pathname: "**",
				port: "3000",
				protocol: "http",
			},
			{
				hostname: "digishark.up.railway.app",
				protocol: "https",
			},
		],
	},
};

module.exports = nextConfig;
