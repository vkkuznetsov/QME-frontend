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
            <h2>Описание курса</h2>
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
              <v-list-item
                v-for="group in groups"
                :key="group.id"
                class="group-item"
              >
                <v-card outlined class="w-100">
                  <v-card-title class="d-flex justify-space-between align-center">
                    <span class="font-weight-bold">{{ group.name }}</span>
                    <v-chip :color="getGroupTypeColor(group.type)" small>
                      {{ group.type }}
                    </v-chip>
                  </v-card-title>
                  <v-card-subtitle>
                    Вместимость: {{ group.capacity }}
                  </v-card-subtitle>
                  <v-card-text>
                    <div class="student-list">
                      <strong>Студенты:</strong>
                      <v-list dense>
                        <v-list-item
                          v-for="student in group.students"
                          :key="student.id"
                        >
                          <v-list-item-content>
                            <v-list-item-title>{{ student.name }}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item v-if="group.students.length === 0">
                          <v-list-item-content>
                            <v-list-item-title>Нет записанных студентов</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </div>
                  </v-card-text>
                </v-card>
              </v-list-item>
            </v-list>
  
            <!-- Состояние загрузки или сообщение об ошибке -->
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
  import coursesData from '@/views/data/courses_clusters.json'; // Убедитесь, что путь корректен
  
  export default {
    name: 'CourseDetail',
    setup() {
      const route = useRoute();
      const courseId = route.params.id;
  
      // Найдите курс по ID
      const course = computed(() => {
        return (
          coursesData.find((c) => c.id === parseInt(courseId)) || {
            name: 'Курс не найден',
            cluster: '',
            description: 'Извините, подробности этого курса недоступны.',
          }
        );
      });
  
      // Функции для генерации цветов аналогично CourseCard.vue
      function generateColorFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 60%, 90%)`;
      }
  
      function darkenColor(color, amount = 50) {
        const tempElem = document.createElement('div');
        tempElem.style.color = color;
        document.body.appendChild(tempElem);
        const rgb = getComputedStyle(tempElem).color;
        document.body.removeChild(tempElem);
        const rgbValues = rgb.match(/\d+/g).map(Number);
        let [r, g, b] = rgbValues;
        r = Math.max(0, r - Math.round(255 * (amount / 100)));
        g = Math.max(0, g - Math.round(255 * (amount / 100)));
        b = Math.max(0, b - Math.round(255 * (amount / 100)));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)
          .toUpperCase()}`;
      }
  
      const clusterColor = computed(() => generateColorFromString(course.value.cluster));
      const textColor = computed(() => darkenColor(clusterColor.value, 50));
  
      // Логика для получения групп
      const groups = ref([]);
      const loading = ref(false);
      const error = ref(null);
  
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
  
      // Определение цвета для типа группы
      const getGroupTypeColor = (type) => {
        switch (type.toLowerCase()) {
          case 'лекция':
            return 'green';
          case 'практика':
            return 'blue';
          case 'лабораторная':
            return 'orange';
          default:
            return 'grey';
        }
      };
  
      onMounted(() => {
        fetchGroups();
      });
  
      return {
        course,
        clusterColor,
        textColor,
        groups,
        loading,
        error,
        getGroupTypeColor,
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
    font-weight: 700;
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
  
  .group-item {
    margin-bottom: 16px;
  }
  
  .student-list {
    margin-top: 10px;
  }
  
  .custom-shadow {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0; /* Добавлена рамка */
    border-radius: 12px; /* Добавлены скругленные углы */
  }
  </style>