<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card color="primary">
          <v-card-title class="justify-center">
            <!-- Логотип вместо текста -->
            <v-img src="@/assets/logo.png" alt="Логотип" max-height="60"></v-img>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field bg-color="white"
                label="Имя пользователя"
                v-model="username"
                prepend-inner-icon="mdi-account"
                required
              ></v-text-field>

              <v-text-field bg-color="white"
                label="Пароль"
                v-model="password"
                type="password"
                prepend-inner-icon="mdi-lock"
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
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: null,
    };
  },
  methods: {
    login() {
      if (this.username === 'admin' && this.password === 'admin') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'admin');
        this.$router.push('/admin');
      } else if (this.username === 'user' && this.password === 'user') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'user');
        this.$router.push('/profile');
      } else {
        this.error = 'Неверные имя пользователя или пароль';
      }
    },
  },
};
</script>

<style scoped>

</style>
