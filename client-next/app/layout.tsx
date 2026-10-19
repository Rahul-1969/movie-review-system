import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const metadata: Metadata = {
  title: 'MovieReview',
  description: 'Discover and review your favorite movies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-dark-950 text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
