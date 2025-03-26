import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AFAD Generator',
  description: 'Upload images to generate a PDF file with watermark.',
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
