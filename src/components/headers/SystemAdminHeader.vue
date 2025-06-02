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
      <div
        class="d-flex align-center"
        style="position: absolute; left: calc(50% + 0px); transform: translateX(-50%); gap: 0px; height: 100%;"
      >
        <v-btn text :ripple="false" :to="{ path: '/system-admin' }" class="header-button">ГЛАВНАЯ</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/system-admin/electives' }" class="header-button">ЭЛЕКТИВЫ</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/system-admin/managers' }" class="header-button">МЕНЕДЖЕРЫ</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/system-admin/logs' }" class="header-button">ЛОГИ</v-btn>
        <v-btn text :ripple="false" :to="{ path: '/system-admin/status' }" class="header-button">СТАТУС СИСТЕМЫ</v-btn>
      </div>

      <!-- Текст "Администратор" справа -->
      <span class="header-fullname">Администратор</span>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  name: 'SystemAdminHeader',
};
</script>

<style scoped>
/* Глобальные стили для уменьшения расстояния между буквами */
* {
  letter-spacing: -0.5px;
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

/* Кнопки в центре */
.header-button {
  height: 100% !important;
  border-radius: 0%;
  min-height: unset !important;
  padding-top: 0;
  padding-bottom: 0;
  align-self: stretch !important;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.3px;
  text-transform: none;
}
.header-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Текст справа */
.header-fullname {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: white;
}
</style>