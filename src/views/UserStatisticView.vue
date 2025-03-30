<template>
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
</template>

<script setup>
import {ref, onMounted} from 'vue';
import axiosInstance from '@/axios/axios';
import CourseCard from '@/components/CourseCard.vue';
import {darkenColor, generateColorFromString} from '@/utils/colorUtils';

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

const generateClusterColor = (clusterName) =>
    darkenColor(generateColorFromString(clusterName || ''), 30);

onMounted(async () => {
  await fetchUserProfile();
  if (user.value?.sp_code) {
    await fetchRecommendations(user.value.sp_code);
  }
});
</script>


<style scoped>
.cluster-list {
  margin-top: 20px;
}

.cluster-item {
  margin-bottom: 20px;
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

.section-title {
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 20px;
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