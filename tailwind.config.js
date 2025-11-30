/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                 // <-- Tambahkan ini
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Path ini sudah benar
  ],
  theme: {
    extend: {
      // Jika kamu punya warna custom (misal 'Color1'), tambahkan di sini:
      // colors: {
      //   Color1: '#FFE4C7', // Ganti dengan kode hex warnamu
      // }
    },
  },
  plugins: [],
}