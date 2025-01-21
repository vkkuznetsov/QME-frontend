<template>
  <v-container fluid class="recommend-container">
    <h1 class="page-title">Мои рекомендации</h1>

    <!-- Сообщение, если нет рекомендаций -->
    <div v-if="recommendedClusters.length === 0" class="no-recommendations">
      <p>Нет рекомендаций. Пройдите тестирование.</p>
      <v-btn color="primary" :to="{ path: '/profile' }">Пройти тест</v-btn>
    </div>

    <!-- Рекомендации, сгруппированные по кластеру -->
    <div v-else>
      <div
        v-for="(courses, clusterName) in recommendedByCluster"
        :key="clusterName"
        class="cluster-section"
      >
        <h2 class="cluster-title">{{ clusterName }}</h2>
        <v-row>
          <v-col
            v-for="course in courses"
            :key="course.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <!-- Использование компонента CourseCard -->
            <CourseCard :course="course" />
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Все курсы -->
    <h2 class="section-title mt-10">Все элективные курсы</h2>
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

    <!-- Элективные курсы с пагинацией -->
    <v-row>
      <v-col
        v-for="course in paginatedCourses"
        :key="course.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <!-- Использование компонента CourseCard -->
        <CourseCard :course="course" />
      </v-col>
    </v-row>

    <!-- Новая Пагинация с Vuetify -->
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
import { ref, computed, watch } from 'vue';
import coursesData from './data/courses_clusters.json';
import CourseCard from '@/components/CourseCard.vue'; // Импорт нового компонента

export default {
  name: 'UserView',
  components: {
    CourseCard, // Регистрация компонента
  },
  setup() {
    const recommendedClusters = ref([]);
    const searchQuery = ref('');
    const selectedCluster = ref(null);
    const courses = ref(coursesData);

    const currentPage = ref(1);
    const itemsPerPage = ref(8);

    const allClusterItems = computed(() => {
      return Array.from(new Set(courses.value.map(course => course.cluster)));
    });

    const filteredCourses = computed(() => {
      return courses.value.filter(course => {
        const matchesSearch =
          !searchQuery.value ||
          (course.name + ' ' + (course.description || '')).toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCluster = !selectedCluster.value || course.cluster === selectedCluster.value;
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

    const recommendedByCluster = computed(() => {
      const groups = {};
      courses.value.forEach(course => {
        if (recommendedClusters.value.includes(course.cluster)) {
          if (!groups[course.cluster]) {
            groups[course.cluster] = [];
          }
          if (groups[course.cluster].length < 5) {
            groups[course.cluster].push(course);
          }
        }
      });
      return groups;
    });

    function changePage(page) {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        // Прокрутка к началу списка курсов при смене страницы
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }

    function resetFilters() {
      searchQuery.value = '';
      selectedCluster.value = null;
    }

    const savedClusters = JSON.parse(localStorage.getItem('recommendedClusters') || '[]');
    if (Array.isArray(savedClusters)) {
      recommendedClusters.value = savedClusters;
    }

    // Наблюдатели для сброса пагинации
    watch([searchQuery, selectedCluster], () => {
      currentPage.value = 1; // Сбрасываем на первую страницу
    });

    return {
      recommendedClusters,
      searchQuery,
      selectedCluster,
      courses,
      currentPage,
      itemsPerPage,
      allClusterItems,
      filteredCourses,
      paginatedCourses,
      totalPages,
      recommendedByCluster,
      resetFilters,
      changePage,
    };
  },
};
</script>

<style scoped>
.recommend-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px; /* Внутренние отступы сверху и по бокам */
  margin: 0 auto; /* Центровка */
  max-width: 1200px; /* Ограничение ширины страницы */
  box-sizing: border-box; /* Учет отступов в ширине */
}

.page-title {
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.no-recommendations {
  text-align: center;
  font-weight: 300;
}

.section-title {
  font-weight: 600;
  margin-top: 40px;
  letter-spacing: 0.5px;
  font-size: 20px;
  text-align: center;
}

.cluster-section {
  margin-top: 40px;
}

.cluster-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 20px;
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