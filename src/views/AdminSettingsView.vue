<template>
  <v-container>
    <v-card>
      <v-tabs v-model="activeTab" background-color="primary" dark>
        <v-tab>Журнал</v-tab>
        <v-tab>Загрузка данных</v-tab>
      </v-tabs>

      <v-card-text>
        <!-- Вкладка журнала -->
        <div v-show="activeTab === 0">
          <v-data-table
            :headers="headers"
            :items="journalData"
            hide-default-footer
            class="elevation-1"
          >
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Журнал</v-toolbar-title>
              </v-toolbar>
            </template>
            <template v-slot:[`item.created_at`]="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
          </v-data-table>
        </div>

        <!-- Вкладка загрузки данных -->
        <div v-show="activeTab === 1">
          <v-form ref="form">
            <!-- Загрузка student-choices -->
            <v-card class="mb-4">
              <v-card-title>Загрузка файла для student-choices</v-card-title>
              <v-card-text>
                <v-file-input
                  label="Выберите файл (.xlsx)"
                  accept=".xlsx"
                  prepend-inner-icon="mdi-upload"
                  @change="handleFileUpload($event)"
                  :disabled="isLoadingStudent"
                />
                <v-btn
                  color="primary"
                  class="mt-4"
                  :loading="isLoadingStudent"
                  :disabled="!selectedFile"
                  @click="uploadStudentFile"
                >
                  Загрузить
                </v-btn>
                <div v-if="isLoadingStudent" class="mt-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    width="2"
                  />
                  <span class="ml-2">Загрузка...</span>
                </div>
                <div v-if="isSuccessStudent" class="mt-4">
                  <v-icon color="success">mdi-check-circle</v-icon>
                  <span class="ml-2">Файл успешно загружен!</span>
                </div>
              </v-card-text>
            </v-card>

            <!-- Загрузка courses-info -->
            <v-card>
              <v-card-title>Загрузка файла для courses-info</v-card-title>
              <v-card-text>
                <v-file-input
                  label="Выберите файл (.xlsm)"
                  accept=".xlsm"
                  prepend-inner-icon="mdi-upload"
                  @change="handleFileUpload2($event)"
                  :disabled="isLoadingCourses"
                />
                <v-btn
                  color="primary"
                  class="mt-4"
                  :loading="isLoadingCourses"
                  :disabled="!selectedFile2"
                  @click="uploadCoursesFile"
                >
                  Загрузить
                </v-btn>
                <div v-if="isLoadingCourses" class="mt-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    width="2"
                  />
                  <span class="ml-2">Загрузка...</span>
                </div>
                <div v-if="isSuccessCourses" class="mt-4">
                  <v-icon color="success">mdi-check-circle</v-icon>
                  <span class="ml-2">Файл успешно загружен!</span>
                </div>
              </v-card-text>
            </v-card>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
/* eslint-disable */
import axiosInstance from "@/axios/axios";

export default {
  name: "AdminSettingsView",
  data() {
    return {
      activeTab: "general",
      journalData: [],
      headers: [
        { title: "ID", key: "id" },
        { title: "Статус", key: "status" },
        { title: "Дата создания", key: "created_at" },
        { title: "Тип", key: "type" },
        { title: "Сообщение", key: "message" },
      ],
      // Файл для student-choices
      selectedFile: null,
      isLoadingStudent: false,
      isSuccessStudent: false,
      // Файл для courses-info
      selectedFile2: null,
      isLoadingCourses: false,
      isSuccessCourses: false,
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    async fetchJournalData() {
      try {
        const response = await axiosInstance.get("/journal");
        this.journalData = response.data;
      } catch (error) {
        console.error("Ошибка при получении данных журнала:", error);
      }
    },
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.isSuccessStudent = false;
    },
    handleFileUpload2(event) {
      this.selectedFile2 = event.target.files[0];
      this.isSuccessCourses = false;
    },
    async uploadStudentFile() {
      if (!this.selectedFile) {
        alert("Пожалуйста, выберите файл для загрузки.");
        return;
      }
      this.isLoadingStudent = true;
      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile);
        const response = await axiosInstance.post(
          "/upload/student-choices",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.status === 200) {
          this.isSuccessStudent = true;
        } else {
          alert("Ошибка при загрузке файла.");
        }
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        alert("Произошла ошибка при загрузке файла. Попробуйте еще раз.");
      } finally {
        this.isLoadingStudent = false;
      }
    },
    async uploadCoursesFile() {
      if (!this.selectedFile2) {
        alert("Пожалуйста, выберите файл для загрузки.");
        return;
      }
      this.isLoadingCourses = true;
      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile2);
        const response = await axiosInstance.post(
          "/upload/courses-info",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.status === 200) {
          this.isSuccessCourses = true;
        } else {
          alert("Ошибка при загрузке файла.");
        }
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        alert("Произошла ошибка при загрузке файла. Попробуйте еще раз.");
      } finally {
        this.isLoadingCourses = false;
      }
    },
  },
  mounted() {
    this.fetchJournalData();
  },
};
</script>

<style scoped></style>
