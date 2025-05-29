<template>
  <v-container class="py-8">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Системные логи</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          class="mr-2"
          @click="refreshLogs"
          :loading="loading"
        >
          <v-icon left>mdi-refresh</v-icon>
          Обновить
        </v-btn>
        <v-btn
          color="success"
          class="mr-2"
          @click="downloadLogs"
          :disabled="loading"
        >
          <v-icon left>mdi-download</v-icon>
          Скачать логи
        </v-btn>
        <v-btn
          color="error"
          @click="clearLogs"
          :disabled="loading"
        >
          <v-icon left>mdi-delete</v-icon>
          Очистить логи
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-textarea
          v-model="logs"
          readonly
          auto-grow
          rows="20"
          class="log-textarea"
          :loading="loading"
        ></v-textarea>
      </v-card-text>
    </v-card>

    <!-- Диалог подтверждения очистки логов -->
    <v-dialog v-model="clearDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение очистки
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите очистить все логи? Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="clearDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            text
            @click="confirmClearLogs"
          >
            Очистить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosInstance from '@/axios/axios';

const loading = ref(false);
const clearDialog = ref(false);
const logs = ref('');

const refreshLogs = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get('/logs/backend');
    logs.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке логов:', error);
    logs.value = 'Ошибка при загрузке логов';
  } finally {
    loading.value = false;
  }
};

const downloadLogs = async () => {
  try {
    const response = await axiosInstance.get('/logs/download', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'application.log');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при скачивании логов:', error);
  }
};

const clearLogs = () => {
  clearDialog.value = true;
};

const confirmClearLogs = async () => {
  try {
    await axiosInstance.delete('/logs/clear');
    await refreshLogs();
    clearDialog.value = false;
  } catch (error) {
    console.error('Ошибка при очистке логов:', error);
  }
};

onMounted(() => {
  refreshLogs();
});
</script>

<style scoped>
.log-textarea {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
}

:deep(.v-textarea textarea) {
  color: #333;
}
</style>