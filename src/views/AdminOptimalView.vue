<template>
  <div class="table-container">
    <main>
      <h1 class="mb-4">Оптимальные заявки на перевод</h1>

      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-sheet class="pa-3 stat-sheet" elevation="2">
            <div class="text-h5 font-weight-bold">{{ rawTransfers.length }}</div>
            <div class="text-subtitle-2">Всего заявок</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="4">
          <v-sheet class="pa-3 stat-sheet" elevation="2">
            <div class="text-h5 font-weight-bold">{{ recommendedTransfers.length }}</div>
            <div class="text-subtitle-2">Оптимальных заявок</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="4">
          <v-sheet class="pa-3 stat-sheet" elevation="2">
            <div class="text-h5 font-weight-bold">{{ averagePriority.toFixed(2) }}</div>
            <div class="text-subtitle-2">Средний приоритет оптимальной заявки</div>
          </v-sheet>
        </v-col>
      </v-row>


      <v-data-table
          :headers="groupHeaders"
          :items="groupedTransfers"
          item-value="groupKey"
          show-expand
      >
        <!-- Кнопка для разворачивания строки -->
        <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
          <v-btn
              :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              :text="isExpanded(internalItem) ? 'Свернуть' : 'Подробнее'"
              class="text-none"
              color="primary"
              size="small"
              variant="text"
              @click="toggleExpand(internalItem)"
          ></v-btn>
        </template>

        <!-- Столбцы основной таблицы -->
        <template v-slot:item.studentFio="{ item }">
          {{ item.studentFio }}
        </template>
        <template v-slot:item.fromElective="{ item }">
          {{ item.fromElective }}
        </template>
        <template v-slot:item.groupsFrom="{ item }">
          <div v-for="(group, index) in item.groups_from" :key="index">
            {{ group[0] }} ({{ group[1] }}) - {{ group[2] }}/{{ group[3] }}
          </div>
        </template>
        <template v-slot:item.count="{ item }">
          {{ item.count }}
        </template>

        <!-- Раскрытая строка с деталями заявки -->
        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="py-2">
              <v-sheet rounded border>
                <v-data-table
                    :headers="detailHeaders"
                    :items="item.transfers"
                    hide-default-footer
                    item-value="id"
                >
                  <!-- Ячейки вложенной таблицы -->
                  <template v-slot:item.groupsTo="{ item: detail }">
                    <div v-for="(group, index) in detail.groups_to" :key="index">
                      {{ group[0] }} ({{ group[1] }})
                    </div>
                  </template>
                  <template v-slot:item.places="{ item: detail }">
                    <div v-for="(group, index) in detail.groups_to" :key="index">
                      {{ group[2] }}/{{ group[3] }}
                    </div>
                  </template>
                  <template v-slot:item.toElective="{ item: detail }">
                    {{ detail.to_elective_name }}
                  </template>
                  <template v-slot:item.recommended="{ item: detail }">
                    <v-chip v-if="isRecommended(detail.id)" color="green" small>
                      Рекомендуется
                    </v-chip>
                    <span v-else>-</span>
                  </template>
                  <template v-slot:item.actions="{ item: detail }">
                    <v-checkbox
                        v-model="selectedTransfers"
                        :value="detail.id"
                        dense
                        hide-details
                    ></v-checkbox>
                  </template>
                  <template v-slot:item.id="{ item: detail }">
                    {{ detail.id }}
                  </template>
                  <template v-slot:item.priority="{ item: detail }">
                    {{ detail.priority }}
                  </template>
                </v-data-table>
              </v-sheet>
            </td>
          </tr>
        </template>
      </v-data-table>

      <div class="d-flex justify-end mt-4">
        <v-btn color="error" class="mr-2" @click="rejectSelection">
          Отклонить выбранные
        </v-btn>
        <v-btn color="primary" @click="approveSelection">
          Подтвердить выбранные
        </v-btn>
      </div>
    </main>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import axiosInstance from '@/axios/axios'

const rawTransfers = ref([])        // Данные с сервера
const groupedTransfers = ref([])    // Группы заявок для основной таблицы
const recommendedTransfers = ref([])
const selectedTransfers = ref([])

const averagePriority = computed(() => {
  if (selectedTransfers.value.length === 0) return 0
  const selectedItems = rawTransfers.value.filter(item =>
      selectedTransfers.value.includes(item.id)
  )
  const sum = selectedItems.reduce((acc, item) => acc + item.priority, 0)
  return sum / selectedItems.length
})

const groupHeaders = [
  {title: 'Студент', key: 'studentFio', sortable: true},
  {title: 'Из электива', key: 'fromElective'},
  {title: 'Из групп', key: 'groupsFrom'},
  {title: 'Количество заявок', key: 'count', align: 'center'},
]

const detailHeaders = [
  {title: 'ID', key: 'id'},
  {title: 'Приоритет', key: 'priority'},
  {title: 'В электив', key: 'toElective'},
  {title: 'В группы', key: 'groupsTo'},
  {title: 'Наполненность', key: 'places'},
  {title: 'Рекомендация', key: 'recommended'},
  {title: 'Подтвердить', key: 'actions', sortable: false},
]

const isRecommended = (id) => {
  return recommendedTransfers.value.includes(id)
}

const loadData = async () => {
  try {
    const response = await axiosInstance.get('/optimal')
    rawTransfers.value = response.data.transfers
    recommendedTransfers.value = response.data.recommended_transfers
    selectedTransfers.value = [...recommendedTransfers.value]

    // Группируем заявки по студенту и по элективу
    const groupsMap = new Map()
    rawTransfers.value.forEach(item => {
      const studentFio = item.student_fio
      const fromElective = item.from_elective_name
      const key = `${studentFio}-${fromElective}`
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          groupKey: key,
          studentFio,
          fromElective,
          groups_from: item.groups_from || [],
          transfers: [{
            ...item,
            groups_to: item.groups_to || []
          }],
          count: 1,
        })
      } else {
        const group = groupsMap.get(key)
        group.transfers.push({
          ...item,
          groups_to: item.groups_to || []
        })
        group.count++
      }
    })
    groupedTransfers.value = Array.from(groupsMap.values())
  } catch (error) {
    console.error(error)
  }
}

const approveSelection = async () => {
  try {
    await axiosInstance.post('/transfers/approve', {
      transfers_ids: selectedTransfers.value,
    })
    alert('Выбранные заявки отправлены на подтверждение')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const rejectSelection = async () => {
  try {
    await axiosInstance.post('/transfers/reject', {
      transfers_ids: selectedTransfers.value,
    })
    alert('Выбранные заявки отклонены')
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.table-container {
  padding: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.stats-card {
  border-radius: 12px;
  overflow: hidden;
}

.stats-card-title {
  background: linear-gradient(135deg, #4caf50, #81c784);
  color: white;
  padding: 16px;
}

.stat-sheet {
  border-radius: 8px;
  background-color: white;
  transition: transform 0.2s ease;
}

.stat-sheet:hover {
  transform: scale(1.03);
}

</style>
