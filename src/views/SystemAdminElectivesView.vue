<template>
    <v-container class="py-8">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>Управление элективами</span>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
            class="search-field"
          />
        </v-card-title>
  
        <v-data-table
          :headers="headers"
          :items="electives"
          :search="search"
          :loading="loading"
          class="elevation-1"
          hide-default-footer
        >
          <!-- Колонки -->
          <template #item.cluster="{ item }">
            <v-chip small>{{ item.cluster ?? '—' }}</v-chip>
          </template>
          <template #item.free_spots="{ item }">
            <span>{{ item.free_spots }}</span>
          </template>
  
          <!-- Кнопка раскрытия -->
          <template #item.actions="{ item }">
            <v-btn icon small @click="toggleExpand(item.id)">
              <v-icon>
                {{ expanded.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </template>
  
          <!-- Раскрытая информация -->
          <template #expanded-item="{ item }">
            <td :colspan="headers.length">
              <v-sheet class="pa-4" elevation="2">
                <div class="text-subtitle-2 mb-2">Группы и студенты</div>
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">Группа</th>
                      <th class="text-left">Студентов</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="grp in groups[item.id] || []"
                      :key="grp.id"
                    >
                      <td>{{ grp.name }}</td>
                      <td>{{ grp.students?.length || 0 }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-sheet>
            </td>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axiosInstance from '@/axios/axios'
  
  const search = ref('')
  const loading = ref(true)
  const electives = ref([])
  const expanded = ref([])
  const groups = ref({}) // { [electiveId]: Array<{id, name, students}> }
  
  const headers = [
    { title: 'ID', value: 'id', width: '70px' },
    { title: 'Название', value: 'name' },
    { title: 'Кластер', value: 'cluster', width: '120px' },
    { title: 'Свободные места', value: 'free_spots', width: '140px' },
    { title: 'Действия', value: 'actions', sortable: false, width: '80px' },
  ]
  
  async function fetchElectives() {
    loading.value = true
    try {
      const { data } = await axiosInstance.get('/all_elective')
      electives.value = data
    } catch (e) {
      console.error('Ошибка загрузки элективов:', e)
    } finally {
      loading.value = false
    }
  }
  
  async function fetchGroups(electiveId) {
    // если уже загружены — не запрашивать заново
    if (groups.value[electiveId]) return
    try {
      const { data } = await axiosInstance.get(`/elective/${electiveId}/groups`)
      groups.value = { ...groups.value, [electiveId]: data }
    } catch (e) {
      console.error(`Ошибка загрузки групп для ${electiveId}:`, e)
      groups.value = { ...groups.value, [electiveId]: [] }
    }
  }
  
  function toggleExpand(id) {
    const idx = expanded.value.indexOf(id)
    if (idx === -1) {
      expanded.value.push(id)
      fetchGroups(id)
    } else {
      expanded.value.splice(idx, 1)
    }
  }
  
  onMounted(fetchElectives)
  </script>
  
  <style scoped>
  .search-field {
    max-width: 300px;
  }
  .v-data-table {
    background-color: #fff;
  }
  .v-sheet {
    background: #fafafa;
    border-radius: 4px;
  }
  </style>
  