import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function chromeExtension(): Plugin {
  return {
    name: 'cordelio-chrome-extension',
    transformIndexHtml(html) {
      return html.replaceAll(' crossorigin', '')
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: readFileSync(new URL('./manifest.json', import.meta.url)),
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react(), chromeExtension()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL('./popup.html', import.meta.url)),
        background: fileURLToPath(
          new URL('./src/background/service-worker.ts', import.meta.url),
        ),
      },
      output: {
        entryFileNames(chunk) {
          if (chunk.name === 'background') return 'background.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
}))
