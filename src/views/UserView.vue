<template>
  <v-container fluid class="home-container">
    <!-- Блок рекомендаций -->
    <div v-if="!loadingUser" class="mb-8">
      <h2 class="section-title mb-4">Студенты вашего направления "{{ user.sp_code }}" чаще всего выбирают:</h2>

      <div v-if="loadingRecommendations" class="text-center my-4">
        <v-progress-circular indeterminate color="primary"/>
      </div>

      <v-row v-else-if="recommendations.length > 0" class="cluster-list">
        <v-col
            v-for="cluster in recommendations"
            :key="cluster.name"
            cols="12"
            class="cluster-item"
        >
          <v-card class="pa-4" flat style="box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
            <div class="d-flex align-center mb-4">
              <h3
                  class="cluster-title"
                  :style="{ color: generateClusterColor(cluster.name) }"
              >
                {{ cluster.name }}
                <span class="cluster-percent text-medium-emphasis">
                  (выбрали {{ cluster.percent }}% студентов)
                </span>
              </h3>
            </div>

            <v-row class="courses-list">
              <v-col
                  v-for="course in cluster.topCourses"
                  :key="course.id"
                  cols="12"
                  sm="6"
                  md="4"
              >
                <CourseCard
                    :course="{
                  id: course.id,
                  name: course.name,
                  cluster: cluster.name,
                  description: course.description
                }"
                    :additional-text="`${course.student_count} студентов`"
                    variant="outlined"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <v-alert
          v-else
          type="info"
          variant="tonal"
          class="mt-4"
      >
        Нет данных для отображения рекомендаций
      </v-alert>
    </div>

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
          ></v-select>
        </v-col>

        <!-- Сброс фильтров -->
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-btn
              color="primary"
              @click="resetFilters"
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
        <CourseCard :course="course"/>
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
    </div>
  </v-container>
</template>

<script>
import {ref, computed, onMounted} from 'vue';
import axios from 'axios';
import CourseCard from '@/components/CourseCard.vue';
import {generateColorFromString, darkenColor} from '@/utils/colorUtils';

export default {
  name: 'UserView',
  components: {
    CourseCard,
  },
  setup() {
    const API_URL = process.env.VUE_APP_API_URL;

    // Состояния данных
    const courses = ref([]);
    const user = ref({});
    const recommendations = ref([]);

    // Состояния загрузки
    const loadingUser = ref(true);
    const loadingRecommendations = ref(false);

    // Состояния фильтров
    const searchQuery = ref('');
    const selectedCluster = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(12);

    // Загрузка данных пользователя
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
        const response = await axios.get(`${API_URL}/student_info`, {params: {email}});
        user.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        loadingUser.value = false;
      }
    };

    // Загрузка рекомендаций
    const fetchRecommendations = async (direction) => {
      loadingRecommendations.value = true;
      try {
        const response = await axios.get(`${API_URL}/recomendation/${encodeURIComponent(direction)}`);
        recommendations.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки рекомендаций:', error);
      } finally {
        loadingRecommendations.value = false;
      }
    };

    // Загрузка всех курсов
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/all_elective`);
        courses.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
      }
    };

    // Вычисляемые свойства
    const allClusterItems = computed(() => [
      ...new Set(courses.value.map(course => course.cluster).filter(Boolean))
    ]);

    const filteredCourses = computed(() => {
      return courses.value.filter(course => {
        const searchMatch = !searchQuery.value ||
            `${course.name} ${course.description || ''}`
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());

        const clusterMatch = !selectedCluster.value || course.cluster === selectedCluster.value;

        return searchMatch && clusterMatch;
      });
    });

    const paginatedCourses = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredCourses.value.slice(start, end);
    });

    const totalPages = computed(() =>
        Math.ceil(filteredCourses.value.length / itemsPerPage.value)
    );

    // Методы
    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    };

    const resetFilters = () => {
      searchQuery.value = '';
      selectedCluster.value = null;
      currentPage.value = 1;
    };

    const generateClusterColor = (clusterName) =>
        darkenColor(generateColorFromString(clusterName || ''), 30);

    // Инициализация
    onMounted(async () => {
      await fetchCourses();
      await fetchUserProfile();
      if (user.value?.sp_code) {
        await fetchRecommendations(user.value.sp_code);
      }
    });

    return {
      courses,
      user,
      recommendations,
      searchQuery,
      selectedCluster,
      currentPage,
      itemsPerPage,
      loadingUser,
      loadingRecommendations,
      allClusterItems,
      filteredCourses,
      paginatedCourses,
      totalPages,
      changePage,
      resetFilters,
      generateClusterColor
    };
  }
};
</script>


<style scoped>
.home-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px;
  margin: 0 auto;
  max-width: 1400px;
  box-sizing: border-box;
}

.recommendations-card {
  border-radius: 12px;
  background: #f8f9fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.cluster-card {
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.cluster-header {
  margin-bottom: 12px;
}

.cluster-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cluster-percent {
  font-size: 0.9rem;
  font-weight: 400;
}

.cluster-item:last-child {
  border-bottom: none;
}

.section-title {
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  letter-spacing: 0.5px;
  font-size: 20px;
  padding-bottom: 20px;
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
  padding: 16px 0;
}

.page-info {
  font-weight: 500;
  color: #666;
}

@media (max-width: 600px) {
  .cluster-title {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }
}
</style>