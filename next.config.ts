import type { NextConfig } from 'next'

const getImageDomains = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
        const url = new URL(apiUrl)
        return [url.hostname]
    }
    return []
}

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/proxy/api/:path*',
                destination: 'http://eiko-app:80/api/:path*',
            },
        ]
    },
    images: {
        domains: getImageDomains(),
    },
}

export default nextConfig
