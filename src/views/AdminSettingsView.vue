<template>
  <v-container>
    <v-card>
      <v-tabs v-model="activeTab" background-color="primary" dark>
        <v-tab value="general">Основные</v-tab>
        <v-tab value="data-upload">Загрузка данных</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab">
        <v-tab-item value="general">
          <!-- Содержимое вкладки "Основные" -->
        </v-tab-item>
        <v-tab-item value="data-upload">
          <v-card-text>
            <v-form ref="form">
              <!-- Загрузка первого файла -->
              <v-file-input
                  label="Загрузить файл (.xlsx)"
                  accept=".xlsx"
                  prepend-inner-icon="mdi-upload"
                  @change="handleFileUpload($event)"
                  :disabled="isLoading"
              ></v-file-input>

              <!-- Пустышка для второго файла -->
              <v-text-field
                  label="Информация о втором файле"
                  readonly
                  hint="Этот файл не требуется."
                  persistent-hint
              ></v-text-field>

              <!-- Кнопка загрузки -->
              <v-btn
                  color="primary"
                  @click="uploadFile"
                  class="mt-4"
                  :loading="isLoading"
                  :disabled="!selectedFile"
              >
                Загрузить
              </v-btn>

              <!-- Анимация загрузки и статус -->
              <div v-if="isLoading" class="mt-4">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    width="2"
                ></v-progress-circular>
                <span class="ml-2">Загрузка...</span>
              </div>

              <!-- Успешная загрузка -->
              <div v-if="isSuccess" class="mt-4">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span class="ml-2">Файл успешно загружен!</span>
              </div>
            </v-form>
          </v-card-text>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminSettingsView',
  data() {
    return {
      activeTab: 'data-upload',
      selectedFile: null,
      isLoading: false,
      isSuccess: false,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.isSuccess = false; // Сбрасываем статус успеха при выборе нового файла
    },
    async uploadFile() {
      if (!this.selectedFile) {
        alert('Пожалуйста, выберите файл.');
        return;
      }
      this.isLoading = true;
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        console.log(this.selectedFile);
        console.log(formData)
        const response = await axios.post(
            `${process.env.VUE_APP_API_URL}/upload/student-choices`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
        );

        if (response.status === 200) {
          this.isSuccess = true;
        } else {
          alert('Ошибка при загрузке файла.');
        }
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        alert('Произошла ошибка при загрузке файла. Попробуйте еще раз.');
      } finally {
        this.isLoading = false;
      }
    }
  },
};
</script>

<style scoped>
</style>