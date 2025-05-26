<template>
  <v-app-bar color="primary" dark app>
    <!-- Логотип слева -->
    <v-toolbar-title>
      <v-img src="@/assets/logo.png" alt="Логотип" max-height="40"></v-img>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Навигационные кнопки рядом с логотипом -->
    <div class="nav-buttons">
      <v-btn text :to="{ path: '/system-admin' }">ГЛАВНАЯ</v-btn>
      <v-btn text :to="{ path: '/system-admin/electives' }">ЭЛЕКТИВЫ</v-btn>
      <v-btn text :to="{ path: '/system-admin/settings' }">НАСТРОЙКИ СИСТЕМЫ</v-btn>
      <v-btn text :to="{ path: '/system-admin/logs' }">ЛОГИ</v-btn>
    </div>

    <!-- Пробел, отодвигающий аватар вправо -->
    <v-spacer></v-spacer>

    <!-- Аватар профиля и текст справа, в одном ряду -->
    <v-toolbar-title>
      <v-div class="d-flex align-center">
        <v-span class="highlight-text" style="font-size: 15px;">Администратор</v-span>
        <!-- <v-img src="@/assets/profile-icon.png" alt="Профиль" max-height="40" class="ma-0 pa-0"></v-img> -->
      </v-div>
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
export default {
  name: 'SystemAdminHeader',
};
</script>

<style scoped>
/* Стиль для навигационных кнопок */
.nav-buttons .v-btn {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.3px;
  text-transform: none;
}

/* Стиль для текста рядом с иконкой */
.highlight-text {
  background: linear-gradient(90deg, #4a95d2, #106db9) !important;
  border-radius: 50px; /* Круглый фон */
  padding: 5px 10px; /* Внутренние отступы */
  color: white;
}
</style>