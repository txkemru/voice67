import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    host: true, // чтобы можно было тестировать с мобильных устройств в сети
  },
})
