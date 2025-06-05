<template>
  <v-container fluid class="reports-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Отчеты</h1>
      </v-col>
    </v-row>

    <!-- Кнопки генерации отчетов -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4" lg="3" v-for="reportType in reportTypes" :key="reportType.value">
        <v-card class="report-card" :loading="generatingReport === reportType.value">
          <v-card-title class="d-flex align-center">
            <v-icon :color="reportType.color" class="mr-2">{{ reportType.icon }}</v-icon>
            {{ reportType.title }}
          </v-card-title>
          <v-card-text>
            {{ reportType.description }}
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              block
              :loading="generatingReport === reportType.value"
              :disabled="generatingReport !== null"
              @click="generateReport(reportType.value)"
            >
              Сгенерировать
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица отчетов -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-file-document</v-icon>
            История отчетов
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="reports"
            :loading="loading"
            class="elevation-1"
          >
            <!-- Тип отчета -->
            <template v-slot:item.report_type="{ item }">
              {{ getReportTypeTitle(item.report_type) }}
            </template>

            <!-- Статус -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>

            <!-- Дата создания -->
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>

            <!-- Действия -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="item.status === 'completed'"
                icon
                size="small"
                color="primary"
                @click="downloadReport(item.id)"
                :loading="downloadingReport === item.id"
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Снэкбар для уведомлений -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportApi } from '@/api/report'

// Состояния
const reports = ref([])
const loading = ref(false)
const generatingReport = ref(null)
const downloadingReport = ref(null)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Типы отчетов
const reportTypes = [
  {
    title: 'Отчет по заявкам',
    value: 'student_transfers',
    description: 'Статистика по всем заявкам на перезапись',
    icon: 'mdi-file-document-outline',
    color: 'primary'
  },
  {
    title: 'Отчет по группам',
    value: 'elective_statistics',
    description: 'Информация о заполненности групп',
    icon: 'mdi-account-group',
    color: 'success'
  },
  {
    title: 'Отчет по менеджерам',
    value: 'manager_actions',
    description: 'Статистика по всем элективам',
    icon: 'mdi-book-open-page-variant',
    color: 'info'
  }
]

// Заголовки таблицы
const headers = [
  { title: 'Тип отчета', key: 'report_type' },
  { title: 'Статус', key: 'status' },
  { title: 'Дата создания', key: 'created_at' },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Методы
const loadReports = async () => {
  loading.value = true
  try {
    const response = await reportApi.getReports()
    reports.value = response.data
  } catch (error) {
    showSnackbar('Ошибка при загрузке отчетов', 'error')
  } finally {
    loading.value = false
  }
}

const generateReport = async (reportType) => {
  generatingReport.value = reportType
  try {
    await reportApi.generateReport(reportType)
    showSnackbar('Отчет успешно создан')
    await loadReports()
  } catch (error) {
    showSnackbar('Ошибка при создании отчета', 'error')
  } finally {
    generatingReport.value = null
  }
}

const downloadReport = async (reportId) => {
  downloadingReport.value = reportId
  try {
    const response = await reportApi.downloadReport(reportId)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report_${reportId}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    showSnackbar('Отчет успешно скачан')
  } catch (error) {
    showSnackbar('Ошибка при скачивании отчета', 'error')
  } finally {
    downloadingReport.value = null
  }
}

const getReportTypeTitle = (type) => {
  const reportType = reportTypes.find(t => t.value === type)
  return reportType ? reportType.title : type
}

const getStatusColor = (status) => {
  const colors = {
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'failed': 'error'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'pending': 'Ожидает',
    'processing': 'В обработке',
    'completed': 'Готов',
    'failed': 'Ошибка'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('ru-RU')
}

const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

// Инициализация
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px;
}

.report-card {
  height: 100%;
  transition: transform 0.2s;
}

.report-card:hover {
  transform: translateY(-4px);
}

.v-card-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.v-card-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .reports-container {
    padding: 24px 16px;
  }
}

@media (max-width: 600px) {
  .reports-container {
    padding: 16px 12px;
  }
}
</style> 