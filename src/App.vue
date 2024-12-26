<template>
   <v-app>
    <v-main>
    <!-- Динамическое отображение заголовков -->
    <UserHeader v-if="showUserHeader" />
    <AdminHeader v-else-if="showAdminHeader" />

    <!-- Рендеринг основного содержимого -->
    <router-view />
  </v-main>
</v-app>
</template>

<script>
import UserHeader from './components/UserHeader.vue';
import AdminHeader from './components/AdminHeader.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';

export default {
  name: 'App',
  components: {
    UserHeader,
    AdminHeader,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Реактивные переменные для авторизации и роли
    const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
    const userRole = ref(localStorage.getItem('role'));

    // Функция для обновления авторизации
    const updateAuthState = () => {
      isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true';
      userRole.value = localStorage.getItem('role');
    };

    // Слушаем изменения маршрута
    watch(route, () => {
      updateAuthState(); // Обновляем состояние при изменении маршрута
    });

    // Обновляем состояние вручную при входе
    const login = (role) => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('role', role);
      updateAuthState();
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    };

    // Вычисляемые свойства для отображения заголовков
    const showUserHeader = computed(() => isAuthenticated.value && userRole.value === 'user' && route.path !== '/login');
    const showAdminHeader = computed(() => isAuthenticated.value && userRole.value === 'admin' && route.path !== '/login');

    return {
      showUserHeader,
      showAdminHeader,
      login,
    };
  },
};
</script>

<style>
/* Глобальные стили */
html, body {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -0.5px;
  font-weight: 900;

  background-image: url('./assets/illustration.jpg'); /* Укажите путь к изображению */
  background-size: cover; /* Масштабировать изображение, чтобы оно покрывало весь фон */
  background-repeat: no-repeat; /* Избегать повторения изображения */
  background-attachment: fixed; /* Фон остаётся фиксированным при скролле */
  background-position: center; /* Центрирование изображения */
  background-color: #f5f5f5; /* Цвет для проверки */

}
</style>