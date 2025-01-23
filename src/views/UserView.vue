<template>
  <v-container fluid class="home-container">
    <!-- Дашборд -->
    <v-card class="pa-4 mb-6 dashboard-card">
      <h1 class="dashboard-title">Добро пожаловать!</h1>

      <div v-if="loadingUser || loadingRequests" class="text-center my-4">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else class="dashboard-stats">
        <p><strong>Ваше имя:</strong> {{ user.name }}</p>
        <p><strong>Количество заявок на перезапись:</strong> {{ userRequests.length }}</p>

        <!-- Небольшая визуализация заявок по статусам -->
        <div class="requests-visual">
          <v-row align="center" justify="space-around">
            <!-- Пример бар-чарта со статусами (если v-sparkline доступен) -->
            <v-col cols="12" sm="6">
              <h3 class="chart-title">Статистика по заявкам (статусы)</h3>
              <v-sparkline
                :value="requestsBarData"
                type="bar"
                height="60"
                :color="requestsBarColors"
              ></v-sparkline>
              <!-- Легенда -->
              <div class="legend mt-2">
                <span v-for="(label, index) in statusLabels" :key="index" class="legend-item">
                  <v-avatar size="14" class="mr-1" :color="requestsBarColors[index]"></v-avatar>
                  {{ label }} ({{ requestsBarData[index] }})
                </span>
              </div>
            </v-col>

            <!-- Пример простых прогресс-баров (процент одобренных / отклонённых заявок) -->
            <v-col cols="12" sm="6">
              <h3 class="chart-title">Процентное соотношение</h3>
              <p class="mb-1"><strong>Одобрено: {{ approvedPercent }}%</strong></p>
              <v-progress-linear
                :value="approvedPercent"
                height="10"
                color="green"
                stream
                rounded
              ></v-progress-linear>

              <p class="mt-4 mb-1"><strong>Отклонено: {{ rejectedPercent }}%</strong></p>
              <v-progress-linear
                :value="rejectedPercent"
                height="10"
                color="red"
                stream
                rounded
              ></v-progress-linear>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-card>

    <!-- Все курсы -->
    <h2 class="section-title">Все элективные курсы</h2>
    <v-card class="filters-card pa-4 my-4">
      <v-row class="d-flex align-center justify-center flex-wrap">
        <!-- Поиск -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-text-field
            v-model="searchQuery"
            label="Поиск по названию или описанию"
            outlined
            dense
            clearable
            style="height: 56px;"
          ></v-text-field>
        </v-col>
        <!-- Фильтр по кластеру -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-select
            v-model="selectedCluster"
            :items="allClusterItems"
            label="Фильтр по кластеру"
            outlined
            dense
            clearable
            style="height: 56px;"
          ></v-select>
        </v-col>
        <!-- Сброс фильтров -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-btn
            color="primary"
            @click="resetFilters"
            style="width: auto; min-width: 150px; margin-left: -150px;"
            dense
          >
            Сбросить фильтры
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Вывод списка курсов -->
    <v-row>
      <v-col
        v-for="course in paginatedCourses"
        :key="course.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <CourseCard :course="course" />
      </v-col>
    </v-row>

    <!-- Пагинация -->
    <div class="pagination">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        total-visible="7"
        @input="changePage"
        color="primary"
      ></v-pagination>
      <span class="page-info">Страница {{ currentPage }} из {{ totalPages }}</span>
    </div>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import coursesData from './data/courses_clusters.json';
import CourseCard from '@/components/CourseCard.vue';

export default {
  name: 'UserView',
  components: {
    CourseCard,
  },
  setup() {
    // --- Курсы и фильтры ---
    const courses = ref(coursesData);
    const searchQuery = ref('');
    const selectedCluster = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(8);

    // --- Дашборд: пользователь и заявки ---
    const user = ref({});
    const userRequests = ref([]);
    const loadingUser = ref(true);
    const loadingRequests = ref(true);

    const userEmail = localStorage.getItem('userEmail') || 'stud0000257868@study.utmn.ru';

    async function fetchUserProfile() {
      try {
        const response = await axios.get('/api/users', {
          params: { email: userEmail },
        });
        user.value = response.data;
      } catch (e) {
        console.error('Ошибка при загрузке пользователя', e);
      } finally {
        loadingUser.value = false;
      }
    }

    async function fetchUserRequests() {
      try {
        // ждем, пока user загружен
        const response = await axios.get('/api/requests', {
          params: { userId: user.value.id },
        });
        userRequests.value = response.data;
      } catch (e) {
        console.error('Ошибка при загрузке заявок', e);
      } finally {
        loadingRequests.value = false;
      }
    }

    onMounted(async () => {
      await fetchUserProfile();
      await fetchUserRequests();
    });

    // --- Фильтрация курсов ---
    const allClusterItems = computed(() => {
      return Array.from(new Set(courses.value.map((course) => course.cluster)));
    });

    const filteredCourses = computed(() => {
      return courses.value.filter((course) => {
        const matchesSearch =
          !searchQuery.value ||
          (course.name + ' ' + (course.description || ''))
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase());
        const matchesCluster =
          !selectedCluster.value || course.cluster === selectedCluster.value;
        return matchesSearch && matchesCluster;
      });
    });

    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredCourses.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredCourses.value.length / itemsPerPage.value);
    });

    function changePage(page) {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function resetFilters() {
      searchQuery.value = '';
      selectedCluster.value = null;
      currentPage.value = 1;
    }

    // --- Визуализация заявок ---
    // Предположим, что у заявок поле "status" может быть: "Ожидается", "Одобрено", "Отклонено" и т. д.
    // Сформируем три основные категории
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

    // Для sparkline (бар-чарт), нужен массив из чисел
    const requestsBarData = computed(() => {
      return statusLabels.map((status) => requestsByStatus.value[status] || 0);
    });

    // Цвета для каждого столбика
    const requestsBarColors = computed(() => {
      // Например: Ожидается (желтый), Одобрено (зеленый), Отклонено (красный)
      return ['#FFC107', '#4CAF50', '#F44336'];
    });

    // Процент одобренных / отклонённых
    const totalRequestsCount = computed(() => userRequests.value.length);
    const approvedPercent = computed(() => {
      if (totalRequestsCount.value === 0) return 0;
      return Math.round((requestsByStatus.value['Одобрено'] / totalRequestsCount.value) * 100);
    });
    const rejectedPercent = computed(() => {
      if (totalRequestsCount.value === 0) return 0;
      return Math.round((requestsByStatus.value['Отклонено'] / totalRequestsCount.value) * 100);
    });

    return {
      searchQuery,
      selectedCluster,
      courses,
      currentPage,
      itemsPerPage,
      filteredCourses,
      paginatedCourses,
      totalPages,
      allClusterItems,
      changePage,
      resetFilters,

      // Дашборд
      user,
      userRequests,
      loadingUser,
      loadingRequests,

      // Визуализация заявок
      statusLabels,
      requestsByStatus,
      requestsBarData,
      requestsBarColors,
      approvedPercent,
      rejectedPercent,
    };
  },
};
</script>

<style scoped>
.home-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px;
  margin: 0 auto;
  max-width: 1200px;
  box-sizing: border-box;
}

.dashboard-card {
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.dashboard-stats p {
  margin: 4px 0;
}

.requests-visual {
  margin-top: 20px;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

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

.section-title {
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  letter-spacing: 0.5px;
  font-size: 20px;
}

.filters-card {
  border-radius: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.page-info {
  font-weight: 500;
}
</style>