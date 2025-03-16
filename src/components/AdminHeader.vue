<template>
  <v-app-bar color="primary" dark app>
    <!-- Логотип слева -->
    <v-toolbar-title>
      <v-img src="@/assets/logo.png" alt="Логотип" max-height="40"></v-img>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Навигационные кнопки рядом с логотипом -->
    <div class="nav-buttons">
      <v-btn text :to="{ path: '/admin' }">Главная</v-btn>
      <v-btn text :to="{ path: '/admin/requests' }">Заявки</v-btn>
      <v-btn text :to="{ path: '/admin/reports' }">Отчёты</v-btn>
      <v-btn text :to="{ path: '/admin/settings' }">Настройки</v-btn>
    </div>

    <!-- Пробел, отодвигающий аватар вправо -->
    <v-spacer></v-spacer>

    <!-- Аватар профиля справа -->
    <v-toolbar-title>
      <v-img src="@/assets/profile-icon.png" alt="Профиль"  max-height="40"/>
    </v-toolbar-title>
  </v-app-bar>
</template>

<script>
export default {
  name: 'AdminHeader',
};
</script>

<style scoped>
/* Стиль для навигационных кнопок */
.nav-buttons {
  display: flex;
  gap: 16px; /* Расстояние между кнопками */
  margin-left: 24px; /* Отступ слева от логотипа */
}

/* Отступ слева от аватара */
.ms-4 {
  margin-left: 16px;
}

/* Опционально: Изменение размера аватара */
.v-avatar {
  cursor: pointer;
}
</style>
