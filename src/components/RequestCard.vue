<template>
  <v-card class="request-card">
    <div class="blue-stripe"></div>

    <div class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="status-chip" :class="statusClass(req.status)">
          {{ req.status }}
        </div>

        <v-btn
            v-if="showCancel"
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
        <div class="priority" v-if="req.status === 'Ожидается'">
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
      <div class="groups-section">
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
    </div>
  </v-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RequestCard',
  props: {
    req: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // Показываем иконку "отменить", если статус — "Ожидается"
    showCancel() {
      return this.req.status === 'Ожидается';
    },
  },
  methods: {
    // Класс статуса для стилизации текста
    statusClass(status) {
      switch (status) {
        case 'Ожидается':
          return 'status-pending';
        case 'Одобрено':
          return 'status-approved';
        case 'Отклонено':
          return 'status-rejected';
        default:
          return '';
      }
    },
    // Цвет для v-chip типа группы
    groupTypeColor(type) {
      const lower = type.toLowerCase();
      if (lower.includes('лекц')) return 'indigo darken-2';
      if (lower.includes('практ')) return 'teal darken-2';
      if (lower.includes('лаб')) return 'orange darken-2';
      return 'purple darken-2';
    },

    // Удаление заявки (DELETE)
    async cancelRequest() {
      if (!this.req.id) {
        console.error('Не удалось отменить заявку: отсутствует req.id');
        return;
      }
      try {
        // DELETE /api/requests/:id
        await axios.delete(`/api/requests/${this.req.id}`);

        // Говорим родителю «я удалена»
        this.$emit('request-canceled', this.req.id);
      } catch (err) {
        console.error('Ошибка при отмене заявки:', err);
        alert('Не удалось отменить заявку. Попробуйте позже.');
      }
    },
  },
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
  white-space: normal; /* Разрешаем перенос строк */
  word-wrap: break-word; /* Перенос длинных слов */
  min-width: 0; /* Исправление для flex-элементов */
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

/* Scrollbar styling */
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

/* Mobile adaptation */
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