import {createRouter, createWebHistory} from 'vue-router';

import LoginView from '../views/LoginView.vue';
import UserView from '../views/UserView.vue';
import AdminView from '../views/AdminView.vue';
import AdminSettingsView from '../views/AdminSettingsView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import CourseDetail from '../views/CourseDetail.vue';
import RequestView from '../views/RequestView.vue';
import NotFoundView from '../views/NotFoundView.vue'


const routes = [
    {
        path: '/',
        name: 'UserView',
        component: UserView,
        meta: {requiresAuth: true, role: 'user'},
    },
    // Страница логина
    {
        path: '/login',
        name: 'LoginView',
        component: LoginView,
    },
    // Админская панель
    {
        path: '/admin',
        name: 'AdminView',
        component: AdminView,
        meta: {requiresAuth: true, role: 'admin'},
    },

    {
        path: '/admin/settings',
        name: 'AdminSettingsView',
        component: AdminSettingsView,
        meta: {requiresAuth: true, role: 'admin'},
    },
    {
        path: '/profile',
        name: 'UserProfileView',
        component: UserProfileView,
        meta: {requiresAuth: true, role: 'user'},
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/courses/:id',
        name: 'CourseDetail',
        component: CourseDetail,
        props: true,
        meta: {requiresAuth: true, role: 'user'},
    },
    {
        path: '/requests',
        name: 'RequestView',
        component: RequestView,
        meta: {requiresAuth: true, role: 'user'}
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('role');

    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/login');
    }

    if (to.meta.role && to.meta.role !== userRole) {
        if (userRole === 'admin') {
            return next('/admin');
        }
        return next('/');
    }

    next();
});


export default router;
