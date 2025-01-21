<template>
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card color="primary">
            <v-card-title class="justify-center">
              <v-img src="@/assets/logo.png" alt="Логотип" max-height="60"></v-img>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="login">
                <v-text-field
                  bg-color="white"
                  label="Логин"
                  v-model="loginInput"
                  prepend-inner-icon="mdi-account"
                  required
                ></v-text-field>
                <v-text-field
                  bg-color="white"
                  label="Пароль"
                  v-model="password"
                  prepend-inner-icon="mdi-lock"
                  type="password"
                  required
                ></v-text-field>
                <v-btn color="secondary" type="submit" class="mt-4" block>Войти</v-btn>
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
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import authApi from '@/api/auth';
  
  export default {
    name: 'AdminLoginView',
    data() {
      return {
        loginInput: '',
        password: '',
        error: null,
      };
    },
    methods: {
      async login() {
        try {
          const response = await authApi.superUserLogin(this.loginInput, this.password);
          if (response.data.success) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('role', 'admin');
            this.$router.push('/admin');
          } else {
            this.error = 'Неверный логин или пароль. Пожалуйста, попробуйте снова.';
          }
        } catch (err) {
          this.error = 'Ошибка при входе. Пожалуйста, попробуйте снова.';
        }
      },
    },
  };
  </script>