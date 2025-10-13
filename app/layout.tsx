import './globals.css'

export const metadata = {
  title: 'Mobile Chat Assistant | Find Your Perfect Phone',
  description: 'AI-powered mobile phone recommendation chatbot. Get personalized phone suggestions based on your needs and budget.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
