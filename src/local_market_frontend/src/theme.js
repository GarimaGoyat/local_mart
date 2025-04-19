import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#B3E3FF',
      200: '#80D0FF',
      300: '#4DBDFF',
      400: '#1AAAFF',
      500: '#0088E6',
      600: '#0066B3',
      700: '#004480',
      800: '#00224D',
      900: '#00111A',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme; 