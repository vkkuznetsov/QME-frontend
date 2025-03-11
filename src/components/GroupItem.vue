<template>
  <v-card class="group-item-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-avatar size="40" class="mr-3">
          <v-icon :color="groupTypeColor" large>{{ groupIcon }}</v-icon>
        </v-avatar>
        <div>
          <v-chip :color="groupTypeColor" text-color="white" small>{{ group.type }}</v-chip>
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
      <div v-for="student in group.students" :key="student.id" class="student-item">
        <span>{{ student.fio }}</span>
      </div>
      <div v-if="!group.students.length" class="student-item">
        <span>Нет записанных студентов</span>
      </div>
    </div>
  </v-card>
</template>

<script>
import { computed } from 'vue';
import { getGroupTypeColor, getGroupIcon } from '@/utils/colorUtils';

export default {
  name: 'GroupItem',
  props: {
    group: { type: Object, required: true },
    isExpanded: { type: Boolean, default: false },
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const toggle = () => emit('toggle', props.group.id);

    const groupTypeColor = computed(() => getGroupTypeColor(props.group.type));
    const groupIcon = computed(() => getGroupIcon(props.group.type));
    const freeSpots = computed(() => props.group.capacity - props.group.students.length);
    const spotColor = computed(() => {
      if (freeSpots.value === 0) return '#F44336'; // Красный
      if (freeSpots.value <= 5) return '#4CAF50'; // Зеленый
      return '#FFC107'; // Желтый
    });

    return { toggle, groupTypeColor, groupIcon, freeSpots, spotColor };
  },
};
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

.fill-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.student-list {
  padding-top: 8px;
}

.student-item {
  padding: 4px 0;
  font-size: 1rem;
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