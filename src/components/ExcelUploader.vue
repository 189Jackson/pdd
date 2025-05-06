<template>
  <div>
    <input type="file" @change="beforeUpload" accept="*" />
    <p v-if="loading">解析中...</p>
    <!-- 添加图片显示部分 -->
    <div v-for="(image, index) in imageList" :key="index">
      <!-- <img :src="`data:image/png;base64,${image}`" alt="Excel Image" /> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import JSZip from "jszip"; // 引入jszip
import * as XLSX from "xlsx"; // 引入xlsx
import { saveAs } from "file-saver"; // 引入file-saver

const loading = ref(false);

const tableColumnLabel = ref([]); // 获取表头内容
const tableData = ref([]); // 表格数据
const imageList = ref([]); // 表格图片

// 加载按钮的回调
async function beforeUpload(event) {
  const file = event.target.files[0];
  console.log(11111, file)
  // 解析图片
  imageList.value = await getExcelImage(file);
 
  // 解析数据
  getExcelData(file);
}

// 解析数据
function getExcelData(file) {
  let fileReader = new FileReader(); // 构建fileReader对象
 
  fileReader.readAsArrayBuffer(file); // 读取指定文件内容
 
  // 读取操作完成时
  fileReader.onload = function (e) {
    try {
      let data = e.target.result; // 取得数据data
 
      let workbook = XLSX.read(data, { type: "binary" }); // 将data转换成excel工作表数据
 
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // 获取第一个工作表
 
      const sheetlist = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
 
      // 封装数据
      formatDate(sheetlist);
    } catch (e) {
      console.log("文件类型不正确");
      return;
    }
  };
}

function excelDateToJSDate(excelDate) {
  // Excel 1900年1月1日是第1天，但1900年不是闰年，Excel错误地认为1900年2月29日是有效日期
  // 因此，从1900年3月1日开始的时间戳需要减去1天
  const date = new Date(Math.round((excelDate - (excelDate > 60 ? 25569 : 25568)) * 86400 * 1000));
  // 调整日期以修正时间计算错误
  date.setHours(date.getHours() - 8); // 假设Excel时间戳是UTC时间，需要减去8小时以转换为东八区时间
  return date.toLocaleString(); // 根据用户的本地设置格式化日期和时间
}

function formatDate(sheetlist) {
  try {
    if (sheetlist.length < 1) return;
    tableColumnLabel.value = sheetlist[0]; // 获取表格列名

    for (let i = 0; i < sheetlist.length - 1; i++) {
      let obj = {};
      for (let j = 0; j < sheetlist[0].length; j++) {
        if (typeof sheetlist[i + 1][j] === 'number' && sheetlist[i + 1][j] > 1) {
          obj[sheetlist[0][j]] = excelDateToJSDate(sheetlist[i + 1][j]);
        } else {
          obj[sheetlist[0][j]] = sheetlist[i + 1][j] ?? "";
        }
      }
      tableData.value.push(obj);
    }
    console.log("tableData.value", tableData.value);
    // 导出文件夹
    exportFolders();
  } catch (error) {
    console.error("数据封装失败:", error); // 更详细的错误信息
    return;
  }
}

// 获取图片
async function getExcelImage(file) {
  let imageList = [];
  const zip = new JSZip();

  try {
    let zipLoadResult = await zip.loadAsync(file);

    // 遍历所有文件，确保获取所有图片
    for (const key in zipLoadResult.files) {
      if (key.includes("media/image") && !zipLoadResult.files[key].dir) {
        const base64Image = await zipLoadResult.files[key].async("base64");
        imageList.push(base64Image);
      }
    }
  } catch (error) {
    console.log(error);
  }
  return imageList;
}

// 导出文件夹
async function exportFolders() {
  const zip = new JSZip();
  tableData.value.forEach((item, index) => {
    const folderName = item.name;
    const folder = zip.folder(folderName);
    const imageName = `${item.name}_${item.width}x${item.height}.png`;
    folder.file(imageName, imageList.value[index], { base64: true });
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "exported_folders.zip");
  });
}
</script>