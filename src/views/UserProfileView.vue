<template>
  <v-container fluid class="profile-container">
    <v-row align="center" justify="center" class="mt-10">
      <v-col cols="12" md="10" lg="8">
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
                    <v-avatar size="120">
                      <v-icon size="80">mdi-account</v-icon>
                    </v-avatar>
                  </v-col>

                  <v-col>
                    <h2 class="mb-2">{{ user.fio }}</h2>
                    <p class="mb-1"><strong>Email:</strong> {{ user.email }}</p>
                    <p class="mb-1"><strong>Направление:</strong> {{ user.sp_code }}</p>
                    <p class="mb-4"><strong>Год поступления:</strong> {{ user.potok }}</p>
                  </v-col>
                </v-row>
              </div>

              <v-divider class="my-6"></v-divider>

              <!-- Список элективов (аккордеоны) -->
              <div v-if="hasElectives" class="mt-4">
                <h2 class="groups-title">Мои элективы</h2>
                <v-expansion-panels multiple>
                  <v-expansion-panel
                      v-for="(groupsArray, electiveName) in electivesList"
                      :key="electiveName"
                  >
                    <v-expansion-panel-title class="text-h6">
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
                              <div class="text-h6">
                                <strong>Группа:</strong> {{ grp.name }}<br/>
                                <strong>Тип:</strong> {{ grp.type }}<br/>
                                <strong>Вместимость:</strong> {{ grp.capacity }}<br/>
                              </div>
                            </v-card>
                          </v-col>
                        </v-row>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <div v-else>
                <p class="text-center text-h6">У вас пока нет записей в группы.</p>
              </div>

              <div class="text-center mt-6">
                <v-btn 
                  color="error" 
                  variant="outlined" 
                  @click="showLogoutDialog = true"
                  size="large"
                  class="logout-btn"
                >
                  <v-icon left class="me-2">mdi-logout</v-icon>
                  Выйти
                </v-btn>
              </div>

            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалоговое окно подтверждения выхода -->
    <v-dialog v-model="showLogoutDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение выхода
        </v-card-title>
        <v-card-text>
          Вы действительно хотите выйти?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showLogoutDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmLogout"
          >
            Да
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue';
import axiosInstance from '@/axios/axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const showLogoutDialog = ref(false);

// Состояние пользователя
const user = reactive({
  fio: '',
  email: '',
  sp_code: '',
  potok: '',
  groups: [],
});

// Состояния загрузки и ошибки
const loading = ref(true);
const error = ref(null);

// Получение профиля пользователя
const fetchUserProfile = async (email) => {
  try {
    const response = await axiosInstance.get(`/student_info`, {params: {email}});
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

const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userEmail');
  router.push('/login');
};

const confirmLogout = () => {
  showLogoutDialog.value = false;
  logout();
};

onMounted(() => {
  const userEmail = localStorage.getItem('userEmail') || 'stud0000295515@study.utmn.ru';
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

</script>

<style scoped>
.profile-container {
  font-family: 'Montserrat', sans-serif;
  padding: 30px 15px;
  margin: -50px auto;
  max-width: 1400px;
  box-sizing: border-box;
}

.profile-card {
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 20px;
}

.profile-info h2 {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1.8rem;
}

.profile-info p {
  font-weight: 300;
  line-height: 1.6em;
  margin: 0;
  font-size: 1.1rem;
}

.groups-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 1.4rem;
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

.logout-btn {
  padding: 0 20px;
  height: 48px;
  font-size: 1.1rem;
}
</style>