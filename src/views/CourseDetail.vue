<template>
  <v-container fluid class="course-detail-container">
    <v-row align="start">
      <!-- Основной контент -->
      <v-col cols="12" md="8">
        <v-card class="pa-6 custom-shadow">
          <!-- Название курса и кластер -->
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
          <v-btn color="primary" class="mt-4" @click="$router.back()">Назад</v-btn>
        </v-card>
      </v-col>

      <!-- Боковая панель с группами -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 custom-shadow">
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
            <v-alert type="error">{{ error }}</v-alert>
          </div>
        </v-card>
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

    // Состояние курса
    const course = ref({
      name: 'Загрузка...',
      cluster: '',
      description: '',
    });

    // Логика для генерации цветов
    const clusterColor = computed(() => generateColorFromString(course.value.cluster));
    const textColor = computed(() => darkenColor(clusterColor.value, 50));

    // Логика для получения групп
    const groups = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Состояния раскрытия групп
    const expandedGroups = ref({});

    // Функция для переключения раскрытия группы
    const toggleGroup = (groupId) => {
      expandedGroups.value[groupId] = !expandedGroups.value[groupId];
    };

    // Функция для получения курса
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}`);
        course.value = response.data;
      } catch (err) {
        console.error(err);
        course.value = {
          name: 'Курс не найден',
          cluster: '',
          description: 'Извините, подробности этого курса недоступны.',
        };
      }
    };

    // Функция для получения групп курса
    const fetchGroups = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`/api/courses/${courseId}/groups`);
        groups.value = response.data;
      } catch (err) {
        console.error(err);
        error.value = 'Не удалось загрузить данные о группах.';
      } finally {
        loading.value = false;
      }
    };

    // Загрузка данных при монтировании компонента
    onMounted(() => {
      fetchCourse();
      fetchGroups();
    });

    return {
      course,
      clusterColor,
      textColor,
      groups,
      loading,
      error,
      toggleGroup,
      expandedGroups,
    };
  },
};
</script>

<style scoped>
.course-detail-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px;
  margin: 0 auto;
  max-width: 1200px; /* Увеличил максимальную ширину для размещения боковой панели */
  box-sizing: border-box;
}

.course-title {
  font-weight: 600;
  margin-bottom: 10px;
  overflow-wrap: break-word; /* Обеспечивает перенос по словам */
  word-wrap: break-word; /* Для поддержки более старых браузеров */
  white-space: normal; /* Ensures text wraps normally */
  hyphens: auto; /* Allows hyphenation */
}

.course-cluster {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  overflow-wrap: break-word; /* Обеспечивает перенос по словам */
  word-wrap: break-word; /* Для поддержки более старых браузеров */
  white-space: normal; /* Ensures text wraps normally */
  hyphens: auto; /* Allows hyphenation */
}

.custom-shadow {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0; /* Добавлена рамка */
  border-radius: 12px; /* Добавлены скругленные углы */
}

/* Дополнительные стили для улучшения внешнего вида */
.v-chip {
  font-size: 0.8rem;
}

.student-list {
  padding: 0 16px 16px 16px;
}

.v-card-title .v-btn {
  padding: 0;
}

/* Классы для цветового выделения заполненности уже перенесены в подкомпонент */
</style>