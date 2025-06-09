<template>
  <v-container class="py-8">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Системные логи</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          class="mr-2"
          @click="handleRefresh"
          :loading="loading"
        >
          <v-icon left>mdi-refresh</v-icon>
          Обновить
        </v-btn>
        <v-btn
          color="success"
          class="mr-2"
          @click="handleDownload"
          :disabled="loading"
        >
          <v-icon left>mdi-download</v-icon>
          Скачать
        </v-btn>
        <v-btn
          v-if="activeTab === 'raw'"
          color="error"
          @click="openClearDialog"
          :disabled="loading"
        >
          <v-icon left>mdi-delete</v-icon>
          Очистить файл
        </v-btn>
      </v-card-title>

      <v-tabs v-model="activeTab" grow>
        <v-tab value="db">Логи из БД</v-tab>
        <v-tab value="raw">Лог-файл (raw)</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <v-window-item value="db">
            <v-row class="mb-4" dense>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.level"
                  :items="['INFO', 'WARNING', 'ERROR', 'DEBUG']"
                  label="Уровень лога"
                  clearable
                  hide-details
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="filters.source"
                  label="Источник"
                  clearable
                  hide-details
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                 <v-text-field
                  v-model.number="filters.limit"
                  label="Лимит записей"
                  type="number"
                  hide-details
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn @click="fetchDbLogs" block color="grey-darken-1">Применить фильтры</v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="dbLogHeaders"
              :items="dbLogs"
              :loading="loading"
              class="elevation-1"
              item-key="id"
              no-data-text="Нет данных для отображения"
              loading-text="Загрузка данных..."
            >
              <template v-slot:item.level="{ item }">
                <v-chip :color="getLevelColor(item.level)" small>
                  {{ item.level }}
                </v-chip>
              </template>
              <template v-slot:item.timestamp="{ item }">
                {{ new Date(item.timestamp).toLocaleString() }}
              </template>
            </v-data-table>
          </v-window-item>

          <v-window-item value="raw">
            <v-textarea
              v-model="rawLogs"
              readonly
              auto-grow
              rows="20"
              class="log-textarea"
              :loading="loading"
              placeholder="Содержимое файла application.log..."
            ></v-textarea>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <v-dialog v-model="clearDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение очистки
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите очистить файл <b>application.log</b>? Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="clearDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" text @click="confirmClearRawLogs">
            Очистить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axiosInstance from '@/axios/axios';

// Состояние компонента
const loading = ref(false);
const clearDialog = ref(false);
const activeTab = ref('db'); // 'db' или 'raw'

// --- Состояние для логов из БД ---
const dbLogs = ref([]);
const filters = reactive({
  level: null,
  source: null,
  limit: 100,
});
const dbLogHeaders = [
  { title: 'Уровень', key: 'level', sortable: true, width: '120px' },
  { title: 'Время', key: 'timestamp', sortable: true, width: '200px' },
  { title: 'Источник', key: 'source', sortable: true, width: '150px' },
  { title: 'Сообщение', key: 'message', sortable: false },
];

// --- Состояние для лог-файла ---
const rawLogs = ref('');


// --- Методы для работы с логами из БД ---

const fetchDbLogs = async () => {
  loading.value = true;
  dbLogs.value = [];
  try {
    // Формируем параметры запроса динамически
    const params = { limit: filters.limit };
    let url = '/logs/';
    
    if (filters.level && filters.source) {
       // API не поддерживает одновременную фильтрацию, выберем по уровню
       url = `/logs/${filters.level}`;
       params.source_like = filters.source; // Пример, если бы API поддерживал поиск по части строки
    } else if (filters.level) {
      url = `/logs/${filters.level}`;
    } else if (filters.source) {
      url = `/logs/source/${filters.source}`;
    }
    
    const response = await axiosInstance.get(url, { params });
    dbLogs.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке логов из БД:', error);
    // Здесь можно добавить уведомление для пользователя
  } finally {
    loading.value = false;
  }
};

const downloadDbLogs = () => {
  if (dbLogs.value.length === 0) return;
  
  const data = JSON.stringify(dbLogs.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `db_logs_${new Date().toISOString()}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// --- Методы для работы с лог-файлом ---

const fetchRawLogs = async () => {
  loading.value = true;
  try {
    // Используем новый эндпоинт для получения raw-логов
    const response = await axiosInstance.get('/logs/raw/backend');
    rawLogs.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке raw логов:', error);
    rawLogs.value = 'Ошибка при загрузке лог-файла.';
  } finally {
    loading.value = false;
  }
};

const downloadRawLogs = () => {
  const blob = new Blob([rawLogs.value], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'application.log');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const openClearDialog = () => {
  clearDialog.value = true;
};

const confirmClearRawLogs = async () => {
  clearDialog.value = false;
  loading.value = true;
  try {
    // Используем новый эндпоинт для очистки
    await axiosInstance.delete('/logs/raw/backend');
    await fetchRawLogs(); // Обновляем содержимое после очистки
  } catch (error) {
    console.error('Ошибка при очистке логов:', error);
  } finally {
    loading.value = false;
  }
};

// --- Общие обработчики ---

const handleRefresh = () => {
  if (activeTab.value === 'db') {
    fetchDbLogs();
  } else {
    fetchRawLogs();
  }
};

const handleDownload = () => {
   if (activeTab.value === 'db') {
    downloadDbLogs();
  } else {
    downloadRawLogs();
  }
}

// --- Вспомогательные функции и хуки ---

const getLevelColor = (level) => {
  switch (level.toUpperCase()) {
    case 'ERROR': return 'red-darken-1';
    case 'WARNING': return 'orange-darken-1';
    case 'INFO': return 'blue-darken-1';
    case 'DEBUG': return 'grey';
    default: return 'primary';
  }
};

onMounted(() => {
  fetchDbLogs();
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
