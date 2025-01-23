<template>
    <v-container fluid class="requests-container">
      <v-row>
        <!-- ЛЕВАЯ КОЛОНКА: Список заявок + визуализация -->
        <v-col cols="12" md="6">
          <v-card class="pa-4 mb-4 custom-shadow">
            <h2 class="requests-title">Мои заявки на перезапись</h2>
  
            <div v-if="loadingRequests" class="text-center my-4">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="requestsError" class="text-center my-4">
              <v-alert type="error" dismissible>{{ requestsError }}</v-alert>
            </div>
            <div v-else>
              <!-- Визуализация заявок -->
              <div v-if="userRequests.length > 0" class="mb-4">
                <h4 class="mt-2">Статистика заявок по статусам</h4>
                <v-sparkline
                  :value="requestsBarData"
                  type="bar"
                  height="60"
                  :color="requestsBarColors"
                ></v-sparkline>
                <div class="legend mt-2">
                  <span
                    v-for="(label, index) in statusLabels"
                    :key="index"
                    class="legend-item"
                  >
                    <v-avatar size="14" class="mr-1" :color="requestsBarColors[index]"></v-avatar>
                    {{ label }} ({{ requestsBarData[index] }})
                  </span>
                </div>
              </div>
  
              <!-- Список заявок -->
              <div v-if="userRequests && userRequests.length > 0">
                <v-card
                  v-for="(req, index) in userRequests"
                  :key="req.id || index"
                  class="pa-3 mb-3"
                  outlined
                >
                  <p><strong>Электив:</strong> {{ req.electiveName }}</p>
                  <p><strong>Выбранные группы:</strong></p>
                  <ul>
                    <li v-for="(gr, idx2) in req.selectedGroups" :key="idx2">
                      {{ gr.type }} — {{ gr.name }}
                    </li>
                  </ul>
                  <div class="d-flex align-center mt-2">
                    <strong class="mr-2">Статус:</strong>
                    <!-- Цветовая метка статуса (chip) -->
                    <v-chip
                      :color="statusColor(req.status)"
                      text-color="white"
                      small
                    >
                      {{ req.status }}
                    </v-chip>
                  </div>
                </v-card>
              </div>
              <div v-else>
                <p class="text-center">У вас нет заявок на перезапись</p>
              </div>
            </div>
          </v-card>
        </v-col>
  
        <!-- ПРАВАЯ КОЛОНКА: Форма для новой заявки -->
        <v-col cols="12" md="6">
          <v-card class="pa-4 custom-shadow">
            <h2 class="requests-title">Подать новую заявку</h2>
  
            <div v-if="loadingCourses" class="text-center my-4">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="coursesError" class="text-center my-4">
              <v-alert type="error" dismissible>{{ coursesError }}</v-alert>
            </div>
            <div v-else>
              <!-- Выбор электива -->
              <v-select
                v-model="selectedElective"
                :items="formattedElectives"
                item-text="name"
                item-value="id"
                label="Выберите электив"
                outlined
                dense
                class="mb-4"
                @change="onElectiveChange"
              ></v-select>
  
              <!-- Если студент выбрал электив, показываем выбор групп -->
              <div v-if="selectedElectiveGroups.length > 0">
                <div
                  v-for="(groups, type) in groupedByType"
                  :key="type"
                  class="mb-4"
                >
                  <p style="font-weight: 600;">Выберите группу ({{ type }})</p>
                  <v-select
                    v-model="selectedGroupsMap[type]"
                    :items="groups"
                    item-text="name"
                    item-value="id"
                    :label="`Группа по типу: ${type}`"
                    outlined
                    dense
                  ></v-select>
                </div>
  
                <v-btn
                  color="primary"
                  @click="submitRequest"
                  :disabled="!canSubmit"
                >
                  Отправить заявку
                </v-btn>
              </div>
              <div v-else>
                <p>Сначала выберите электив, чтобы отобразить его группы.</p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'RequestsView',
    setup() {
      // Пользователь
      const userId = ref(null);
  
      // Список заявок
      const userRequests = ref([]);
      const loadingRequests = ref(false);
      const requestsError = ref(null);
  
      // Список элективов
      const electives = ref([]);
      const loadingCourses = ref(false);
      const coursesError = ref(null);
  
      // Выбранный электив
      const selectedElective = ref(null);
      // Группы выбранного электива
      const selectedElectiveGroups = ref([]);
  
      // Map для выбора одной группы каждого типа
      const selectedGroupsMap = ref({});
  
      // --- ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ ---
      async function loadCurrentUser() {
        try {
          const userEmail =
            localStorage.getItem('userEmail') || 'stud0000257868@study.utmn.ru';
          const resp = await axios.get('/api/users', { params: { email: userEmail } });
          userId.value = resp.data.id;
        } catch (err) {
          console.error('Ошибка при загрузке пользователя', err);
        }
      }
  
      // --- ЗАГРУЗКА ЗАЯВОК ---
      async function fetchRequests() {
        if (!userId.value) return;
        loadingRequests.value = true;
        requestsError.value = null;
        try {
          const resp = await axios.get('/api/requests', {
            params: { userId: userId.value },
          });
          userRequests.value = resp.data;
        } catch (err) {
          console.error(err);
          requestsError.value = 'Не удалось загрузить ваши заявки';
        } finally {
          loadingRequests.value = false;
        }
      }
  
      // --- ЗАГРУЗКА КУРСОВ ---
      async function fetchAllElectives() {
        loadingCourses.value = true;
        coursesError.value = null;
        try {
          const resp = await axios.get('/api/courses');
          electives.value = resp.data;
        } catch (err) {
          console.error(err);
          coursesError.value = 'Не удалось загрузить список элективов';
        } finally {
          loadingCourses.value = false;
        }
      }
  
      // --- ВЫБОР ЭЛЕКТИВА (загрузка групп) ---
      async function onElectiveChange() {
        selectedGroupsMap.value = {};
        if (!selectedElective.value) {
          selectedElectiveGroups.value = [];
          return;
        }
        try {
          const resp = await axios.get(`/api/courses/${selectedElective.value}/groups`);
          selectedElectiveGroups.value = resp.data;
        } catch (err) {
          console.error('Не удалось загрузить группы электива', err);
          selectedElectiveGroups.value = [];
        }
      }
  
      // --- ГРУППИРОВКА ПОЛУЧЕННЫХ ГРУПП ПО TYPE ---
      const groupedByType = computed(() => {
        const map = {};
        selectedElectiveGroups.value.forEach((g) => {
          if (!map[g.type]) {
            map[g.type] = [];
          }
          map[g.type].push(g);
        });
        return map;
      });
  
      // --- МОЖНО ЛИ ОТПРАВИТЬ ЗАЯВКУ ---
      const canSubmit = computed(() => {
        const types = Object.keys(groupedByType.value);
        if (types.length === 0) return false;
        return types.every((type) => selectedGroupsMap.value[type]);
      });
  
      // --- ОТПРАВКА ЗАЯВКИ ---
      async function submitRequest() {
        try {
          const chosenGroups = [];
          Object.keys(selectedGroupsMap.value).forEach((type) => {
            const groupId = selectedGroupsMap.value[type];
            const g = groupedByType.value[type].find((gg) => gg.id === groupId);
            if (g) {
              chosenGroups.push({
                id: g.id,
                type: g.type,
                name: g.name,
              });
            }
          });
  
          const payload = {
            userId: userId.value,
            electiveId: selectedElective.value,
            selectedGroups: chosenGroups,
          };
  
          await axios.post('/api/requests', payload);
          // Обновить список заявок
          fetchRequests();
          // Сброс
          selectedElective.value = null;
          selectedElectiveGroups.value = [];
          selectedGroupsMap.value = {};
          alert('Заявка успешно отправлена!');
        } catch (err) {
          console.error('Ошибка при отправке заявки', err);
          alert('Не удалось отправить заявку, попробуйте позже.');
        }
      }
  
      onMounted(async () => {
        // Сначала пользователь -> заявок
        await loadCurrentUser();
        if (userId.value) {
          fetchRequests();
        }
        // Список всех элективов
        fetchAllElectives();
      });
  
      // --- ВИЗУАЛИЗАЦИЯ ЗАЯВОК (аналогично главной) ---
      const statusLabels = ['Ожидается', 'Одобрено', 'Отклонено'];
      const requestsByStatus = computed(() => {
        const counts = { 'Ожидается': 0, 'Одобрено': 0, 'Отклонено': 0 };
        userRequests.value.forEach((req) => {
          if (counts[req.status] !== undefined) {
            counts[req.status]++;
          }
        });
        return counts;
      });
      const requestsBarData = computed(() => {
        return statusLabels.map((status) => requestsByStatus.value[status] || 0);
      });
      const requestsBarColors = ['#FFC107', '#4CAF50', '#F44336'];
  
      // Цвет чипа для статуса
      const statusColor = (status) => {
        switch (status) {
          case 'Ожидается':
            return 'yellow darken-2';
          case 'Одобрено':
            return 'green darken-2';
          case 'Отклонено':
            return 'red darken-2';
          default:
            return 'blue';
        }
      };
  
      // --- ОБРАБОТКА ДАННЫХ ЭЛЕКТИВОВ ---
      const formattedElectives = computed(() => {
        return electives.value.map(course => ({
          id: course.id,
          name: course.name || 'Неизвестный электив'
        }));
      });
  
      return {
        userId,
        userRequests,
        loadingRequests,
        requestsError,
        electives,
        loadingCourses,
        coursesError,
        selectedElective,
        selectedElectiveGroups,
        onElectiveChange,
        groupedByType,
        selectedGroupsMap,
        canSubmit,
        submitRequest,
  
        // Визуализация заявок
        statusLabels,
        requestsBarData,
        requestsBarColors,
        statusColor,
  
        // Обработанные элективы
        formattedElectives,
      };
    },
  };
  </script>
  
  <style scoped>
  .requests-container {
    font-family: 'Montserrat', sans-serif;
    padding: 30px 15px;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  
  .requests-title {
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .custom-shadow {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }
  
  /* Легенда для диаграммы */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
  }
  .legend-item .v-avatar {
    border-radius: 50%;
  }
  </style>