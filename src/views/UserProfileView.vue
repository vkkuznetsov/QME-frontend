<template>
  <v-container fluid class="profile-container">
    <v-row align="center" justify="center" class="mt-10">
      <v-col cols="12" md="8" lg="6">
        <v-card class="profile-card custom-shadow" elevation="3">
          <v-card-text>
            <!-- Индикатор загрузки -->
            <div v-if="loading" class="text-center my-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <!-- Сообщение об ошибке -->
            <div v-else-if="error" class="text-center my-4">
              <v-alert type="error" dismissible>{{ error }}</v-alert>
            </div>

            <!-- Информация о пользователе -->
            <div v-else>
              <div class="profile-info">
                <v-row align="center">
                  <v-col cols="auto">
                    <v-avatar size="100">
                      <v-icon size="64">mdi-account</v-icon>
                    </v-avatar>
                  </v-col>

                  <v-col>
                    <h2 class="mb-1">{{ user.name }}</h2>
                    <p class="mb-0"><strong>Email:</strong> {{ user.email }}</p>
                    <p class="mb-0"><strong>Направление:</strong> {{ user.direction }}</p>
                    <p class="mb-4"><strong>Год поступления:</strong> {{ user.admissionYear }}</p>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-4"></v-divider>

              <!-- Список элективов (аккордеоны) -->
              <div v-if="hasElectives" class="mt-4">
                <h2 class="groups-title">Мои элективы</h2>
                <v-expansion-panels multiple>
                  <v-expansion-panel
                    v-for="(groupsArray, electiveName) in electivesList"
                    :key="electiveName"
                  >
                    <v-expansion-panel-title>
                      {{ electiveName }}
                      <!-- Можно вывести кол-во групп/типов рядом -->
                      <small class="text--secondary">({{ groupsArray.length }} группы)</small>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div>
                        <v-row>
                          <v-col
                            v-for="(grp) in groupsArray"
                            :key="grp.id"
                            cols="12"
                            md="6"
                            class="mb-4"
                          >
                            <v-card outlined class="pa-3">
                              <strong>Группа:</strong> {{ grp.name }}<br />
                              <strong>Тип:</strong> {{ grp.type }}<br />
                              <strong>Вместимость:</strong> {{ grp.capacity }}

                              <!-- Небольшая полоска заполненности -->
                              <v-progress-linear
                                class="mt-2"
                                :value="groupFill(grp)"
                                height="10"
                                :color="fillColor(grp)"
                                stream
                                rounded
                              >
                                <template v-slot:default>
                                  <div class="progress-slot">
                                    {{ groupFill(grp) }}%
                                  </div>
                                </template>
                              </v-progress-linear>
                            </v-card>
                          </v-col>
                        </v-row>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <div v-else>
                <p class="text-center">У вас пока нет записей в группы.</p>
              </div>

              <!-- Отладочная информация (опционально) -->
              <!--
              <pre>{{ user.groups }}</pre>
              <pre>{{ electivesList }}</pre>
              -->
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'UserProfileView',
  setup() {
    // Состояние пользователя
    const user = reactive({
      name: '',
      email: '',
      direction: '',
      admissionYear: '',
      groups: [],
    });

    // Состояния загрузки и ошибки
    const loading = ref(true);
    const error = ref(null);

    // Получение профиля пользователя
    const fetchUserProfile = async (email) => {
      try {
        const response = await axios.get('/api/users', { params: { email } });
        Object.assign(user, response.data);
      } catch (err) {
        console.error(err);
        if (err.response) {
          error.value =
            err.response.data.message || 'Не удалось загрузить данные пользователя.';
        } else {
          error.value = 'Не удалось подключиться к серверу.';
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      const userEmail = localStorage.getItem('userEmail') || 'stud0000257868@study.utmn.ru';
      fetchUserProfile(userEmail);
    });

    // Группируем группы по elective.name
    const electivesList = computed(() => {
      if (!user.groups || !user.groups.length) return {};
      const grouped = {};
      user.groups.forEach((g) => {
        const eName = g.elective?.name || 'Неизвестный электив';
        if (!grouped[eName]) {
          grouped[eName] = [];
        }
        grouped[eName].push(g);
      });
      return grouped;
    });

    // Проверка наличия элективов
    const hasElectives = computed(() => {
      return Object.keys(electivesList.value).length > 0;
    });

    // Заполненность группы в процентах
    const groupFill = (grp) => {
      if (!grp.capacity) return 0;
      const count = grp.students?.length || 0;
      return Math.min(100, Math.round((count / grp.capacity) * 100));
    };

    // Цвет прогресса в зависимости от заполненности
    const fillColor = (grp) => {
      const fill = groupFill(grp);
      if (fill < 50) return 'green';
      if (fill < 80) return 'orange';
      return 'red';
    };

    return {
      user,
      loading,
      error,
      electivesList,
      hasElectives,
      groupFill,
      fillColor,
    };
  },
};
</script>

<style scoped>
.profile-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px;
  margin: -50px auto;
  max-width: 1200px; /* Установите подходящую ширину */
  box-sizing: border-box;
}

.profile-card {
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}

.profile-info h2 {
  font-weight: 600;
  margin-bottom: 4px;
}

.profile-info p {
  font-weight: 300;
  line-height: 1.4em;
  margin: 0;
}

.groups-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.custom-shadow {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Слот внутри прогресса, чтобы текст показывался поверх полоски */
.progress-slot {
  position: absolute;
  right: 10px;
  top: -4px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>