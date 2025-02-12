<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Запрашиваемый вами ресурс не существует или был перемещён</p>
      <router-link to="/" class="home-link">На главную</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
  text-align: center;
  padding: 2rem;
}

.content {
  max-width: 600px;
}

h1 {
  font-size: 8rem;
  color: #2c3e50;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #34495e;
  margin: 1rem 0;
}

p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.home-link:hover {
  background: #2980b9;
}
</style>