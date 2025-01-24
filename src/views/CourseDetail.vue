<template>
  <v-container fluid class="course-detail-container">
    <v-row align="start">
      <!-- Основной контент -->
      <v-col cols="12" md="8">
        <v-card class="pa-6 custom-shadow">
          <h1 class="course-title">{{ course.name }}</h1>
          <span
            class="course-cluster"
            :style="{ backgroundColor: clusterColor, color: textColor }"
          >
            {{ course.cluster }}
          </span>

          <v-divider class="my-4"></v-divider>

          <!-- Описание курса -->
          <h2 style="font-weight: 600;">Описание курса</h2>
          <p>{{ course.description }}</p>

          <!-- Кнопка "Назад" -->
          <v-btn 
            color="primary" 
            variant="outlined" 
            class="mt-4"
            @click="$router.back()"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Назад
          </v-btn>
        </v-card>
      </v-col>

      <!-- Боковая панель -->
      <v-col cols="12" md="4">
        <!-- Карточка с группами -->
        <v-card class="pa-4 custom-shadow mb-4">
          <h2 class="group-title">Группы курса</h2>
          <v-divider class="my-2"></v-divider>

          <v-list>
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
        <v-card v-if="currentUser" class="pa-4 custom-shadow">
          <h2 class="section-title mb-4">Перезапись на курс</h2>

          <!-- Выбор исходного курса -->
          <v-select
            v-model="selectedSourceCourse"
            :items="sourceCourses"
            item-title="name"
            item-value="id"
            label="Курс для замены"
            variant="outlined"
            color="primary"
            :loading="loadingUser"
            :error-messages="sourceCourseError"
            class="mb-4"
            prepend-icon="mdi-book-remove"
          ></v-select>

          <!-- Выбор групп по типам -->
          <div v-for="(typeGroups, type) in groupedGroups" :key="type" class="mb-4">
            <h3 class="text-subtitle-1 font-weight-medium mb-2">Выберите {{ type }}:</h3>
            <v-radio-group v-model="selectedGroups[type]" color="primary">
              <v-radio
                v-for="group in typeGroups"
                :key="group.id"
                :value="group.id"
                class="mb-2"
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
            color="primary" 
            size="large" 
            :loading="submitting"
            :disabled="!canSubmit"
            block
            @click="submitRequest"
          >
            <v-icon start>mdi-send-check</v-icon>
            Подать заявку
          </v-btn>
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
  </v-container>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import GroupItem from '@/components/GroupItem.vue';
import { generateColorFromString, darkenColor } from '@/utils/colorUtils';

export default {
  name: 'CourseDetail',
  components: {
    GroupItem,
  },
  setup() {
    const route = useRoute();
    const courseId = route.params.id;

    // Состояния
    const course = ref({ name: '', cluster: '', description: '' });
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

    const expandedGroups = ref({});
    
    // Вычисляемые свойства
    const clusterColor = computed(() =>
      generateColorFromString(course.value.cluster || '')
    );
    
    const textColor = computed(() =>
      darkenColor(clusterColor.value, 50)
    );
    
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
        const response = await axios.get(`/api/courses/${courseId}`);
        course.value = response.data;
      } catch (err) {
        console.error(err);
        course.value = { name: 'Ошибка загрузки', description: '' };
      }
    }

    async function fetchGroups() {
      loading.value = true;
      try {
        const response = await axios.get(`/api/courses/${courseId}/groups`);
        groups.value = response.data;
      } catch (err) {
        error.value = 'Ошибка загрузки групп';
      } finally {
        loading.value = false;
      }
    }

    async function fetchCurrentUser() {
      loadingUser.value = true;
      try {
        // В реальном приложении email должен браться из системы аутентификации
        const email = 'stud0000257868@study.utmn.ru'; // Пример из моков
        const response = await axios.get('/api/users', { params: { email } });
        currentUser.value = response.data;
        await fetchSourceCourses();
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
        const sourceCourse = sourceCourses.value.find(c => c.id === selectedSourceCourse.value);
        const selectedGroupIds = Object.values(selectedGroups.value);
        const selectedGroupsData = groups.value.filter(g => selectedGroupIds.includes(g.id));

        await axios.post('/api/requests', {
          userId: currentUser.value.id,
          electiveId: courseId,
          sourceElectiveId: selectedSourceCourse.value,
          sourceElectiveName: sourceCourse?.name || '',
          selectedGroups: selectedGroupsData.map(g => ({
            id: g.id,
            type: g.type,
            name: g.name
          }))
        });

        // Сброс формы
        selectedSourceCourse.value = null;
        selectedGroups.value = {};
        alert('Заявка успешно подана!');
      } catch (err) {
        submitError.value = 'Ошибка подачи заявки: ' + (err.response?.data?.message || err.message);
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

    return {
      course,
      groups,
      loading,
      error,
      expandedGroups,
      toggleGroup,
      clusterColor,
      textColor,
      currentUser,
      sourceCourses,
      selectedSourceCourse,
      selectedGroups,
      loadingUser,
      userError,
      submitting,
      submitError,
      groupedGroups,
      canSubmit,
      submitRequest
    };
  }
};
</script>

<style scoped>
.course-detail-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px !important;
}

.course-title {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
}

.course-cluster {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
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
  
  .course-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}
</style>