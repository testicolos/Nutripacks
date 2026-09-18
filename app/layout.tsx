import type { Metadata } from 'next';
import MotionEnhancer from './components/MotionEnhancer';
import './globals.css';
import './step5.css';
import './step6.css';
import './revamp.css';
import './mockup-match.css';

export const metadata: Metadata = {
  title: 'Nutripacks Qatar',
  description: 'Fresh, chef-prepared meal plans with clear nutrition and flexible delivery scheduling in Qatar.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MotionEnhancer />
        {children}
      </body>
    </html>
  );
}
