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
      <v-img 
        src="@/assets/profile-icon.png" 
        alt="Профиль" 
        max-height="40" 
        class="clickable-profile" 
        @click="$router.push('/profile')"
      />
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
export default {
  name: 'UserHeader',
};
</script>

<style scoped>
/* Глобальные стили для уменьшения расстояния между буквами */
* {
  letter-spacing: -0.5px; /* Уменьшение расстояния между буквами во всём шрифте */
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
</style>
