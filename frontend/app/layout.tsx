import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'SKI - Shree Khandelwal Infra | Premium Real Estate & Land Investments',
    template: '%s | SKI - Shree Khandelwal Infra'
  },
  description: 'Discover premium residential & commercial lands in Noida, Greater Noida, Jewar, Mathura & Vrindavan. MVDA approved projects, trusted real estate investments by Shree Khandelwal Infra.',
  keywords: [
    'real estate', 'land for sale', 'residential land', 'commercial land',
    'MVDA approved', 'Noida property', 'Greater Noida plots', 'Jewar land',
    'Mathura real estate', 'Vrindavan property', 'Delhi NCR real estate',
    'SKI', 'Shree Khandelwal Infra', 'property investment', 'plots for sale',
  ],
  authors: [{ name: 'Shree Khandelwal Infra' }],
  creator: 'Shree Khandelwal Infra',
  publisher: 'Shree Khandelwal Infra',

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'SKI - Shree Khandelwal Infra',
    title: 'SKI - Shree Khandelwal Infra | Premium Real Estate & Land Investments',
    description: 'Your trusted partner for premium residential & commercial land investments across Noida, Greater Noida, Jewar, Mathura & Vrindavan.',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'SKI - Shree Khandelwal Infra',
    }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SKI - Shree Khandelwal Infra',
    description: 'Premium real estate & land investments in Delhi NCR & Mathura-Vrindavan region.',
    images: ['/og-image.jpg'],
  },

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'SKI - Shree Khandelwal Infra',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ski-logo.png`,
              description: 'Premium real estate & land investments in Noida, Greater Noida, Jewar, Mathura & Vrindavan',
              areaServed: [
                { '@type': 'City', name: 'Noida' },
                { '@type': 'City', name: 'Greater Noida' },
                { '@type': 'City', name: 'Mathura' },
                { '@type': 'City', name: 'Vrindavan' },
              ],
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'Uttar Pradesh',
                addressCountry: 'IN',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['English', 'Hindi'],
              },
            }),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
