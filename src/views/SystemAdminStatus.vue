<template>
  <v-container class="py-10">
    <v-row justify="center" class="mb-6">
        <v-btn
          :loading="loading"
          color="primary"
          large
          elevation="4"
          @click="fetchHealthStatus"
        >
        Обновить статус
      </v-btn>
    </v-row>

    <v-row justify="center" align="stretch" dense>
      <v-col cols="12" md="5">
        <v-hover v-slot="{ hover }">
          <v-scale-transition>
              <v-card
                :elevation="hover ? 12 : 4"
                class="pa-6 text-center"
              >
                <v-icon
                  size="64"
                  :color="status.postgres ? 'green' : 'red'"
                  class="mb-4"
                >
                {{ status.postgres ? 'mdi-database' : 'mdi-database-off' }}
              </v-icon>
              <div class="text-h6 mb-2">PostgreSQL</div>
              <div class="text-subtitle-1" :class="status.postgres ? 'green--text' : 'red--text'">
                {{ status.postgres ? 'Доступна' : 'Недоступна' }}
              </div>
            </v-card>
          </v-scale-transition>
        </v-hover>
      </v-col>

      <v-col cols="12" md="5">
        <v-hover v-slot="{ hover }">
          <v-scale-transition>
              <v-card
                :elevation="hover ? 12 : 4"
                class="pa-6 text-center"
              >
                <v-icon
                  size="64"
                  :color="status.redis ? 'green' : 'red'"
                  class="mb-4"
                >
                {{ status.redis ? 'mdi-server' : 'mdi-server-off' }}
              </v-icon>
              <div class="text-h6 mb-2">Redis</div>
              <div class="text-subtitle-1" :class="status.redis ? 'green--text' : 'red--text'">
                {{ status.redis ? 'Доступен' : 'Недоступен' }}
              </div>
            </v-card>
          </v-scale-transition>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axiosInstance from '@/axios/axios'

const status = ref({ postgres: false, redis: false })
const loading = ref(false)
let intervalId = null

async function fetchHealthStatus() {
  loading.value = true
  try {
    const res = await axiosInstance.get('/health/all_connection')
    status.value = {
      postgres: res.data?.PostgresHealthcheckService ?? false,
      redis: res.data?.RedisHealthcheckService ?? false,
    }
  } catch (err) {

  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHealthStatus()
  intervalId = setInterval(fetchHealthStatus, 5000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-4px);
}
</style>
