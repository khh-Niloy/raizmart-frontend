import Navbar from '@/components/main/shared/Navbar';
import Footer from '@/components/main/shared/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-16 md:pt-20 pb-16 md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}
