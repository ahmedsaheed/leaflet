import { Leaflet } from "./leaflet";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { useFontToggle } from "../hooks/useFontToggle";
import { usePrefersColorScheme } from "../lib/theme";

export default function Home() {
  const [font, toggleFont] = useFontToggle();
  const prefersColorScheme = usePrefersColorScheme()
  const isDarkMode = prefersColorScheme === 'dark'
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
          integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X"
          crossOrigin="anonymous"
        />

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css"/>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"
          integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4"
          crossOrigin="anonymous"
        ></script>
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/contrib/auto-render.min.js"
          integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        }}
      />
      <div
        id="root"
        className={`font-${font} prose text-gray-900 dark:text-gray-100 antialiased`}
      >
        <Leaflet toggleFont={toggleFont} currentFont={font} />
      </div>
    </>
  );
}
