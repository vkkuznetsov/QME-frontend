<template>
  <v-container fluid class="requests-container">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 mb-4 custom-shadow main-request-card">
          <div class="header-section justify-space-between" style="text-align: center;">
            <h2 class="requests-title">Мои заявки на перезапись</h2>
          </div>
          <!-- Индикатор загрузки / Ошибка -->
          <div v-if="loadingRequests" class="text-center my-4">
            <v-progress-circular indeterminate color="primary"/>
          </div>
          <div v-else-if="requestsError" class="text-center my-4">
            <v-alert type="error" dismissible>{{ requestsError }}</v-alert>
          </div>
          <div v-else>
            <!-- Если нет заявок вообще -->
            <div v-if="userRequests.length === 0" class="no-requests-text">
              <p class="text-center">У вас нет заявок на перезапись</p>
            </div>
            <!-- Иначе отображаем секции по sourceElectiveId -->
            <div v-else>
              <div
                  v-for="(group, sourceElectiveId) in groupsData"
                  :key="sourceElectiveId"
                  class="source-section mb-8"
              >
                <!-- Заголовок для каждой группы -->
                <div class="group-header d-flex align-center mb-3">
                  <v-icon color="primary" class="mr-2" size="24"
                  >mdi-book-outline
                  </v-icon
                  >
                  <h3 class="source-title">{{ group.name }}</h3>
                </div>
                <!-- Подсказка для перетаскивания -->
                <div class="drag-hint text-caption grey--text text-center mb-3">
                  Меняйте приоритет перетаскивая заявки
                </div>
                <!-- Сетка заявок -->
                <v-row class="dnd-list interactive-area" dense>
                  <v-col
                      v-for="(req, index) in group.requests"
                      :key="req.id"
                      cols="12"
                      md="4"
                      lg="3"
                      class="d-flex"
                  >
                    <!-- DnD оболочка -->
                    <div
                        class="request-card-wrapper flex-grow-1"
                        :class="{
                        'drop-target': index === dragOverIndex[sourceElectiveId],
                        'rejected': req.status === 'Отклонено',
                      }"
                        :draggable="isDraggable(req)"
                        @dragstart="onDragStart($event, sourceElectiveId, index)"
                        @dragover.prevent="onDragOver($event, sourceElectiveId, index)"
                        @dragenter.prevent="onDragEnter($event, sourceElectiveId, index)"
                        @dragleave="onDragLeave($event, sourceElectiveId, index)"
                        @drop="onDrop($event, sourceElectiveId, index)"
                        @dragend="onDragEnd($event, sourceElectiveId)"
                    >
                      <!-- Используем компонент RequestCard -->
                      <RequestCard
                          :req="req"
                          @request-canceled="onRequestCanceled"
                      />
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ref, reactive, onMounted} from 'vue';
import axiosInstance from '@/axios/axios';
import RequestCard from '@/components/RequestCard.vue';

