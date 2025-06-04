<template>
  <v-card class="group-item-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-avatar size="40" class="mr-3">
          <v-icon :color="groupTypeColor" large>{{ groupIcon }}</v-icon>
        </v-avatar>
        <div>
          <div class="d-flex align-center">
            <v-chip :color="groupTypeColor" text-color="white" small>{{ group.type }}</v-chip>
            <span class="group-schedule ml-2">{{ group.day }}, {{ group.time_interval }}</span>
          </div>
          <div class="group-name">{{ group.name }}</div>
        </div>
      </div>
      <v-btn icon small @click="toggle">
        <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-subtitle class="d-flex flex-column">
      <div class="d-flex mb-2">
        <v-avatar :color="spotColor" size="20" class="mr-2"></v-avatar>
        <span>{{ freeSpots }} мест</span>
        <span class="fill-label ml-auto">Заполненность ({{ group.students.length }} / {{ group.capacity }})</span>
      </div>
    </v-card-subtitle>

    <div v-if="isExpanded" class="student-list">
      <!-- Список текущих студентов -->
      <div class="section-title mb-2">Текущие студенты ({{ group.students.length }})</div>
      <div v-for="student in group.students" :key="student.id" class="student-item">
        <span>{{ student.fio }}</span>
      </div>
      <div v-if="!group.students.length" class="student-item">
        <span>Нет записанных студентов</span>
      </div>

      <!-- Список выписывающихся студентов -->
      <div v-if="uniqueTransfersFrom.length" class="transfer-section">
        <div class="section-title mb-2">Выписывающиеся студенты ({{ uniqueTransfersFrom.length }})</div>
        <div v-for="transfer in uniqueTransfersFrom" :key="transfer.id" class="transfer-item">
          <span class="student-name">{{ transfer.student.fio }}</span>
        </div>
      </div>

      <!-- Список записывающихся студентов -->
      <div v-if="group.transfers_to?.length" class="transfer-section">
        <div class="section-title mb-2">Записывающиеся студенты ({{ group.transfers_to.length }})</div>
        <div v-for="transfer in sortedTransfersTo" :key="transfer.id" class="transfer-item">
          <span class="student-name">{{ transfer.student.fio }}</span>
          <v-chip size="small" color="primary" class="priority-chip">
            Приоритет: {{ transfer.priority }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { getGroupTypeColor, getGroupIcon } from '@/utils/colorUtils';

const props = defineProps({
  group: { type: Object, required: true },
  isExpanded: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle']);

const toggle = () => emit('toggle', props.group.id);

const groupTypeColor = computed(() => getGroupTypeColor(props.group.type));
const groupIcon = computed(() => getGroupIcon(props.group.type));
const freeSpots = computed(() => props.group.capacity - props.group.students.length);
const spotColor = computed(() => {
  if (freeSpots.value === 0) return '#F44336'; // Красный
  if (freeSpots.value <= 5) return '#4CAF50'; // Зеленый
  return '#FFC107'; // Желтый
});

// Получение уникальных выписывающихся студентов
const uniqueTransfersFrom = computed(() => {
  if (!props.group.transfers_from) return [];
  const uniqueStudents = new Map();
  props.group.transfers_from.forEach(transfer => {
    if (!uniqueStudents.has(transfer.student.id)) {
      uniqueStudents.set(transfer.student.id, transfer);
    }
  });
  return Array.from(uniqueStudents.values());
});

const sortedTransfersTo = computed(() => {
  if (!props.group.transfers_to) return [];
  return [...props.group.transfers_to].sort((a, b) => a.priority - b.priority);
});
</script>

<style scoped>
.group-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.group-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.group-schedule {
  font-size: 0.9rem;
  color: #666;
}

.fill-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.student-list {
  padding-top: 8px;
}

.section-title {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  margin-top: 16px;
}

.student-item {
  padding: 4px 0;
  font-size: 1rem;
}

.transfer-section {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.transfer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
}

.student-name {
  flex-grow: 1;
  margin-right: 8px;
}

.priority-chip {
  font-size: 0.8rem;
}

.v-card-title,
.v-card-subtitle {
  padding: 0;
  margin-bottom: 8px;
}

.v-chip {
  margin-top: 4px;
  border-radius: 10px;
}
</style>