import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>LiveMemories - Augmented Reality Print Studio</title>
        <meta name="description" content="Bring Your Printed Memories, Artwork & Books to Life with Augmented Reality" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        
        {/* Mobile Phone Web App Metadata */}
        <meta name="theme-color" content="#070a12" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LiveMemories" />
        
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-mesh" />
      <div className="grid-bg" />
      <Component {...pageProps} />
    </>
  );
}
