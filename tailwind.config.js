/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}" // src 폴더 내 모든 파일을 대상으로 설정
  ],
  theme: {
    extend: {
      colors: { //커스텀 색상 설정(Figma 활용)
        kuDarkGreen: '#366943',
        kuCoolGray: '#B2B3B4',
        kuRed: '#D7260D',
        kuGreen: '#65B749',
        kuDarkGray: '#686F75',
        kuLightGreen: '#C6F059',
        kuWarmGray: '#B7CCAA',
        kuBlack: '#000000',
        kuBlue: '#7CA6D8',
        kuBeige: '#F0F4DD',
        whiteSmoke: '#F5F5F5',
        kuViolet: '#B686C2',
        kuLightGray: '#ECEBE4',
        kuWhite: '#FFFFFF',
        kuOrange: '#DEA93D',
      },
    },
  },
  plugins: [],
}

