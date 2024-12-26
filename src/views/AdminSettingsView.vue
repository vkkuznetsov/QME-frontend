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
              <v-file-input
                label="Загрузить файл 1"
                accept=".csv"
                prepend-inner-icon="mdi-upload"
                @change="handleFileUpload(1, $event)"
              ></v-file-input>

              <v-file-input
                label="Загрузить файл 2"
                accept=".csv"
                prepend-inner-icon="mdi-upload"
                @change="handleFileUpload(2, $event)"
              ></v-file-input>

              <v-btn color="primary" @click="uploadFiles" class="mt-4"
                >Загрузить</v-btn
              >
            </v-form>

            <div v-if="uploadedFiles.length">
              <v-divider class="my-4"></v-divider>
              <v-list>
                <v-list-item
                  v-for="(file, index) in uploadedFiles"
                  :key="index"
                >
                  <v-list-item-avatar>
                    <v-icon color="primary">mdi-file</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-title>{{ file.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AdminSettingsView',
  data() {
    return {
      activeTab: 'data-upload',
      uploadedFiles: [],
      selectedFiles: {},
    };
  },
  methods: {
    handleFileUpload(fileIndex, event) {
      const file = event;
      if (file) {
        this.$set(this.selectedFiles, fileIndex, file);
      }
    },
    uploadFiles() {
      for (let key in this.selectedFiles) {
        const file = this.selectedFiles[key];
        if (file && file.type === 'text/csv') {
          this.uploadedFiles.push(file);
          this.$emit('file-uploaded', { fileIndex: key, file });
        } else {
          this.$refs.form.resetValidation();
          alert('Пожалуйста, загрузите только CSV файлы.');
        }
      }
      this.selectedFiles = {};
    },
  },
};
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style>
