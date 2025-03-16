import {createRouter, createWebHistory} from 'vue-router';

import LoginView from '../views/LoginView.vue';
import UserMainView from '../views/UserMainView.vue';
import AdminView from '../views/AdminView.vue';
import AdminRequestsView from '../views/AdminRequestsView.vue';
import AdminSettingsView from '../views/AdminSettingsView.vue';
import UserProfileView from '../views/UserProfileView.vue';
import CourseDetail from '../views/CourseDetail.vue';
import UserRequestView from '../views/UserRequestView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import UserStatisticView from '../views/UserStatisticView.vue';

const routes = [
    {
        path: '/',
        name: 'UserMainView',
        component: UserMainView,
        meta: {requiresAuth: true, role: 'user'},
    },
    {
        path: '/login',
        name: 'LoginView',
        component: LoginView,
    },
    {
        path: '/admin',
        name: 'AdminView',
        component: AdminView,
        meta: {requiresAuth: true, role: 'admin'},
    },
    {
        path:'/statistics',
        name:'UserStatisticView',
        component: UserStatisticView,
    },
    {
        path: '/admin/settings',
        name: 'AdminSettingsView',
        component: AdminSettingsView,
        meta: {requiresAuth: true, role: 'admin'},
    },
    {
        path: '/admin/requests',
        name: 'AdminRequestsView',
        component: AdminRequestsView,
        meta: {requiresAuth: true, role: 'admin'},
    },
    {
        path: '/profile',
        name: 'UserProfileView',
        component: UserProfileView,
        meta: {requiresAuth: true, role: 'user'},
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
        component: UserRequestView,
        meta: {requiresAuth: true, role: 'user'}
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFoundView,
        meta: {
            requiresAuth: false
        }
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