export default {
  name: 'UserRequestsView',
  components: {
    RequestCard,
  },
  setup() {
    // Локальные состояния
    const userId = ref(null);
    const userRequests = ref([]);
    const loadingRequests = ref(false);
    const requestsError = ref(null);

    // Группированные заявки
    const groupsData = reactive({});

    // DnD: храним индексы
    const draggedIndex = reactive({});
    const dragOverIndex = reactive({});


    async function loadCurrentUser() {
      try {
        const userEmail =
            localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
        const resp = await axiosInstance.get(`/student_info`, {
          params: {email: userEmail},
        });
        userId.value = resp.data.id;
      } catch (err) {
        console.error('Ошибка при загрузке пользователя', err);
      }
    }

    // Загрузка заявок для этого пользователя
    async function fetchRequests() {
      if (!userId.value) return;
      loadingRequests.value = true;
      requestsError.value = null;
      try {
        const resp = await axiosInstance.get(`/transfer`, {
          params: {student_id: userId.value},
        });
        userRequests.value = resp.data;
        buildGroups();
      } catch (err) {
        console.error(err);
        requestsError.value = 'Не удалось загрузить ваши заявки';
      } finally {
        loadingRequests.value = false;
      }
    }

    // Инициализация
    onMounted(async () => {
      await loadCurrentUser();
      if (userId.value) {
        fetchRequests();
      }
    });

    // Формируем объект groupsData
    function buildGroups() {
      // Очищаем прежние данные
      for (const k in groupsData) {
        delete groupsData[k];
      }
      // Раскладываем userRequests по sourceElectiveId
      userRequests.value.forEach((req) => {
        const id = req.sourceElectiveId;
        if (!id) return;
        if (!groupsData[id]) {
          groupsData[id] = {
            name: req.sourceElectiveName || 'Неизвестный электив',
            requests: [],
          };
        }
        groupsData[id].requests.push(req);
      });

      // Сортируем
      for (const sourceId in groupsData) {
        const group = groupsData[sourceId];
        const arr = group.requests;
        // Если есть «Одобрено», оставляем только его
        const approved = arr.find((r) => r.status === 'Одобрено');
        if (approved) {
          group.requests = [approved];
        } else {
          // Иначе, «Отклонено» в конце, остальные по приоритету
          arr.sort((a, b) => {
            if (a.status === 'Отклонено' && b.status !== 'Отклонено') return 1;
            if (b.status === 'Отклонено' && a.status !== 'Отклонено') return -1;
            return (a.priority || 0) - (b.priority || 0);
          });
        }
      }
    }

    // DnD Logic
    function isDraggable(req) {
      return req.status === 'Ожидается';
    }

    function onDragStart(e, sourceElectiveId, index) {
      draggedIndex[sourceElectiveId] = index;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    }

    function onDragEnter(e, sourceElectiveId, index) {
      dragOverIndex[sourceElectiveId] = index;
    }

    function onDragLeave(e, sourceElectiveId, index) {
      if (dragOverIndex[sourceElectiveId] === index) {
        dragOverIndex[sourceElectiveId] = null;
      }
    }

    function onDragOver(e, sourceElectiveId, index) {
      e.preventDefault();
      dragOverIndex[sourceElectiveId] = index;
    }

    // SWAP
    function onDrop(e, sourceElectiveId, dropIndex) {
      const fromIndex = draggedIndex[sourceElectiveId];
      if (fromIndex == null || dropIndex == null) return;
      const group = groupsData[sourceElectiveId];
      if (!group) return;

      const arr = group.requests;
      // Не даём SWAP с «Отклонено»
      if (
          arr[fromIndex].status === 'Отклонено' ||
          arr[dropIndex].status === 'Отклонено'
      ) {
        return;
      }
      // Меняем местами
      if (fromIndex !== dropIndex) {
        const tmp = arr[fromIndex];
        arr[fromIndex] = arr[dropIndex];
        arr[dropIndex] = tmp;
        // Пересчитываем приоритет
        updatePriorities(sourceElectiveId);
        // Снова сортируем отклонённые в конец
        arr.sort((a, b) => {
          if (a.status === 'Отклонено' && b.status !== 'Отклонено') return 1;
          if (b.status === 'Отклонено' && a.status !== 'Отклонено') return -1;
          return (a.priority || 0) - (b.priority || 0);
        });
      }
      draggedIndex[sourceElectiveId] = null;
      dragOverIndex[sourceElectiveId] = null;
    }

    function onDragEnd(e, sourceElectiveId) {
      draggedIndex[sourceElectiveId] = null;
      dragOverIndex[sourceElectiveId] = null;
    }

    // Обновляем приоритет на сервере
    function updatePriorities(sourceElectiveId) {
      const group = groupsData[sourceElectiveId];
      if (!group) return;
      group.requests.forEach((r, idx) => {
        r.priority = idx + 1;
      });
      const updatedPriorities = group.requests.map((r) => ({
        id: r.id,
        priority: r.priority,
      }));
      axiosInstance
          .post('/requests/reorder', {
            sourceElectiveId,
            items: updatedPriorities,
          })
          .then(() =>
              console.log(`Приоритеты обновлены для электив ID=${sourceElectiveId}`)
          )
          .catch((err) => console.error('Ошибка при reorder', err));
    }

    // Когда дочерний RequestCard сэмитил `request-canceled`
    // Удаляем заявку из userRequests, затем пересобираем groupsData
    function onRequestCanceled(id) {
      // Убираем заявку из userRequests
      userRequests.value = userRequests.value.filter((r) => r.id !== id);
      // Пересобираем
      buildGroups();
    }

    return {
      userRequests,
      loadingRequests,
      requestsError,
      groupsData,
      draggedIndex,
      dragOverIndex,

      isDraggable,
      onDragStart,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
      onDragEnd,
      updatePriorities,

      onRequestCanceled,
    };
  },
};
</script>

<style scoped>
.requests-container {
  font-family: 'Montserrat', sans-serif;
  margin: 0 auto;
  box-sizing: border-box;
}

.main-request-card {
  border: none;
  background: transparent !important; /* Прозрачный фон */
  box-shadow: none !important; /* Убираем тень */
}

.header-section {
  margin: 0 auto;
}

.requests-title {
  font-weight: 600;
  font-size: 1.5rem;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-section {
  margin-bottom: 24px;
  padding: 16px;
  background: transparent; /* Прозрачный фон */
  box-shadow: none !important; /* Убираем тень */
}

.group-header {
  padding: 8px 0;
  margin-bottom: 16px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1); /* Полупрозрачная граница */
}

.source-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.request-card-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  overflow: hidden;
  background: transparent !important; /* Прозрачный фон */
}

.request-card-wrapper:hover {
  transform: translateY(-2px);
}

.drop-target {
  outline: 2px dashed #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}

.rejected {
  opacity: 0.7;
  filter: grayscale(0.8);
}

.no-requests-text {
  padding: 32px;
  text-align: center;
  color: #757575;
  font-size: 1.1rem;
}

.interactive-area {
  background-color: #e4e4e4; /* Светло-серый фон */
  border-radius: 8px; /* Скругленные углы */
  padding: 16px; /* Внутренний отступ */
  margin-top: 8px; /* Отступ сверху */
}

/* Стиль для подсказки "Меняйте приоритет..." */
.drag-hint {
  font-size: 14px; /* Размер шрифта */
  color: #9e9e9e; /* Серый цвет текста */
  text-align: center; /* Выравнивание по центру */
  margin-bottom: 8px; /* Отступ снизу */
}

/* Адаптация для мобильных */
@media (max-width: 600px) {
  .requests-container {
    padding: 10px;
  }

  .header-section {
    padding: 12px 0;
  }

  .requests-title {
    font-size: 1.3rem;
  }
}
</style>