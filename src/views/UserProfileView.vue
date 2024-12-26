<template>
    <v-container fluid class="profile-container">
      <v-row align="center" justify="center" class="mt-10">
        <v-col cols="12" md="8" lg="6">
          <v-card class="profile-card" elevation="3">
            <v-card-text>
              <div class="profile-info">
                <h2 class="mb-1">{{ userName }}</h2>
                <p class="mb-0">Email: {{ email }}</p>
                <p class="mb-0">Направление обучения: {{ direction }}</p>
                <p class="mb-4">Год поступления: {{ admissionYear }}</p>
              </div>
  
              <v-divider class="my-4"></v-divider>
  
              <!-- Начальная Страница -->
              <div v-if="!isTesting && !isTestFinished">
                <v-btn color="primary" @click="startTest">Пройти тестирование</v-btn>
              </div>
  
              <!-- Анкетирование -->
              <div v-else-if="isTesting">
                <h2 class="test-step-title">Анкетирование</h2>
                <p class="test-instructions">Оцените свой интерес к следующим темам по шкале от 0 до 1:</p>
                <v-form @submit.prevent="submitTest">
                  <v-row>
                    <v-col
                      v-for="(question, index) in questions"
                      :key="index"
                      cols="12"
                    >
                      <v-card class="question-card pa-3 my-3">
                        <h3 class="question-text">{{ index + 1 }}. {{ question.text }}</h3>
                        <v-slider
                          v-model="responses[index]"
                          :min="0"
                          :max="1"
                          step="0.1"
                          thumb-label
                          ticks="always"
                          class="mt-3"
                          required
                        ></v-slider>
                        <div class="slider-labels">
                          <span>0</span>
                          <span>1</span>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                  <v-btn color="primary" type="submit">Завершить тест</v-btn>
                </v-form>
              </div>
  
              <!-- Завершение Теста -->
              <div v-else-if="isTestFinished" class="test-finished mt-4">
                <p class="test-completed-msg">Тестирование завершено! Ваши результаты сохранены.</p>
                <v-btn color="primary" class="me-2" @click="navigateToRecommendations">Получить рекомендации</v-btn>
                <v-btn text @click="restartTest">Пройти тест снова</v-btn>
              </div>
  
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'UserProfileView',
    data() {
      return {
        userName: 'Виктор Кузнецов',
        email: 'stud0000257867@study.utmn.ru',
        direction: '02.03.03 Математическое Обеспечение и Администрирование Информационных Систем',
        admissionYear: '2021',
  
        isTesting: false,
        isTestFinished: false,
        responses: [],
        recommendedClusters: [],
  
        // Вопросы анкеты
        questions: [
          {
            text: 'Насколько вы заинтересованы в развитии навыков общения и лингвистики?',
            clusters: ['0', '3-1-1-1', '9']
          },
          {
            text: 'Насколько вас интересуют темы экономики, политики и бизнеса?',
            clusters: ['1', '12', '11']
          },
          {
            text: 'Насколько вы заинтересованы в изучении социологии и психологии?',
            clusters: ['2', '7']
          },
          {
            text: 'Насколько вы заинтересованы в философии и антропологии?',
            clusters: ['3', '3-2-1']
          },
          {
            text: 'Насколько вы интересуетесь технологиями и дизайном?',
            clusters: ['4-0', '19-0']
          },
          {
            text: 'Насколько вас привлекают темы экологии и географии?',
            clusters: ['6-1', '6-0', '6-2']
          },
          {
            text: 'Насколько вы заинтересованы в спортивных и физкультурных курсах?',
            clusters: ['5']
          },
          {
            text: 'Насколько вас интересуют искусство и культура?',
            clusters: ['18', '13']
          },
          {
            text: 'Насколько вас интересуют темы государственного управления и юридические науки?',
            clusters: ['17', '4-2']
          },
          {
            text: 'Насколько вас привлекают математика и естественные науки?',
            clusters: ['10', '3-2-2']
          },
          {
            text: 'Насколько вы заинтересованы в химии и экологических науках?',
            clusters: ['16']
          },
          {
            text: 'Насколько вас интересуют темы причинности и разрешения конфликтов?',
            clusters: ['14']
          },
          {
            text: 'Насколько вас привлекают темы отчётности и тестирования?',
            clusters: ['15']
          },
          {
            text: 'Насколько вы заинтересованы в темах таможни и налогообложения?',
            clusters: ['20']
          },
        ],
  
        // Словарь имен кластеров
        cluster_names: {
          '0': 'Навыки общения',
          '1': 'Экономика и политика',
          '2': 'Социология и маркетинг',
          '3': 'Философия и антропология',
          '3-0': 'Литература',
          '3-1': 'Медиа и коммуникации',
          '3-1-0': 'Девиантное поведение и профилактика',
          '3-1-1-0': 'Управление стрессом и этика',
          '3-1-1-1': 'Аргументация и лингвистика',
          '3-1-1-2': 'Геодезия и топография',
          '3-1-2-0': 'Медиатексты и цивилизация',
          '3-1-2-1': 'Межкультурная коммуникация',
          '3-1-2-2': 'Грамматика и лингвистика',
          '3-2-0': 'Поэтика и религия',
          '3-2-1': 'Генетика и антропология',
          '3-2-2': 'Физика и траектория',
          '4-0': 'Технологии и дизайн',
          '4-1': 'Издательство и распространение',
          '4-2': 'Государственная служба и этика',
          '5': 'Спорт и физическое воспитание',
          '6-0': 'География и окружающая среда',
          '6-1': 'Экология и биология',
          '6-2': 'Туризм и география',
          '7': 'Психология и педагогика',
          '8': 'Экологический туризм и экскурсии',
          '9': 'Публичные выступления и лингвистика',
          '10': 'Математика и статистика',
          '11': 'Программирование и разработка ПО',
          '12': 'Бизнес и маркетинг',
          '13': 'Литература и журналистика',
          '14': 'Причинность и разрешение конфликтов',
          '15': 'Отчётность и тестирование',
          '16': 'Химия и экологические науки',
          '17': 'Государственное управление и юридические науки',
          '18': 'Визуальные искусства и реклама',
          '19-0': 'Сети и мультимедиа',
          '19-1': 'Игры и управление',
          '19-2': 'Менеджмент и корпоративные исследования',
          '20': 'Таможня и налогообложение',
        },
      };
    },
    methods: {
      startTest() {
        this.isTesting = true;
        this.isTestFinished = false;
        // Инициализируем массив ответов с нулями
        this.responses = Array(this.questions.length).fill(0);
      },
      submitTest() {
        // Агрегируем оценки по кластерам
        const clusterScores = {};
  
        this.questions.forEach((question, index) => {
          const score = this.responses[index];
          question.clusters.forEach(cp => {
            if (!clusterScores[cp]) {
              clusterScores[cp] = 0;
            }
            clusterScores[cp] += score;
          });
        });
  
        // Определяем порог для рекомендаций
        const threshold = 0.5;
  
        // Выбираем кластеры, чьи оценки превышают порог
        this.recommendedClusters = Object.keys(clusterScores)
          .filter(cp => clusterScores[cp] >= threshold)
          .map(cp => this.cluster_names[cp] || cp);
  
        // Если ни один кластер не превышает порог, выбираем топ 3
        if (this.recommendedClusters.length === 0) {
          const sortedClusters = Object.entries(clusterScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => this.cluster_names[entry[0]] || entry[0]);
          this.recommendedClusters = sortedClusters;
        }
  
        // Сохранение результатов в localStorage
        localStorage.setItem('recommendedClusters', JSON.stringify(this.recommendedClusters));
  
        this.isTesting = false;
        this.isTestFinished = true;
      },
      navigateToRecommendations() {
        // Перенаправление на страницу рекомендаций
        this.$router.push('/');
      },
      restartTest() {
        this.isTestFinished = false;
        this.isTesting = false;
        this.responses = [];
        this.recommendedClusters = [];
        // Удаление сохранённых результатов
        localStorage.removeItem('recommendedClusters');
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    font-family: 'Montserrat', sans-serif;
  }
  
  .profile-card {
    border-radius: 12px;
    font-family: 'Montserrat', sans-serif;
    background-color: #ffffff;
  }
  
  .profile-info h2 {
    font-weight: 600;
    letter-spacing: 0;
    margin-bottom: 4px;
  }
  
  .profile-info p {
    font-weight: 300;
    line-height: 1.4em;
    margin: 0;
  }
  
  .test-step-title {
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .test-instructions {
    font-weight: 300;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .question-card {
    border-radius: 12px;
    background: #f9f9f9;
    font-weight: 300;
  }
  
  .question-text {
    font-weight: 500;
    margin-bottom: 10px;
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  
  .test-finished {
    text-align: center;
  }
  
  .test-completed-msg {
    font-weight: 300;
    margin-bottom: 20px;
  }
  </style>
  