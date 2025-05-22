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
        show-expand
        item-key="id"
      >
        <!-- Колонки основной таблицы -->
        <template #item.cluster="{ item }">
          <v-chip small>{{ item.cluster ?? '—' }}</v-chip>
        </template>
        <template #item.free_spots="{ item }">
          <span>{{ item.free_spots }}</span>
        </template>

        <!-- Кнопка раскрытия -->
        <template #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
          <v-btn
            icon
            small
            @click="onToggleExpand(internalItem, isExpanded, toggleExpand)"
          >
            <v-icon>
              {{ isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
          </v-btn>
        </template>

        <!-- Раскрытая строка с деталями групп -->
        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="py-2">
              <v-sheet class="pa-4" elevation="2">
                <div class="text-subtitle-2 mb-2">Группы и студенты</div>
                <v-progress-circular
                  v-if="loadingGroups[item.id]"
                  indeterminate
                  size="24"
                  class="mb-2"
                />
                <v-data-table
                  v-else
                  :headers="groupHeaders"
                  :items="groups[item.id] || []"
                  hide-default-footer
                  dense
                >
                  <template #item.students.length="{ item: grp }">
                    {{ grp.students?.length || 0 }}
                  </template>
                </v-data-table>
              </v-sheet>
            </td>
          </tr>
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
const groups = ref({}) // { [electiveId]: Array<{id, name, students}> }
const loadingGroups = ref({}) // { [electiveId]: boolean }

const headers = [
  { title: 'ID', value: 'id', width: '70px' },
  { title: 'Название', value: 'name' },
  { title: 'Кластер', value: 'cluster', width: '120px' },
  { title: 'Свободные места', value: 'free_spots', width: '140px' },
]

const groupHeaders = [
  { title: 'Группа', value: 'name' },
  { title: 'Тип', value: 'type' },
  { title: 'Вместимость', value: 'capacity' },
  { title: 'Студентов', value: 'students.length' },
  { title: 'Свободно', value: 'free_spots' },
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
  if (groups.value[electiveId] || loadingGroups.value[electiveId]) return

  loadingGroups.value = { ...loadingGroups.value, [electiveId]: true }
  try {
    const { data } = await axiosInstance.get(`/elective/${electiveId}/groups`)
    groups.value = { ...groups.value, [electiveId]: data }
  } catch (e) {
    console.error(`Ошибка загрузки групп для ${electiveId}:`, e)
    groups.value = { ...groups.value, [electiveId]: [] }
  } finally {
    loadingGroups.value = { ...loadingGroups.value, [electiveId]: false }
  }
}

function onToggleExpand(internalItem, isExpanded, toggleExpand) {
  console.log(internalItem)

  if (!isExpanded(internalItem)) {
    fetchGroups(internalItem.value)
  }
  toggleExpand(internalItem)
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