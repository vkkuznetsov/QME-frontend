// ./plugins/vuetify.js

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Vuetify
import { createVuetify } from 'vuetify';

// Создаем экземпляр Vuetify с пользовательской темой
export default createVuetify({
  theme: {
    defaultTheme: 'myCustomTheme',
    themes: {
      myCustomTheme: {
        dark: false, // Установите true, если хотите использовать темную тему
        colors: {
          primary: '#00aeef', // Ваш основной цвет
          secondary: '#66d8f4', // Ваш дополнительный цвет
          accent: '#82B1FF', // Дополнительные цвета по желанию
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          // Добавьте другие цвета, если необходимо
        },
        variables: {
          // Добавляем переменную для фонового изображения
          backgroundImage: "url('./assets/illustration.jpg')", // Укажите правильный путь
        },
      },
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif', // Устанавливаем Fira Sans как основной шрифт
  },
});
