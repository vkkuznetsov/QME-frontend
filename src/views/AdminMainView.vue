<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4 mb-6">Панель управления менеджера</h1>
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
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/admin/requests')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-file-document</v-icon>
            Заявки
            <v-chip
              v-if="activeRequestsCount > 0"
              color="error"
              class="ml-2"
            >
              {{ activeRequestsCount }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            Просмотр и обработка заявок от пользователей
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/admin/optimal')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-auto-fix</v-icon>
            Автораспределение
          </v-card-title>
          <v-card-text>
            Настройка и запуск автоматического распределения
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/admin/reports')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-chart-bar</v-icon>
            Отчеты
          </v-card-title>
          <v-card-text>
            Просмотр статистики и аналитических отчетов
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="mx-auto"
          max-width="400"
          @click="$router.push('/admin/settings')"
        >
          <v-card-title class="d-flex align-center">
            <v-icon large color="primary" class="mr-3">mdi-cog</v-icon>
            Настройки системы
          </v-card-title>
          <v-card-text>
            Настройка параметров и конфигурации системы
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
import axiosInstance from '@/axios/axios'

const router = useRouter()
const showLogoutDialog = ref(false)
const activeRequestsCount = ref(0)

const fetchActiveRequestsCount = async () => {
  try {
    const response = await axiosInstance.get('/transfer/active-count')
    activeRequestsCount.value = response.data
  } catch (error) {
    console.error('Ошибка при получении количества активных заявок:', error)
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

onMounted(async () => {
  // Проверка авторизации
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const role = localStorage.getItem('role')
  
  if (!isAuthenticated || role !== 'admin') {
    router.push('/admin/login')
  } else {
    await fetchActiveRequestsCount()
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
