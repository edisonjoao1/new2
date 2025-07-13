import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 4U - Transform Your Business with AI Solutions | AI Consulting & Development',
  description: 'AI 4U is a cutting-edge AI consulting studio in Naples, Florida. We specialize in custom AI app development, automation, API integration, and rapid MVP development. Transform your business with our proven AI solutions serving 10,000+ users worldwide.',
  keywords: [
    'AI consulting',
    'AI app development',
    'artificial intelligence',
    'business automation',
    'AI integration',
    'Spanish AI tools',
    'rapid MVP development',
    'AI strategy',
    'Naples Florida AI',
    'custom AI solutions'
  ],
  authors: [{ name: 'AI 4U Labs' }],
  creator: 'AI 4U Labs',
  publisher: 'AI 4U Labs',
  category: 'Technology',
  classification: 'AI Consulting & Development',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai4u.space',
    siteName: 'AI 4U Labs',
    title: 'AI 4U - Transform Your Business with AI Solutions',
    description: 'AI 4U is a cutting-edge AI consulting studio specializing in custom AI app development, automation, and rapid MVP development. Join 10,000+ users transforming their businesses with AI.',
    images: [
      {
        url: '/ai-assistant-mockup.png',
        width: 1200,
        height: 630,
        alt: 'AI 4U - AI Assistant App Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 4U - Transform Your Business with AI Solutions',
    description: 'AI consulting studio specializing in custom AI app development, automation, and rapid MVP development. Serving 10,000+ users worldwide.',
    images: ['/ai-assistant-mockup.png'],
    creator: '@AI4ULabs',
    site: '@AI4ULabs',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://ai4u.space',
    languages: {
      'en-US': 'https://ai4u.space',
      'es-ES': 'https://ai4u.space/es',
    },
  },
  other: {
    'business:contact_data:locality': 'Naples',
    'business:contact_data:region': 'Florida',
    'business:contact_data:country_name': 'United States',
    'business:contact_data:email': 'info@ai4u.space',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
