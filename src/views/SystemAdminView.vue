<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4 mb-6">Панель управления системного администратора</h1>
        <v-btn
          color="error"
          variant="text"
          class="logout-btn"
          @click="showLogoutDialog = true"
        >
          <v-icon left>mdi-logout</v-icon>
          Выйти
        </v-btn>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/system-admin/electives')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-book-open-page-variant</v-icon>
            Элективы
          </v-card-title>
          <v-card-text>
            Управление элективами, их статусами и настройками
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/system-admin/managers')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-account-group</v-icon>
            Менеджеры
          </v-card-title>
          <v-card-text>
            Создание и управление менеджерами системы
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/system-admin/logs')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-file-document</v-icon>
            Логи
          </v-card-title>
          <v-card-text>
            Просмотр системных логов и аудит действий пользователей
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/system-admin/status')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-server</v-icon>
            Статус системы
          </v-card-title>
          <v-card-text>
            Мониторинг состояния и производительности системы
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог подтверждения выхода -->
    <v-dialog v-model="showLogoutDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение выхода
        </v-card-title>
        <v-card-text>
          Вы действительно хотите выйти из системы?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showLogoutDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="logout"
          >
            Выйти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLogoutDialog = ref(false)

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  // Проверка авторизации
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const role = localStorage.getItem('role')

  if (!isAuthenticated || role !== 'system_admin') {
    router.push('/admin/login')
  }
})
</script>

<style scoped>
.v-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-5px);
}

.text-h4 {
  font-weight: 500;
  color: #1976d2;
}

.logout-btn {
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: scale(1.05);
}
</style>