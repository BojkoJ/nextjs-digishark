import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			// UploadThing (kam se ukládají nahrané soubory)
			{
				hostname: "utfs.io",
				protocol: "https",
			},
			{
				hostname: "*.ufs.sh",
				protocol: "https",
			},
			// lokální vývoj
			{
				hostname: "localhost",
				protocol: "http",
				port: "3000",
			},
		],
	},
};

// withPayload napojí Payload 3 do Next.js build procesu
export default withPayload(nextConfig, { devBundleServerPackages: false });
