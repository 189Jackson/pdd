<template>
    <div class="home__menu">
        <div v-for="item in menus" class="home__item" @click="linkTo(item)">
            <div class="home__item__icon">
                {{ item.name }}
            </div>
        </div>
    </div>

</template>

<script setup>
    import { userStore } from '@/stores/user';
    import { onMounted, computed, ref } from 'vue';
    import { useRouter } from "vue-router";
    const router = useRouter();

    const user = ref({})
    const menus = ref([])

    onMounted(() => {
    });

    const store = userStore();
    const { userInfo } = store;
    user.value = userInfo;

    const computedUser = computed(() => {
        const store = userStore();
        const { userInfo } = store;
        return userInfo;
    })


    menus.value = [
        {
            name: 'excel表格',
            path: '/excel'
        },
        {
            name: '算账',
            path: '/calc'
        },
    ]

    const linkTo = (item) => {
        router.push({
            path: item.path
        })
    }


</script>

<style scoped lang="scss">
.home{
    &__menu{
        margin:0 auto;
        width: 200px;
        padding-top: 50px;
        display: flex;
        justify-content: space-between;
    }
    &__item{
        &__icon{
            background: #ddd;
            color: rgb(0, 187, 255);
            cursor: pointer;
            display: inline;
            padding: 6px 12px;
            border-radius: 6px;
        }
    }
}
</style>