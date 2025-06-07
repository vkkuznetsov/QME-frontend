<template>
  <div class="course-card" :class="{ 'course-card--dimmed': isFull }" @click="goToCourse">
    <div class="blue-stripe"></div>
    <div class="course-card__content">
      <h3 class="course-title" title="Название электива">{{ course.name }}</h3>
      <v-divider class="border-opacity-25 mt-2"></v-divider>
      <!-- Блок дополнительной информации -->
      <div v-if="additionalText" class="additional-info mt-4">
        {{ additionalText }}
      </div>

      <div :class="['cluster-wrapper', { 'mt-4': !additionalText }]">
        <span
            class="course-cluster"
            :style="{ backgroundColor: clusterColor, color: textColor }"
            title="Область знаний"
        >
          {{ course.cluster }}
        </span>
      </div>
      <div class="free-spots">Мест: {{ course.free_spots }}</div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {generateColorFromString, darkenColor} from '@/utils/colorUtils';

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
  additionalText: {
    type: String,
    default: ''
  }
});

const router = useRouter();

const clusterColor = computed(() => {
  // если «Без области знаний» – делаем серый бейдж
  if (props.course.cluster === 'Без области знаний') {
    return '#E0E0E0';
  }
  return generateColorFromString(props.course.cluster);
});

const textColor = computed(() => {
  if (props.course.cluster === 'Без области знаний') {
    return '#666666';
  }
  return darkenColor(clusterColor.value, 50);
});
const isFull = computed(() => props.course.free_spots === 0);

function goToCourse() {
  router.push({ name: 'CourseDetail', params: { id: props.course.id } });
}
</script>

<style scoped>
.course-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #fff;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.course-card:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.blue-stripe {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 5px;
  background-color: rgb(var(--v-theme-primary));
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  opacity: 0;
}

.course-card__content {
  padding: 16px;
  margin-top: 5px;
  position: relative; /* Добавлено для позиционирования free_spots */
}

.course-title {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.additional-info {
  font-size: 12px;
  color: #666;
  margin: 6px 0;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  display: inline-block;
}

.cluster-wrapper {
  position: relative;
  padding-bottom: 15px;
}

.course-cluster {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}

.free-spots {
  position: static;
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 108, 0, 0.7)
}

.course-card--dimmed {
  opacity: 0.6;
}
</style>