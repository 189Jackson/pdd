<template>
  <div class="excel-view">
    <ExcelUploader2 />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ExcelUploader2 from './components/ExcelUploader0.vue';
// import ExcelUploader2 from '@/components/ExcelUploader.vue';

const type = ref(1);
</script>

<style scoped lang="scss">
.excel-view {
  padding: 20px;
  background-color: #f9f9f9;
}
</style>