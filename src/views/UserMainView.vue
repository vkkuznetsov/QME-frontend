<template>
  <div>
    <div v-if="recommendedCourses.length">
      <h2 class="section-title">Мои рекомендации</h2>
      <v-row>
        <v-col
          v-for="course in recommendedCourses"
          :key="'rec-' + course.id"
          cols="16"
          sm="3"
          md="3"
          lg="3"
        >
          <CourseCard :course="course" />
        </v-col>
      </v-row>
    </div>
    <h2 class="section-title">Все элективные курсы</h2>

    <!-- Filters -->
    <v-card class="filters-card pt-4 px-4 pb-0">
      <v-row class="align-center">
        <v-col cols="12" md="6">
          <v-text-field
            variant="outlined"
            v-model="searchQuery"
            label="Поиск по названию или описанию"
            placeholder=" "
            prepend-inner-icon="mdi-magnify"
            clearable
            single-line
            depressed
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            variant="outlined"
            v-model="selectedCluster"
            :items="allClusterItems"
            label="Область знаний"
            placeholder=" "
            outlined
            clearable
            single-line
            prepend-inner-icon="mdi-school-outline"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete
            variant="outlined"
            v-model="selectedTeacher"
            :items="allTeacherItems"
            :search-input.sync="teacherSearch"
            :filter="customFilter"
            label="Преподаватель"
            outlined
            clearable
            single-line
            prepend-inner-icon="mdi-account"
          />
        </v-col>
      </v-row>

      <v-row class="align-center mt-4">
        <v-col cols="12" md="3">
          <v-select
            variant="outlined"
            v-model="selectedDays"
            :items="sortedDayItems"
            label="День недели"
            outlined
            multiple
            chips
            clearable
            single-line
            v-ripple.stop
            prepend-inner-icon="mdi-calendar-month-outline"
          />
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center">
          <v-checkbox
            v-model="showOnlyAvailable"
            label="Только со свободными местами"
            class="mr-4"
            :ripple="false"
          />
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn
            variant="text"
            outlined
            @click="resetFilters"
            :ripple="false"
          >
            Сбросить фильтры
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Course list -->
    <v-row>
      <v-col
        v-for="course in paginatedCourses"
        :key="course.id"
        cols="16"
        sm="3"
        md="3"
        lg="3"
      >
        <CourseCard :course="course" />
      </v-col>
    </v-row>

    <!-- Pagination -->
    <div class="pagination">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        total-visible="7"
        color="primary"
        @input="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axiosInstance from '@/axios/axios'
import CourseCard from '@/components/CourseCard.vue'

const recommendedCourses = ref([])

const fetchRecommendedCourses = async () => {
  try {
    const email = localStorage.getItem('userEmail')
    const studentInfo = await axiosInstance.get('/student_info', { params: { email } })
    const studentId = studentInfo.data.id
    const recommendationRes = await axiosInstance.get(`/recomendation/recommendation/${studentId}`)
    recommendedCourses.value = recommendationRes.data.recommendations || []
  } catch (error) {
    console.error('Ошибка загрузки рекомендаций:', error)
  }
}

/* -------------------------------------------------------------------------- */
/* Reactive state                                                             */
/* -------------------------------------------------------------------------- */

const courses = ref([])
const searchQuery = ref('')
const selectedCluster = ref(null)
const selectedTeacher = ref(null)
const teacherSearch = ref('')
const selectedDays = ref([])
const showOnlyAvailable = ref(false)

const currentPage = ref(1)
const itemsPerPage = ref(16)

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const dayOrder = {
  Понедельник: 1,
  Вторник: 2,
  Среда: 3,
  Четверг: 4,
  Пятница: 5,
  Суббота: 6,
  Воскресенье: 7,
}

/* -------------------------------------------------------------------------- */
/* Data fetching                                                              */
/* -------------------------------------------------------------------------- */

const fetchCourses = async () => {
  try {
    const { data } = await axiosInstance.get('/all_elective')
    courses.value = data
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error)
  }
}

onMounted(() => {
  fetchCourses()
  fetchRecommendedCourses()
})

/* -------------------------------------------------------------------------- */
/* Derived data                                                               */
/* -------------------------------------------------------------------------- */

const allClusterItems = computed(() =>
  [...new Set(courses.value.map(({ cluster }) => cluster).filter(Boolean))],
)

const allTeacherItems = computed(() =>
  [...new Set(courses.value.flatMap(({ teachers = [] }) => teachers).filter(Boolean))],
)

const allDayItems = computed(() =>
  [...new Set(courses.value.flatMap(({ days = [] }) => days).filter(Boolean))],
)

const sortedDayItems = computed(() =>
  allDayItems.value.sort((a, b) => dayOrder[a] - dayOrder[b]),
)

const customFilter = (item, query) =>
  item.toLowerCase().includes(query.toLowerCase())

const filteredCourses = computed(() =>
  courses.value.filter((course) => {
    const searchMatch =
      !searchQuery.value ||
      `${course.name} ${course.description || ''}`
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    const clusterMatch =
      !selectedCluster.value || course.cluster === selectedCluster.value

    const teacherMatch =
      !selectedTeacher.value ||
      (course.teachers || []).includes(selectedTeacher.value)

    const availableMatch =
      !showOnlyAvailable.value || course.free_spots > 0

    const daysMatch =
      selectedDays.value.length === 0 ||
      (course.days || []).some((day) => selectedDays.value.includes(day))

    return (
      searchMatch &&
      clusterMatch &&
      teacherMatch &&
      availableMatch &&
      daysMatch
    )
  }),
)

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCourses.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(filteredCourses.value.length / itemsPerPage.value),
)

/* -------------------------------------------------------------------------- */
/* Methods                                                                    */
/* -------------------------------------------------------------------------- */

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCluster.value = null
  selectedTeacher.value = null
  teacherSearch.value = ''
  selectedDays.value = []
  showOnlyAvailable.value = false
  currentPage.value = 1
}
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- Styles                                                                   -->
<!-- ----------------------------------------------------------------------- -->
<style scoped>
.section-title {
  margin-top: 5vh;
  margin-bottom: 5vh;
  font-family: 'Montserrat', sans-serif !important;
  font-size: 37px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-align: justify;
  color: rgba(0, 0, 0, 0.6);
}

.filters-card {
  margin-bottom: 5vh;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 16px 0;
}

@media (max-width: 600px) {
  .section-title {
    font-size: 1.1rem;
  }
}

/* ------------------------------------------------------------------------ */
/* Typography                                                               */
/* ------------------------------------------------------------------------ */
.filters-card,
.filters-card .v-text-field,
.filters-card .v-select,
.filters-card .v-checkbox,
.filters-card .v-autocomplete,
.filters-card .v-btn,
.filters-card .v-input__slot,
.filters-card .v-label,
.filters-card .v-text-field input,
.filters-card .v-select .v-input__slot,
.filters-card .v-autocomplete .v-input__slot {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.5px !important;
  color: rgba(0, 0, 0, 0.7) !important;
}
</style>