<template>
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card color="primary">
            <v-card-title class="justify-center">
              <v-img src="@/assets/logo.png" alt="Логотип" max-height="60"></v-img>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="requestVerificationCode">
                <v-text-field
                  bg-color="white"
                  label="Студенческая почта"
                  v-model="email"
                  prepend-inner-icon="mdi-email"
                  required
                ></v-text-field>
                <v-btn color="secondary" type="submit" class="mt-4" block>Получить код</v-btn>
                <v-alert
                  v-if="error"
                  type="error"
                  class="mt-3"
                  border="left"
                  prominent
                >
                  {{ error }}
                </v-alert>
              </v-form>
              <v-form v-if="codeSent" @submit.prevent="verifyCode">
                <v-text-field
                  bg-color="white"
                  label="Код подтверждения"
                  v-model="verificationCode"
                  prepend-inner-icon="mdi-key"
                  required
                ></v-text-field>
                <v-btn color="secondary" type="submit" class="mt-4" block>Войти</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import authApi from '@/api/auth';

  
  export default {
    name: 'LoginView',
    data() {
      return {
        email: '',
        verificationCode: '',
        codeSent: false,
        error: null,
      };
    },
    methods: {
      async requestVerificationCode() {
        try {
          const response = await authApi.sendOtp(this.email);
          if (response.data.success) {
            this.codeSent = true;
            this.error = null;
          } else {
            this.error = 'Не удалось отправить код. Пожалуйста, попробуйте снова.';
          }
        } catch (err) {
          this.error = 'Ошибка при отправке запроса. Пожалуйста, попробуйте снова.';
        }
      },
      async verifyCode() {
        try {
          const response = await authApi.verifyOtp(this.email, this.verificationCode);
          if (response.data.success) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('role', response.data.role);
            this.$router.push(response.data.redirectUrl);
          } else {
            this.error = 'Неверный код подтверждения. Пожалуйста, попробуйте снова.';
          }
        } catch (err) {
          this.error = 'Ошибка при проверке кода. Пожалуйста, попробуйте снова.';
        }
      },
    },
  };
  </script>