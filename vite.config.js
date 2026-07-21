import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
    allowedHosts: true, // Allow Render & external hosts
    host: true
  },
  server: {
    allowedHosts: true,
    host: true
  }
});
