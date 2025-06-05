<template>
  <v-card
    variant="flat"
    class="group-item-card"
    :class="{ 'group-disabled': freeSpots === 0 }"
  >
    <!-- Header -->
    <v-card-item class="card-header">
      <template #prepend>
        <v-icon :color="groupTypeColor" size="28">{{ groupIcon }}</v-icon>
      </template>

      <template #title>
        <span class="group-name">{{ group.name }}</span>
      </template>

      <template #subtitle>
        <div class="subtitle-row">
          <v-chip 
            :color="groupTypeColor"
            text-color="white"
            size="small"
            variant="flat"
            class="rounded-lg mr-2"
            style="font-weight: 600;"
          >
            {{ group.type }}
          </v-chip>
          <span class="group-schedule">{{ group.day }}, {{ group.time_interval }}</span>
        </div>
      </template>

      <template #append>
        <v-btn
          icon
          variant="text"
          :ripple="false"
          size="small"
          @click="toggle"
        >
          <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </template>
    </v-card-item>

    <!-- Slots info -->
    <v-card-actions class="slots-row">
      <div style="font-weight: 500; font-size: 0.85rem; color: #666; font-weight: 600;">
        Мест: {{ freeSpots }}
      </div>
      <span class="fill-label">({{ group.students.length }} / {{ group.capacity }})</span>
    </v-card-actions>

    <!-- Expanded content -->
    <v-expand-transition>
      <div v-if="isExpanded" class="student-list">
        <!-- Current students -->
        <div class="section-title mb-2">
          Текущие студенты ({{ group.students.length }})
        </div>
        <div
          v-for="student in group.students"
          :key="student.id"
          class="student-item"
        >
          <span>{{ student.fio }}</span>
        </div>
        <div v-if="!group.students.length" class="student-item">
          <span>Нет записанных студентов</span>
        </div>

        <!-- Students transferring out -->
        <div v-if="uniqueTransfersFrom.length" class="transfer-section">
          <div class="section-title mb-2">
            Выписывающиеся студенты ({{ uniqueTransfersFrom.length }})
          </div>
          <div
            v-for="transfer in uniqueTransfersFrom"
            :key="transfer.id"
            class="transfer-item"
          >
            <span class="student-name">{{ transfer.student.fio }}</span>
          </div>
        </div>

        <!-- Students transferring in -->
        <div v-if="group.transfers_to?.length" class="transfer-section">
          <div class="section-title mb-2">
            Записывающиеся студенты ({{ group.transfers_to.length }})
          </div>
          <div
            v-for="transfer in sortedTransfersTo"
            :key="transfer.id"
            class="transfer-item"
          >
            <span class="student-name">{{ transfer.student.fio }}</span>
            <v-chip size="small" color="primary" class="priority-chip">
              Приоритет: {{ transfer.priority }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-expand-transition>
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
  border-radius: 0px;
  padding: 0; /* internal elements handle spacing */
  background-color: #ffffff;
}

.group-disabled {
  opacity: 0.6;
}

.card-header {
  padding: 12px 16px;
}

.group-name {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
}

.subtitle-row {
  display: flex;
  align-items: center;
}

.group-schedule {
  font-weight: 600;
  font-size: 0.85rem;
  color: #555;
}

.slots-row {
  padding: 4px 16px 12px;
}

.fill-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #666;
}

.student-list {
  padding: 0 16px 12px;
}

.section-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #555;
  margin-top: 16px;
}

.student-item,
.transfer-item {
  padding: 4px 0;
  font-size: 0.9rem;
}

.transfer-section {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.priority-chip {
  font-size: 0.75rem;
}
</style>