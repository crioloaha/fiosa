import type { Metadata } from 'next';
import './globals.css';
import { getConfig } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  const favicon = config.logoImagem || '/favicon.ico';
  const hasSub = !!(config.logoSubtitulo && config.logoSubtitulo.trim() !== '');
  return {
    title: hasSub ? `${config.logoTexto} — ${config.logoSubtitulo}` : config.logoTexto,
    description: config.rodapeDescricao,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();
  const favicon = config.logoImagem || '/favicon.ico';

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="icon" href={favicon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${config.corPrimaria};
            --color-secondary: ${config.corSecundaria};
            --color-background: ${config.corFundo};
            --color-light: ${config.corFundoAlternativo};
            --color-text: ${config.corTexto};
            --color-border: ${config.corBorda};
            --color-dark: ${config.corTexto === '#2B2D2F' ? '#2B2D2F' : config.corTexto};
          }
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-fiosa-cru text-fiosa-grafite font-sans">
        {children}
      </body>
    </html>
  );
}
