<template>
  <div class="course-card" @click="goToCourse">
    <div class="blue-stripe"></div>
    <div class="course-card__content">
      <h3 class="course-title" title="Название электива">{{ course.name }}</h3>

      <!-- Блок дополнительной информации -->
      <div v-if="additionalText" class="additional-info">
        {{ additionalText }}
      </div>

      <span
          class="course-cluster"
          :style="{ backgroundColor: clusterColor, color: textColor }"
          title="Область знаний"
      >
        {{ course.cluster }}
      </span>

      <!-- Новый элемент для числа в правом нижнем углу -->
      <span class="free-spots" title="Свободные места">{{ course.free_spots }}</span>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { computed } from 'vue';
import { useRouter } from 'vue-router';

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

const clusterColor = computed(() => generateColorFromString(props.course.cluster));
const textColor = computed(() => darkenColor(clusterColor.value, 50));

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
}

.course-card:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.blue-stripe {
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  width: 100%;
  background-color: rgb(var(--v-theme-primary));
}

.course-card__content {
  padding: 16px;
  margin-top: 10px;
  position: relative; /* Добавлено для позиционирования free_spots */
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
}

.course-cluster {
  display: block;
  width: fit-content;
  margin-top: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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

.free-spots {
  position: absolute;
  bottom: 10px;
  right: 16px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  background-color: #1f9100;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>