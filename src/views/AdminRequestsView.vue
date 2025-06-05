<template>
  <div class="table-container">
    <main>
      <h1 class="mb-4">Заявки на перевод</h1>

      <v-data-table
          :headers="headers"
          :items="transfers"
          :loading="loading"
          :search="search"
          class="elevation-2 rounded"
          :items-per-page="10"
          :footer-props="{
            'items-per-page-options': [5, 10, 15, 20],
            'items-per-page-text': 'Строк на странице'
          }"
          item-key="id"
      >
        <template #top>
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>Список заявок</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Поиск по ФИО"
                single-line
                hide-details
                class="mr-4"
                style="max-width: 300px"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn
                color="white"
                outlined
                @click="fetchTransfers"
                class="mr-2"
            >
              <v-icon left>mdi-refresh</v-icon>
              Обновить
            </v-btn>
          </v-toolbar>
        </template>

        <template #[`item.groups_from`]="{ item }">
          <div v-for="(group, index) in item.groups_from" :key="index">
            {{ group[0] }} ({{ group[1] }})
          </div>
        </template>

        <template #[`item.groups_to`]="{ item }">
          <div v-for="(group, index) in item.groups_to" :key="index">
            {{ group[0] }} ({{ group[1] }})
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
              :color="getStatusColor(item.status)"
              small
              class="text-capitalize"
          >
            {{ translateStatus(item.status) }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <template v-if="item.status.toLowerCase() === 'pending'">
            <v-btn
                color="error"
                @click="rejectTransfer(item.id)"
                :loading="item.loading"
            >
              <v-icon size="18" left>mdi-close</v-icon>
            </v-btn>

            <v-btn
                color="success"
                @click="approveTransfer(item.id)"
                :loading="item.loading"
                class="ml-2"
            >
              <v-icon size="18" left>mdi-check</v-icon>
            </v-btn>
          </template>
        </template>

      </v-data-table>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axiosInstance from '@/axios/axios';

const transfers = ref([]);
const loading = ref(true);
const search = ref('');

const headers = [
  { title: 'ID', align: 'start', sortable: true, value: 'id', width: '80px' },
  { title: 'ФИО студента', align: 'start', value: 'student_fio', width: '200px' },
  { title: 'Из электива', align: 'start', value: 'from_elective_name' },
  { title: 'В электив', align: 'start', value: 'to_elective_name' },
  { title: 'Группы (из)', align: 'start', value: 'groups_from' },
  { title: 'Группы (в)', align: 'start', value: 'groups_to' },
  { title: 'Приоритет', align: 'center', value: 'priority', width: '100px' },
  { title: 'Статус', align: 'center', sortable: true, value: 'status', width: '120px' },
  { title: '', align: 'center', value: 'actions', width: '300px' }
];

const fetchTransfers = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get(`/all_transfer`);
    transfers.value = response.data.map(t => ({
      ...t,
      loading: false
    }));
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  } finally {
    loading.value = false;
  }
};

const approveTransfer = async (id) => {
  const transfer = transfers.value.find(t => t.id === id);
  if (transfer) {
    transfer.loading = true;
    try {
      await axiosInstance.post(`/transfer/approve/${id}`, {
        manager_id: localStorage.getItem('manager_id')
      });
      await fetchTransfers();
    } catch (error) {
      console.error('Ошибка при подтверждении заявки:', error);
    }
    transfer.loading = false;
  }
};

const rejectTransfer = async (id) => {
  const transfer = transfers.value.find(t => t.id === id);
  if (transfer) {
    transfer.loading = true;
    try {
      await axiosInstance.post(`/transfer/reject/${id}`, {
        manager_id: localStorage.getItem('manager_id')
      });
      await fetchTransfers();
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
    }
    transfer.loading = false;
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'grey';
  }
};

const translateStatus = (status) => {
  const statusMap = {
    'pending': 'В обработке',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };
  return statusMap[status.toLowerCase()] || status;
};

fetchTransfers();
</script>

<style scoped>
/* Контейнер для таблицы, чтобы занимала почти весь экран */
.table-container {
  height: 80vh;
  overflow: auto;
  padding: 20px;
}

.v-data-table {
  background-color: #fff !important;
}

:deep(.v-data-table-header) {
  background-color: #f5f5f5 !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: #333 !important;
  padding: 16px !important;
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px;
  border: 1px solid #eee;
}

:deep(.v-data-table td) {
  padding: 12px 16px !important;
  font-size: 14px;
}

:deep(.v-chip) {
  font-weight: 500;
}
</style>
