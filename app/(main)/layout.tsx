import Navbar from '@/components/main/shared/Navbar';
import Footer from '@/components/main/shared/Footer';
import WhatsAppFloatingButton from '@/components/main/shared/WhatsAppFloatingButton';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-36 lg:pt-30 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
