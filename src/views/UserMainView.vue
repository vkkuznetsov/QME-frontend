<template>
  <div>
    <h2 class="section-title">Все элективные курсы</h2>
    <v-card class="filters-card pa-4 my-4">
      <v-row class="d-flex align-center justify-center flex-wrap">
        <v-col cols="12" sm="6" md="4" class="d-flex justify-center">
          <v-text-field
              v-model="searchQuery"
              label="Поиск по названию или описанию"
              outlined
              dense
              clearable
          ></v-text-field>
        </v-col>

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

    <div class="pagination">
      <v-pagination
          v-model="currentPage"
          :length="totalPages"
          total-visible="7"
          @input="changePage"
          color="primary"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CourseCard from '@/components/CourseCard.vue';

export default {
  name: 'AllElectivesComponent',
  components: {
    CourseCard,
  },
  setup() {
    const API_URL = process.env.VUE_APP_API_URL;
    const courses = ref([]);
    const searchQuery = ref('');
    const selectedCluster = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(12);

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/all_elective`);
        courses.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
      }
    };

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

    const changePage = (page) => {
      if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const resetFilters = () => {
      searchQuery.value = '';
      selectedCluster.value = null;
      currentPage.value = 1;
    };

    onMounted(fetchCourses);

    return {
      courses,
      searchQuery,
      selectedCluster,
      currentPage,
      itemsPerPage,
      allClusterItems,
      filteredCourses,
      paginatedCourses,
      totalPages,
      changePage,
      resetFilters,
    };
  },
};
</script>

<style scoped>
.section-title {
  text-align: center;
  font-weight: 600;
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

@media (max-width: 600px) {
  .section-title {
    font-size: 1.1rem;
  }
}
</style>