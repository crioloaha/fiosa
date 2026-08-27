import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getConfig } from '@/lib/config';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();

  return (
    <>
      <Header config={config} />
      <main className="flex-grow">{children}</main>
      <Footer config={config} />
    </>
  );
}
