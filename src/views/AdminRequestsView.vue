<template>
    <div>
      <main>
        <h1 class="mb-4">Заявки на перевод</h1>
        
        <v-data-table
          :headers="headers"
          :items="transfers"
          :loading="loading"
          class="elevation-2 rounded"
          :items-per-page="10"
          :footer-props="{
            'items-per-page-options': [5, 10, 15, 20],
            'items-per-page-text': 'Строк на странице'
          }"
        >
          <template #top>
            <v-toolbar flat color="primary" dark>
              <v-toolbar-title>Список заявок</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
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
  
          <template #[`item.to_lecture_group_name`]="{ value }">
            {{ value || "—" }}
          </template>
  
          <template #[`item.to_practice_group_name`]="{ value }">
            {{ value || "—" }}
          </template>
  
          <template #[`item.to_lab_group_name`]="{ value }">
            {{ value || "—" }}
          </template>
  
          <template #[`item.to_consultation_group_name`]="{ value }">
            {{ value || "—" }}
          </template>
  
          <template #[`item.status`]="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
              class="text-capitalize"
            >
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table>
      </main>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'AdminTransfersView',
    
    data() {
      return {
        transfers: [],
        loading: true,
        headers: [
          { 
            text: 'ID',
            align: 'start',
            sortable: true,
            value: 'id',
            width: '80px'
          },
          { 
            text: 'ФИО студента',
            align: 'start', 
            value: 'student_fio',
            width: '200px'
          },
          { 
            text: 'Из предмета',
            align: 'start',
            value: 'from_elective_name'
          },
          { 
            text: 'В предмет',
            align: 'start',
            value: 'to_elective_name'
          },
          { 
            text: 'Лекционная группа',
            align: 'start',
            value: 'to_lecture_group_name'
          },
          { 
            text: 'Практическая группа',
            align: 'start',
            value: 'to_practice_group_name'
          },
          { 
            text: 'Лабораторная группа',
            align: 'start',
            value: 'to_lab_group_name'
          },
          { 
            text: 'Консультационная группа',
            align: 'start',
            value: 'to_consultation_group_name'
          },
          { 
            text: 'Статус',
            align: 'center',
            value: 'status',
            width: '120px'
          },
          { 
            text: 'Приоритет',
            align: 'center',
            value: 'priority',
            width: '100px'
          }
        ]
      };
    },
  
    created() {
      this.fetchTransfers();
    },
  
    methods: {
      async fetchTransfers() {
        const API_URL = process.env.VUE_APP_API_URL;
        try {
          this.loading = true;
          const response = await axios.get(`${API_URL}/all_transfer`);
          this.transfers = response.data.map(t => ({
            ...t,
            status: this.translateStatus(t.status)
          }));
        } catch (error) {
          console.error('Ошибка при получении данных:', error);
        } finally {
          this.loading = false;
        }
      },
  
      getStatusColor(status) {
        switch (status.toLowerCase()) {
          case 'одобрено':
            return 'success';
          case 'отклонено':
            return 'error';
          case 'в обработке':
          case 'pending':
            return 'warning';
          default:
            return 'grey';
        }
      },
  
      translateStatus(status) {
        const statusMap = {
          'pending': 'В обработке',
          'approved': 'Одобрено',
          'rejected': 'Отклонено'
        };
        return statusMap[status.toLowerCase()] || status;
      }
    }
  };
  </script>
  
  <style scoped>
  main {
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  .v-data-table {
    margin-top: 20px;
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