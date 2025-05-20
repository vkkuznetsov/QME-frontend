<template>
  <div>
    <main>
      <h1>Панель системного администратора</h1>
      <p>Здесь вы можете управлять пользователями системы, настройками и просматривать логи.</p>
      
      <v-row class="mt-6">
        <v-col cols="12" md="4">
          <v-card class="mx-auto" max-width="400">
            <v-card-title>Элективы</v-card-title>
            <v-card-text>
              Управление элективами, их статусами и настройками
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/system-admin/electives">
                Перейти
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mx-auto" max-width="400">
            <v-card-title>Настройки системы</v-card-title>
            <v-card-text>
              Конфигурация системных параметров и глобальных настроек
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/system-admin/settings">
                Перейти
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="mx-auto" max-width="400">
            <v-card-title>Логи системы</v-card-title>
            <v-card-text>
              Просмотр системных логов и аудит действий пользователей
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/system-admin/logs">
                Перейти
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </main>
  </div>
</template>

<script>
export default {
  name: 'SystemAdminView',
};
</script>

<style scoped>
main {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style> 