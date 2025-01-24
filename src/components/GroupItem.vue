<template>
    <v-card class="group-item-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <v-icon :color="groupTypeColor" large>{{ groupIcon }}</v-icon>
          </v-avatar>
          <div>
            <div class="group-name">{{ group.name }}</div>
            <v-chip :color="groupTypeColor" text-color="white" small>
              {{ group.type }}
            </v-chip>
          </div>
        </div>
        <v-btn icon small @click="toggle">
          <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-title>
  
      <v-card-subtitle class="d-flex flex-column">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="fill-label">Заполненность</span>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on" color="grey">mdi-information</v-icon>
            </template>
            <span>Максимальная вместимость группы: {{ group.capacity }}</span>
          </v-tooltip>
        </div>
        <v-progress-linear
          :value="fillPercentage"
          :color="progressColor"
          height="10"
          rounded
        >
          <strong class="progress-text">{{ fillPercentage }}%</strong>
        </v-progress-linear>
      </v-card-subtitle>
  
      <v-expand-transition>
        <div v-if="isExpanded" class="student-list">
          <strong>Студенты:</strong>
          <v-list dense>
            <v-list-item v-for="student in group.students" :key="student.id">
              <v-list-item-avatar>
                <v-img :src="student.avatar || defaultAvatar"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ student.fio }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="group.students.length === 0">
              <v-list-item-content>
                <v-list-item-title>Нет записанных студентов</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-expand-transition>
    </v-card>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { getGroupTypeColor, getGroupIcon } from '@/utils/colorUtils';
  
  export default {
    name: 'GroupItem',
    props: {
      group: {
        type: Object,
        required: true,
      },
      isExpanded: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['toggle'],
    setup(props, { emit }) {
      const toggle = () => {
        emit('toggle', props.group.id);
      };
  
      const groupTypeColor = computed(() => getGroupTypeColor(props.group.type));
      const groupIcon = computed(() => getGroupIcon(props.group.type));
  
      const fillPercentage = computed(() => {
        if (props.group.capacity === 0) return 0;
        return Math.min(
          100,
          Math.round((props.group.students.length / props.group.capacity) * 100)
        );
      });
  
      const progressColor = computed(() => {
        if (fillPercentage.value === 0) return 'green';
        if (fillPercentage.value > 75) return 'red';
        return 'yellow';
      });
  
      const defaultAvatar = '/path/to/default/avatar.png'; // Укажите путь к изображению по умолчанию
  
      return {
        toggle,
        groupTypeColor,
        fillStatusClass: computed(() => {
          const ratio = props.group.students.length / props.group.capacity;
          if (ratio === 0) return 'fill-green';
          if (ratio > 0.75) return 'fill-red';
          return 'fill-yellow';
        }),
        groupIcon,
        fillPercentage,
        progressColor,
        defaultAvatar,
      };
    },
  };
  </script>
  
  <style scoped>
  .group-item-card {
    border: 1px solid #e0e0e0; /* Тонкая сероватая граница */
    border-radius: 8px; /* Умеренные скругления углов */
    padding: 16px; /* Внутренние отступы для лучшего расположения элементов */
    margin-bottom: 16px; /* Отступ снизу для разделения карточек */
    background-color: #ffffff; /* Белый фон для контраста */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .group-name {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 4px; /* Добавлен отступ снизу */
  }
  
  .fill-label {
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .progress-text {
    position: absolute;
    right: 10px;
    top: -5px;
    font-weight: bold;
    color: #ffffff;
  }
  
  .v-progress-linear {
    position: relative;
  }
  
  .fill-green {
    background-color: #66bb6a; /* Зеленый */
  }
  
  .fill-yellow {
    background-color: #ffa726; /* Оранжевый */
  }
  
  .fill-red {
    background-color: #ef5350; /* Красный */
  }
  
  .student-list {
    padding: 16px;
    background-color: #f9f9f9;
    border-top: 1px solid #e0e0e0;
    margin-top: 16px; /* Добавлен отступ сверху */
  }
  
  .v-list-item-avatar {
    margin-right: 8px;
  }
  
  .v-tooltip .v-tooltip__content {
    max-width: 200px;
  }
  
  .v-card-title,
  .v-card-subtitle {
    padding: 0;
    margin-bottom: 8px; 
  }
  
  .v-chip {
    margin-top: 4px;
    border-radius: 10px; /* Добавляем небольшой отступ сверху */
  }
  
  .student-list strong {
    display: block;
    margin-bottom: 8px;
  }
  </style>