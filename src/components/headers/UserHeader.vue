<template>
  <v-app-bar color="primary" dark app>
    <!-- Логотип слева -->
    <v-toolbar-title>
      <v-img src="@/assets/logo.png" alt="Логотип" max-height="40"></v-img>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Навигационные кнопки рядом с логотипом -->
    <div class="nav-buttons">
      <v-btn text :to="{ path: '/' }">ГЛАВНАЯ</v-btn>
      <v-btn text :to="{ path: '/statistics' }">СТАТИСТИКА</v-btn>
      <v-btn text :to="{ path: '/requests' }">ЗАЯВКИ</v-btn>
    </div>

    <!-- Пробел, отодвигающий аватар вправо -->
    <v-spacer></v-spacer>

    <!-- Аватар профиля справа -->
    <v-toolbar-title>
      <div class="d-flex align-center">
        <span class="highlight-text" style="font-size: 15px;">{{ fullName }}</span>
        <v-img src="@/assets/profile-icon.png" alt="Профиль" max-height="40" class="clickable-profile ml-2"
          @click="$router.push('/profile')" />
      </div>
    </v-toolbar-title>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/axios/axios';

const fullName = ref('')

onMounted(async () => {
  try {
    const email = localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
    const response = await axiosInstance.get(`/student_info`, { params: { email } });
    fullName.value = response.data.fio
  } catch (error) {
    console.error('Ошибка при получении данных студента:', error)
  }
})
</script>

<style scoped>
/* Глобальные стили для уменьшения расстояния между буквами */
* {
  letter-spacing: -0.5px;
  /* Уменьшение расстояния между буквами во всём шрифте */
}

/* Настройка всего header */
.v-app-bar {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: 16px;
  letter-spacing: -0.5px;
}

/* Стиль для навигационных кнопок */
.nav-buttons .v-btn {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.3px;
  text-transform: none;
}

/* Настройка заголовка */
.v-toolbar-title {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: -0.1px;
}

/* Отступ слева от аватара */
.ms-4 {
  margin-left: 16px;
}

/* Опционально: Изменение размера аватара */
.v-avatar {
  cursor: pointer;
}

.clickable-profile {
  cursor: pointer;
}

.highlight-text {
  background: linear-gradient(90deg, #4a95d2, #106db9) !important;
  border-radius: 50px;
  padding: 5px 10px;
  color: white;
}
</style>