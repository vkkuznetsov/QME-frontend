<template>
  <v-container fluid class="home-container">
    <!-- Блок рекомендаций -->
    <div v-if="!loadingUser" class="mb-8">
      <h2 class="section-title mb-4">Студенты вашего направления "{{ user.direction }}" чаще всего выбирают:</h2>

      <div v-if="loadingStudents" class="text-center my-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <v-row v-else-if="recommendedClusters.length > 0" class="cluster-list">
        <v-col
          v-for="cluster in recommendedClusters"
          :key="cluster.name"
          cols="12"
          class="cluster-item"
        >
          <v-card class="pa-4" flat style="box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
            <div class="d-flex align-center mb-4">
              <h3 
                class="cluster-title"
                :style="{ color: cluster.color }"
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
                  ...course,
                  cluster: cluster.name
                }"
                :additional-text="`${course.studentCount} студентов`"
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
import { generateColorFromString, darkenColor} from '@/utils/colorUtils';
import CourseCard from '@/components/CourseCard.vue';

export default {
  name: 'UserView',
  components: {
    CourseCard,
  },
  setup() {
    // --- Состояния ---
    const courses = ref([]);
    const searchQuery = ref('');
    const selectedCluster = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(8);
    const user = ref({});
    const students = ref([]);
    const loadingUser = ref(true);
    const loadingStudents = ref(true);
    const userRequests = ref([]);
    const loadingRequests = ref(true);

    // --- Данные пользователя ---
    const userEmail = localStorage.getItem('userEmail') || 'stud0000257868@study.utmn.ru';

    // --- Методы загрузки данных ---
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/users', { params: { email: userEmail } });
        user.value = response.data;
      } catch (e) {
        console.error('Ошибка при загрузке пользователя', e);
      } finally {
        loadingUser.value = false;
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get('/api/students');
        students.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки студентов:', error);
      } finally {
        loadingStudents.value = false;
      }
    };

    const fetchUserRequests = async () => {
      try {
        const response = await axios.get('/api/requests', { params: { userId: user.value.id } });
        userRequests.value = response.data;
      } catch (e) {
        console.error('Ошибка при загрузке заявок', e);
      } finally {
        loadingRequests.value = false;
      }
    };

    // --- Вычисляемые свойства ---
    const allClusterItems = computed(() => {
      return [...new Set(courses.value.map(course => course.cluster))];
    });

    const filteredCourses = computed(() => {
      return courses.value.filter(course => {
        const matchesSearch = !searchQuery.value || 
          (course.name + ' ' + (course.description || ''))
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase());
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

    const recommendedClusters = computed(() => {
  if (!user.value.direction || students.value.length === 0) return [];

  const directionStudents = students.value.filter(s => s.direction === user.value.direction);
  const clusterStats = {};

  directionStudents.forEach(student => {
    const uniqueCourses = new Set();
    student.groups.forEach(group => {
      const clusterName = group.elective.cluster;
      const courseId = group.elective.id;
      
      if (!clusterStats[clusterName]) {
        clusterStats[clusterName] = {
          total: 0,
          courses: {},
          students: new Set(),
          color: darkenColor(generateColorFromString(clusterName), 30)
        };
      }
      
      clusterStats[clusterName].total++;
      clusterStats[clusterName].students.add(student.id);
      
      if (!uniqueCourses.has(courseId)) {
        if (!clusterStats[clusterName].courses[courseId]) {
          clusterStats[clusterName].courses[courseId] = {
            ...group.elective,
            studentCount: 0
          };
        }
        clusterStats[clusterName].courses[courseId].studentCount++;
        uniqueCourses.add(courseId);
      }
    });
  });

  return Object.entries(clusterStats)
    .map(([name, stats]) => {
      const totalDirectionStudents = directionStudents.length;
      return {
        name,
        percent: Math.round((stats.students.size / totalDirectionStudents) * 100),
        totalStudents: stats.students.size,
        topCourses: Object.values(stats.courses)
          .map(course => {
            const percent = (course.studentCount / totalDirectionStudents) * 100;
            return {
              ...course,
              percent: percent.toFixed(1)
            };
          })
          .sort((a, b) => b.studentCount - a.studentCount)
          .slice(0, 5),
        color: stats.color
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .filter(c => c.percent > 0)
    .slice(0, 5);
});

    // --- Методы ---
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

    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        courses.value = response.data;
      } catch (e) {
        console.error('Ошибка при загрузке курсов', e);
      }
    };


    // --- Хуки жизненного цикла ---
    onMounted(async () => {
      await fetchCourses();
      await fetchUserProfile();
      await Promise.all([fetchStudents(), fetchUserRequests()]);
    });

    return {
      courses,
      searchQuery,
      selectedCluster,
      currentPage,
      itemsPerPage,
      filteredCourses,
      paginatedCourses,
      totalPages,
      allClusterItems,
      user,
      recommendedClusters,
      loadingUser,
      loadingStudents,
      userRequests,
      loadingRequests,
      changePage,
      resetFilters
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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