<template>
  <div v-if="!loadingUser">
    <h2 class="section-title">Студенты вашего направления {{ user.sp_code }} чаще всего выбирают:</h2>

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
        <v-card class="cluster-card" flat style="box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
          <div
            class="cluster-header d-flex align-center justify-space-between"
            :style="{ backgroundColor: generateColorFromString(cluster.name) }"
          >
            <h3
              class="cluster-title"
              :style="{ color: darkenColor(generateColorFromString(cluster.name), 50) }"
            >
              {{ cluster.name }}
            </h3>
            <span class="cluster-percent text-medium-emphasis">
              выбрали {{ cluster.totalStudents }} студентов
            </span>
          </div>
          <div class="pa-4">
            <v-row class="courses-list">
              <v-col
                  v-for="course in cluster.topCourses"
                  :key="course.id"
                  cols="12"
                  sm="6"
                  md="4"
              >
                <CourseCard
                    :course="course"
                    :additional-text="`${course.student_count} студентов`"
                />
              </v-col>
            </v-row>
          </div>
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
</template>

<script setup>
import {ref, onMounted} from 'vue';
import axiosInstance from '@/axios/axios';
import CourseCard from '@/components/CourseCard.vue';
import {generateColorFromString, darkenColor} from '@/utils/colorUtils';

const user = ref({});
const recommendations = ref([]);
const loadingUser = ref(true);
const loadingRecommendations = ref(false);

const fetchUserProfile = async () => {
  try {
    const email = localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
    const response = await axiosInstance.get(`/student_info`, {params: {email}});
    user.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки пользователя:', error);
  } finally {
    loadingUser.value = false;
  }
};

const fetchRecommendations = async (direction) => {
  loadingRecommendations.value = true;
  try {
    const response = await axiosInstance.get(`/recomendation/${encodeURIComponent(direction)}`);
    recommendations.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки рекомендаций:', error);
  } finally {
    loadingRecommendations.value = false;
  }
};

onMounted(async () => {
  await fetchUserProfile();
  if (user.value?.sp_code) {
    await fetchRecommendations(user.value.sp_code);
  }
});
</script>


<style scoped>
.cluster-list {
  margin-bottom: 3vh;
}

.cluster-item {
  font-size: 1.3rem;
  letter-spacing: -0.5px;
}

.section-title {
  margin-top: 5vh;
  margin-bottom: 5vh;
  font-family: 'Montserrat', sans-serif !important;
  font-size: 37px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: left;
  color: rgba(0, 0, 0, 0.6);
}

.cluster-item,
.cluster-percent {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.5px !important;
  color: rgba(0, 0, 0, 0.7) !important;
}

.cluster-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.cluster-header {
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
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