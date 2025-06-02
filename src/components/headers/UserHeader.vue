<template>
  <v-app-bar color="primary" dark app>
    <div
      class="d-flex align-center"
      style="width: 100%; padding: 0 5%; justify-content: space-between; align-items: center;"
    >
      <!-- Логотип слева -->
      <v-img
        :src="require('@/assets/logo.png')"
        alt="Логотип"
        max-height="90"
        max-width="90"
        contain
      ></v-img>

      <!-- Кнопки по центру -->
      <div class="d-flex align-center" style="position: absolute; left: calc(50% + 20px); transform: translateX(-50%); gap: 0px; height: 100%;">
        <v-btn text :ripple="false" :to="{ path: '/' }" class="header-button" style="font-weight: 700;">ГЛАВНАЯ</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/statistics' }" class="header-button" style="font-weight: 700;">СТАТИСТИКА</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/requests' }" class="header-button" style="font-weight: 700;">ЗАЯВКИ</v-btn>
      </div>

      <!-- ФИО и иконка профиля справа -->
      <div class="d-flex align-center">
        <span class="header-fullname">{{ fullName }}</span>
        <v-avatar class="ml-2" tile size="40">
          <v-img
            :src="require('@/assets/profile-icon.png')"
            alt="Профиль"
            max-height="40"
            contain
            class="clickable-profile"
            @click="$router.push('/profile')"
          ></v-img>
        </v-avatar>
      </div>
    </div>
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

.header-fullname {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: white;
}

.header-button {
  height: 100% !important;
  min-height: unset !important;
  padding-top: 0;
  padding-bottom: 0;
  align-self: stretch !important;
}
.header-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>