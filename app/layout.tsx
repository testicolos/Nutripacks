import type { Metadata } from 'next';
import './globals.css';
import './step5.css';
import './step6.css';

export const metadata: Metadata = {
  title: 'Nutripacks',
  description: 'Healthy meal plans, built around your goals.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
