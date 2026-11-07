import { Compass } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream px-5 py-6 sm:px-8">
      <Logo />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sage-100 text-sage-700"><Compass className="h-6 w-6" /></div>
        <h1 className="mt-5 text-[26px] font-semibold">This Page Isn't Here</h1>
        <p className="mt-2 max-w-sm text-[15px] text-ink-soft">The page you're looking for may have moved. Let's get you back to a familiar place.</p>
        <Button to="/" className="mt-6">Back to Home</Button>
      </div>
    </div>
  );
}
