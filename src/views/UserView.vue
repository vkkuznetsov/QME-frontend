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
            <div class="course-card">
              <div class="blue-stripe"></div>
              <div class="course-card__content">
                <h3 class="course-title">{{ course.name }}</h3>
                <p class="course-description">{{ getShortDescription(course.description) }}</p>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Все курсы -->
    <h2 class="section-title mt-10">Все элективные курсы</h2>
    <v-card class="filters-card pa-4 my-4">
      <v-row>
        <!-- Поиск -->
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="searchQuery"
            label="Поиск по названию или описанию"
            outlined
            dense
            clearable
          ></v-text-field>
        </v-col>
        <!-- Фильтр по кластеру -->
        <v-col cols="12" sm="6" md="4">
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
        <v-col cols="12" sm="6" md="4">
          <v-btn color="primary" @click="resetFilters">Сбросить фильтры</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col
        v-for="course in filteredCourses"
        :key="course.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <div class="course-card">
          <div class="blue-stripe"></div>
          <div class="course-card__content">
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-description">{{ getShortDescription(course.description) }}</p>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import coursesData from './data/courses_clusters.json'; // Убедитесь, что путь верный

export default {
  name: 'UserView',
  data() {
    return {
      recommendedClusters: [],
      searchQuery: '',
      selectedCluster: null,
      clusters: [], // Список всех кластеров из курсов
      courses: coursesData, // Все курсы
    };
  },
  computed: {
    // Список всех уникальных кластеров для фильтрации
    allClusterItems() {
      return Array.from(new Set(this.courses.map(course => course.cluster)));
    },
    // Фильтрация всех курсов на основе поиска и выбранного кластера
    filteredCourses() {
      return this.courses.filter(course => {
        const text = (course.name + ' ' + (course.description || '')).toLowerCase();
        const matchSearch = this.searchQuery
          ? text.includes(this.searchQuery.toLowerCase())
          : true;
        const matchCluster = this.selectedCluster
          ? course.cluster === this.selectedCluster
          : true;
        return matchSearch && matchCluster;
      });
    },
    // Группировка рекомендованных курсов по кластеру и ограничение до 5 курсов
    recommendedByCluster() {
      const groups = {};
      this.courses.forEach(course => {
        if (this.recommendedClusters.includes(course.cluster)) {
          if (!groups[course.cluster]) {
            groups[course.cluster] = [];
          }
          if (groups[course.cluster].length < 5) {
            groups[course.cluster].push(course);
          }
        }
      });
      return groups;
    },
  },
  created() {
    // Загрузка рекомендованных кластеров из localStorage
    const savedClusters = JSON.parse(localStorage.getItem('recommendedClusters') || '[]');
    this.recommendedClusters = savedClusters;

    // Получение списка всех кластеров из курсов
    const allClusters = this.courses.map(course => course.cluster);
    this.clusters = Array.from(new Set(allClusters));
  },
  methods: {
    getShortDescription(description) {
      const maxLength = 100;
      if (!description) return '';
      if (description.length <= maxLength) return description;
      return description.slice(0, maxLength) + '...';
    },
    resetFilters() {
      this.searchQuery = '';
      this.selectedCluster = null;
    }
  }
};
</script>

<style scoped>
.recommend-container {
  font-family: 'Montserrat', sans-serif;
  padding-top: 30px;
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

.course-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #fff;
  margin-bottom: 20px;
  position: relative;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.course-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

/* Синяя полоска вместо дублированного текста */
.blue-stripe {
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  width: 100%;
  background-color: #6ba5e2; /* Синий цвет */
}

.course-card__content {
  padding: 16px;
  margin-top: 10px; /* Отступ под полоской */
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.course-description {
  font-weight: 300;
  margin: 0;
  color: #555;
  line-height: 1.4em;
}

.filters-card {
  border-radius: 12px;
}
</style>
