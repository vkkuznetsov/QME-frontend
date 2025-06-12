<template>
  <v-card class="request-card">
    <div class="blue-stripe"></div>

    <div class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="status-chip" :class="statusClass">
          {{ displayStatus }}
        </div>

        <v-btn
          v-if="canCancel"
          icon
          @click.stop="cancelRequest"
          class="cancel-btn"
          size="x-small"
        >
          <v-icon color="error">mdi-close-circle</v-icon>
        </v-btn>
      </div>

      <!-- Body -->
      <div class="card-body">
        <!-- Показываем приоритет для draft/pending -->
        <div class="priority" v-if="showPriority">
          <v-icon small color="primary">mdi-sort-numeric-ascending</v-icon>
          <span class="text-primary">{{ req.priority }}</span>
        </div>

        <div class="course-transition">
          <div class="course-from">{{ req.sourceElectiveName }}</div>
          <v-icon color="primary">mdi-arrow-right-bold</v-icon>
          <div class="course-to">{{ req.electiveName }}</div>
        </div>
      </div>

      <!-- Groups -->
      <div class="groups-section" v-if="Array.isArray(req.selectedGroups) && req.selectedGroups.length">
        <v-chip
          v-for="(gr, idx) in req.selectedGroups"
          :key="idx"
          :color="groupTypeColor(gr.type)"
          size="small"
          class="group-chip"
        >
          <v-icon start small>mdi-account-group</v-icon>
          {{ gr.type }}: {{ gr.name }}
        </v-chip>
      </div>
      <div v-else class="text-caption grey--text">
        Группы не выбраны
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import axiosInstance from '@/axios/axios';

const props = defineProps({
  req: { type: Object, required: true },
});
const emit = defineEmits(['request-canceled']);

// Можно отменить только draft и pending
const canCancel = computed(() => ['draft'].includes(props.req.status));

// Приоритет виден для draft и pending
const showPriority = computed(() => ['draft','pending'].includes(props.req.status));

// Статус по-русски
const displayStatus = computed(() => {
  switch (props.req.status) {
    case 'draft':   return 'Черновик';
    case 'pending': return 'Ожидается';
    case 'approved':return 'Одобрено';
    case 'rejected':return 'Отклонено';
    default:        return props.req.status;
  }
});

// CSS-класс по-статусу
const statusClass = computed(() => {
  switch (props.req.status) {
    case 'draft':   return 'status-draft';
    case 'pending': return 'status-pending';
    case 'approved':return 'status-approved';
    case 'rejected':return 'status-rejected';
    default:        return '';
  }
});

// Цвет для чипов групп
const groupTypeColor = (type) => {
  const lower = (type || '').toLowerCase();
  if (lower.includes('лекц'))      return 'green darken-2';   // Лекции — зелёный
  if (lower.includes('практ'))     return 'blue darken-2';    // Практики — синий
  if (lower.includes('лаб'))       return 'orange darken-2';  // Лабораторные — оранжевый
  return 'grey darken-1';                                  // Остальные — серый
};

// Отмена заявки
const cancelRequest = async () => {
  const id = props.req.id;
  if (!id) {
    console.error('Нет req.id для отмены');
    return;
  }
  try {
    await axiosInstance.delete(`/transfer/${id}`);
    emit('request-canceled', id);
  } catch (err) {
    console.error('Ошибка отмены заявки:', err);
    alert('Не удалось отменить заявку.');
  }
};
</script>

<style scoped>
.request-card {
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

.blue-stripe {
  height: 4px;
  background: #1976d2;
  flex-shrink: 0;
}

.card-content {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 32px;
}

.status-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-draft {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.status-pending {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffe0b2;
}

.status-approved {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-rejected {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.cancel-btn {
  margin-top: -4px;
  margin-right: -8px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.priority {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #1976d2;
}

.course-transition {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  min-height: 40px;
}

.course-from,
.course-to {
  flex: 1;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  min-width: 0;
  border: 1px solid #e9ecef;
}

.groups-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 4px 2px 2px 0;
  margin-top: auto;
}

.group-chip {
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  border-radius: 16px;
  padding: 0 12px;
  height: 26px;
}

.group-chip .v-icon {
  margin-right: 6px;
  font-size: 14px;
}

.groups-section::-webkit-scrollbar {
  width: 6px;
}

.groups-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.groups-section::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.groups-section::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

@media (max-width: 600px) {
  .request-card {
    height: 260px;
  }

  .card-content {
    padding: 12px;
    gap: 10px;
  }

  .course-from,
  .course-to {
    font-size: 13px;
    padding: 6px 8px;
  }

  .group-chip {
    font-size: 11px;
    padding: 0 10px;
  }
}
</style>
