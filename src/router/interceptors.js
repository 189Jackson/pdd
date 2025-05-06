import router from '../router'
import { userStore } from '@/stores/user';

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }

    userStore && userStore().getUser()

    if (to.meta.isNotAuth) { // 不需要登录的页面
        next()
        return
    }
    // if (localStorage.getItem('token')) {
    //     next()
    //     return
    // }
    // next('/login')
})
