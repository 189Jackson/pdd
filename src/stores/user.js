import { defineStore } from 'pinia'
import { getUserInfo } from '../api/user'

// 第一个参数必须是全局唯一
export const userStore = defineStore('userInfo', {
    state: () => ({
        userInfo: null,
    }),
    actions: {
        getUser() {
            if (this.userInfo) {
                return
            }
            // getUserInfo().then(res => {
            //     this.userInfo = res
            // })
        }
    },
})