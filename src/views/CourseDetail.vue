<template>
  <v-container fluid class="course-detail-container">
    <v-row align="start">
      <!-- Основной контент -->
      <v-col cols="12" md="8">
        <v-card class="custom-shadow" style="padding: 2vh; border-radius: 12px;">
          <h1 class="course-title">{{ course.name }}</h1>
          <span
              class="course-cluster"
              :style="{ backgroundColor: clusterColor, color: textColor }"
          >
            {{ course.cluster }}
          </span>

          <v-divider class="my-4"></v-divider>

          <!-- Переключатель контента -->
          <v-btn-group>
            <v-btn
                style="font-weight: 700; letter-spacing: -0.5px;"
                :color="activeTab === 'description' ? 'primary' : undefined"
                @click="activeTab = 'description'"
                :ripple="false"
            >
              Описание
            </v-btn>
            <v-btn
                style="font-weight: 700; letter-spacing: -0.5px;"
                :color="activeTab === 'text' ? 'primary' : undefined"
                @click="activeTab = 'text'"
                :ripple="false"
            >
              Цели и компетенции
            </v-btn>
            <v-btn
                style="font-weight: 700; letter-spacing: -0.5px;"
                :color="activeTab === 'questions' ? 'primary' : undefined"
                @click="activeTab = 'questions'"
                :ripple="false"
            >
              Вопросы для аттестации
            </v-btn>
          </v-btn-group>

          <!-- Контент в зависимости от выбранной вкладки -->
          <div v-if="activeTab === 'description'">
            <!-- <h2 style="font-weight: 700; color: rgb(0, 0, 0, 0.7); margin: 2vh 0vh;">Описание курса</h2> -->
            <p class="description-text">{{ processedDescription }}</p>
          </div>

          <div v-else-if="activeTab === 'text'">
            <!-- <h2 style="font-weight: 700; color: rgb(0, 0, 0, 0.7); margin: 2vh 0vh;">Цели и компетенции</h2> -->
            <p class="description-text">{{ processedText }}</p>
          </div>

          <div v-else-if="activeTab === 'questions'">
            <!-- <h2 style="font-weight: 700; color: rgb(0, 0, 0, 0.7); margin: 2vh 0vh;">Вопросы для аттестации</h2> -->
            <p class="description-text">{{ processedQuestions }}</p>
          </div>

          <!-- Кнопка "Назад" -->
          <v-btn
              color="primary"
              class="mt-4"
              @click="$router.back()"
              :ripple="false"
              style="font-weight: 700; letter-spacing: -0.5px;"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Назад
          </v-btn>
        </v-card>
      </v-col>

      <!-- Боковая панель -->
      <v-col cols="12" md="4">
        <!-- Карточка с группами -->
        <v-card variant="flat" class="custom-shadow mb-4" style="padding: 2vh; border-radius: 12px;">
          <h2 class="group-title">Группы курса</h2>
          <v-divider class="my-4"></v-divider>
          <v-list class="compact-list">
            <GroupItem
                v-for="group in groups"
                :key="group.id"
                :group="group"
                :is-expanded="expandedGroups[group.id]"
                @toggle="toggleGroup"
            />
          </v-list>

          <div v-if="loading" class="text-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <div v-if="error" class="text-center my-4">
            <v-alert type="error" density="compact">{{ error }}</v-alert>
          </div>
        </v-card>

        <!-- Карточка перезаписи -->
        <v-card v-if="currentUser && canTransfer" class="custom-shadow" style="padding: 2vh; border-radius: 12px;">
          <h2 class="mb-4">Перезапись на курс</h2>
          <v-divider class="my-4"></v-divider>
          <!-- Выбор исходного курса -->
          <v-select
          style="  font-family: 'Montserrat', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.5px !important;
  color: rgba(0, 0, 0, 0.7) !important;"
              v-model="selectedSourceCourse"
              :items="sourceCourses"
              item-title="name"
              item-value="id"
              placeholder="Выберите исходный курс"
              variant="outlined"
              :loading="loadingUser"
              :error-messages="sourceCourseError"
              class="my-4"
              :ripples="false"
              prepend-icon="mdi-book-remove"
          ></v-select>

          <!-- Выбор групп по типам -->
          <div v-for="(typeGroups, type) in groupedGroups" :key="type" class="mb-2">
            <h3 class="mb-2" style="font-weight: 600;">Выберите {{ type }}:</h3>
            <v-radio-group v-model="selectedGroups[type]" color="primary">
              <v-radio
                  style="font-family: 'Montserrat', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.5px !important;
  color: rgba(0, 0, 0, 0.7) !important;"
                  v-for="group in typeGroups"
                  :key="group.id"
                  :value="group.id"
                  class="mb-1"
              >
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon small class="mr-2">mdi-account-group</v-icon>
                    <span>{{ group.name }}</span>
                    <v-spacer></v-spacer>
                    <span class="text-caption text-medium-emphasis">
                      ({{ group.capacity - group.students.length }} мест)
                    </span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>

          <!-- Сообщения об ошибках и кнопка -->
          <v-alert
              v-if="submitError"
              type="error"
              density="compact"
              variant="tonal"
              class="mb-4"
          >
            {{ submitError }}
          </v-alert>

          <v-btn
              style="font-family: 'Montserrat', sans-serif !important;
  font-weight: 700 !important;
  letter-spacing: -0.5px !important;"
              color="primary"
              size="large"
              :loading="submitting"
              :disabled="!canSubmit"
              block
              @click="submitRequest"
              :ripple="false"
          >
            <v-icon start>mdi-send-check</v-icon>
            Подать заявку
          </v-btn>
        </v-card>

        <!-- Сообщение о невозможности перезаписи -->
        <v-card v-else-if="currentUser && !canTransfer" class="custom-shadow" style="padding: 2vh; border-radius: 12px;">
          <v-alert type="warning" density="compact" class="mb-0">
            {{ transferError }}
          </v-alert>
        </v-card>

        <!-- Сообщение о авторизации -->
        <div v-else class="text-center my-4">
          <v-progress-circular
              v-if="loadingUser"
              indeterminate
              color="primary"
          ></v-progress-circular>
          <v-alert v-else type="info" density="compact">
            Для перезаписи требуется авторизация
          </v-alert>
        </div>
      </v-col>
    </v-row>
    <v-snackbar
        v-model="snackbar"
        color="success"
        timeout="4000"
        :ripple="false"
        style="text-align: center; font-weight: 600; font-family: 'Montserrat', sans-serif !important;"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import {computed, ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import axiosInstance from '@/axios/axios';
import GroupItem from '@/components/GroupItem.vue';
import {generateColorFromString, darkenColor} from '@/utils/colorUtils';

const route = useRoute();
const courseId = route.params.id;

// Состояния
const course = ref({
  name: '',
  cluster: '',
  description: '',
  text: '',
  questions: ''
});
const activeTab = ref('description');
const groups = ref([]);
const loading = ref(false);
const error = ref(null);

// Состояния для перезаписи
const currentUser = ref(null);
const sourceCourses = ref([]);
const selectedSourceCourse = ref(null);
const selectedGroups = ref({});
const loadingUser = ref(false);
const userError = ref(null);
const submitting = ref(false);
const submitError = ref(null);
const snackbar = ref(false);
const snackbarMessage = ref(null);
const canTransfer = ref(true);
const transferError = ref(null);

const expandedGroups = ref({});

// Вычисляемые свойства
const clusterColor = computed(() => {
  if (course.value.cluster === 'Без области знаний') {
    return '#E0E0E0';
  }
  return generateColorFromString(course.value.cluster || '');
});

const textColor = computed(() => {
  if (course.value.cluster === 'Без области знаний') {
    return '#666666';
  }
  return darkenColor(clusterColor.value, 50);
});

// Удаляем лишние пустые строки и добавляем табуляцию в начале каждого абзаца
function sanitizeText(text) {
  if (!text) return '';
  const indent = '\u00A0\u00A0\u00A0\u00A0'; // визуальная табуляция (4&nbsp;)
  return text
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .map(line => indent + line.trim())
    .join('\n\n'); // сохраняем один пустой рядок между абзацами
}

const processedDescription = computed(() => sanitizeText(course.value.description));
const processedText = computed(() => sanitizeText(course.value.text));
const processedQuestions = computed(() => sanitizeText(course.value.questions));

const groupedGroups = computed(() => {
  const grouped = {};
  groups.value.forEach(group => {
    const type = group.type.toLowerCase();
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(group);
  });
  return grouped;
});

const canSubmit = computed(() => {
  return selectedSourceCourse.value &&
      Object.keys(groupedGroups.value).every(type => selectedGroups.value[type]);
});

// Методы
const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

// Запросы данных
async function fetchCourse() {
  try {
    const response = await axiosInstance.get(`/elective/${courseId}`);
    course.value = response.data;
  } catch (err) {
    console.error(err);
    course.value = {name: 'Ошибка загрузки', description: ''};
  }
}

async function fetchGroups() {
  loading.value = true;
  try {
    const response = await axiosInstance.get(`/elective/${courseId}/groups`);
    groups.value = response.data;
  } catch (err) {
    error.value = 'Ошибка загрузки групп';
  } finally {
    loading.value = false;
  }
}

async function checkCanTransfer() {
  if (!currentUser.value) return;
  
  try {
    const response = await axiosInstance.get(`/students/${currentUser.value.id}/electives/${courseId}/can-transfer`);
    canTransfer.value = response.data.can_transfer;
    if (!canTransfer.value) {
      transferError.value = response.data.message;
    }
  } catch (err) {
    console.error('Ошибка проверки возможности перезаписи:', err);
    canTransfer.value = false;
    transferError.value = 'Ошибка проверки возможности перезаписи';
  }
}

async function fetchCurrentUser() {
  loadingUser.value = true;
  try {
    const email = localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
    const response = await axiosInstance.get(`/student_info`, {params: {email}});
    currentUser.value = response.data;
    await fetchSourceCourses();
    await checkCanTransfer();
  } catch (err) {
    userError.value = 'Ошибка загрузки данных пользователя';
  } finally {
    loadingUser.value = false;
  }
}

async function fetchSourceCourses() {
  if (!currentUser.value) return;

  try {
    // Извлекаем элективы из групп пользователя
    const userElectives = currentUser.value.groups
        .map(g => g.elective)
        .filter(Boolean); // Фильтруем null/undefined

    // Получаем уникальные курсы
    const uniqueElectives = [];
    const seenIds = new Set();

    for (const elective of userElectives) {
      if (!seenIds.has(elective.id)) {
        seenIds.add(elective.id);
        uniqueElectives.push({
          id: elective.id,
          name: elective.name,
          cluster: elective.cluster
        });
      }
    }

    sourceCourses.value = uniqueElectives;

  } catch (err) {
    console.error('Ошибка обработки курсов:', err);
    sourceCourses.value = [];
  }
}

async function submitRequest() {
  submitError.value = null;
  if (!canSubmit.value) return;

  submitting.value = true;
  try {
    // Формируем массив групп, которые пользователь выбрал для «to»
    const groupIds = Object.values(selectedGroups.value).map(groupId => Number(groupId));

    const requestBody = {
      student_id: Number(currentUser.value.id),
      from_elective_id: Number(selectedSourceCourse.value),
      to_elective_id: Number(courseId),
      groups_to_ids: groupIds,
    };

    console.log('Отправка данных:', requestBody);

    await axiosInstance.post(`/transfer`, requestBody);
    
    // Уведомляем пользователя об успешной отправке заявки
    snackbarMessage.value = 'Заявка успешно отправлена';
    snackbar.value = true;
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Ошибка отправки данных';
  } finally {
    submitting.value = false;
  }
}

// Инициализация
onMounted(async () => {
  await fetchCourse();
  await fetchGroups();
  await fetchCurrentUser();
});
</script>

<style scoped>
.course-detail-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px !important;
  font-family: 'Montserrat', sans-serif !important;
  letter-spacing: -0.5px;
}

.course-title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2vh;
}

.course-cluster {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2vh;
}

.description-text {
  margin-top: 32px;
  padding-right: 5vh;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-align: left;
  white-space: pre-line;
  line-height: 1.6;
  letter-spacing: -0.5px;
}

.course-description {
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
}

.custom-shadow {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
}

@media (max-width: 960px) {
  .course-detail-container {
    padding: 24px 16px !important;
  }
}

@media (max-width: 600px) {
  .course-detail-container {
    padding: 16px 12px !important;
  }
}
.v-btn-group {
  display: flex;
  gap: 4px;
}

.v-btn-group .v-btn {
  flex: 1;
}
</style>