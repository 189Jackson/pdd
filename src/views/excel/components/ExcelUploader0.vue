<template>
  <div>
    <div style="display: flex">
      <el-upload
        action=""
        :before-upload="beforeUpload"
        :http-request="() => {}"
      >
        <el-button type="primary" style="width: 150px; margin-right: 20px"
          >导入excel</el-button
        >
      </el-upload>
      <div v-if="tableData?.length" style="margin-right: 12px">
        {{ tableData?.length }}条
      </div>
      <el-button type="" @click="resetName">整理收货信息</el-button>
      <el-button type="" @click="resetSize">整理尺寸</el-button>
      <!-- <el-button type="" @click="clearTable">清空</el-button> -->
      <!-- <el-button type="primary" @click="handleSave">保存</el-button> -->
      <!-- <el-button type="" @click="getTable">导入上一次保存的数据</el-button> -->
      <el-button type="warning" @click="exportFolders">导出图片</el-button>
      <el-button type="danger" @click="exportExcel">导出excel</el-button>
      <el-button type="danger" @click="exportFolders2">导出图片(分文件夹)</el-button>
    </div>

    <!-- 表格组件 -->
    <el-table
      :data="tableData"
      style="width: 100%; height: calc(100vh - 130px)"
      border
      size="small"
    >
      <el-table-column prop="" label="" width="43">
        <template #default="scope">
          {{ scope?.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="订单号" width="160" />
      <el-table-column prop="receivingInfo" label="收货信息" width="200">
        <template #default="scope">
          <el-input
            v-model="scope.row.receivingInfo"
            :rows="2"
            type="textarea"
            style="width: 180px"
            placeholder=""
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="收货人姓名" width="150">
        <template #default="scope">
          <el-input
            v-model="scope.row.name"
            style="width: 120px"
            placeholder="姓名"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="合并订单" width="80">
        <template #default="scope">
          <span :class="scope.row.combine> 1 ? 'excel--combine': ''">{{scope.row.combine}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机" width="150px">
        <template #default="scope">
          <el-input
            v-model="scope.row.phone"
            style="width: 120px"
            placeholder="手机"
          />
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" width="175px">
        <template #default="scope">
          <el-input
            v-model="scope.row.address"
            :rows="2"
            type="textarea"
            style="width: 150px"
            placeholder="地址"
          />
        </template>
      </el-table-column>

      <el-table-column label="图片" width="150">
        <template #default="scope">
          <div style="text-align: center">
            <el-upload
              action=""
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="() => {}"
              drag
              :before-upload="(file) => beforeUploadAvata(file, scope)"
            >
              <div style="width: 40px; height: 40px; display: inline">
                拖拽或<em>点击</em>
              </div>
            </el-upload>
            <el-image
              v-if="scope.row.url"
              style="width: 60px; height: 60px"
              :src="scope.row.url"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[scope.row.url]"
              show-progress
              :initial-index="4"
              fit="cover"
              :preview-teleported="true"
              :hide-on-click-modal="true"
            />
            <span v-if="!scope.row.url" :class="!scope.row.url ? 'excel--imglot':''">缺失图片</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="specification" label="规格" width="150" />
      <el-table-column prop="size" label="尺寸" width="130px">
        <template #default="scope">
          <el-input
            v-model="scope.row.size"
            style="width: 110px"
            placeholder="尺寸"
          />
        </template>
      </el-table-column>
      <el-table-column prop="productId" label="商品Id" width="120" />
      <el-table-column prop="remark1" label="商家备注" width="130" />
      <el-table-column prop="remark2" label="买家留言" width="130" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import _ from "lodash";

import img2 from '@/assets/img/699515039791/40x60/14.jpg'


const loading = ref(false);
const tableColumnLabel = ref([]); // 获取表头内容
const tableData = ref([]); // 表格数据
const imageUrl = ref("");

// 节省存储，同样的sku布局，用同一个商品的
const combineProduceId = [
  {
    fid: '699415628492',
    name: 'jennie卖的最好的那个',
    cid: [
      "702951870835",
      "702941400384",
      "712139847111",
      "710137766700",
      "712133828391",
      "715590403653",
      "706349366894",
      "699415628492",
      "702954420184",
      "711132205139",
      "715606833207",
      "705397884439",
      "704000276779",
      "720239332622",
      "713595489937",
      "713601836453",
      "712143210321",
    ]
  },
  {
    fid: '700295751712',
    name: 'bigbang老款',
    cid: [
      "699515039791",
      "704427225594",
      "704430820244",
      "707223377686",
    ]
  },
]

// 单个图片上传
const beforeUploadAvata = (file, scope) => {
  const url = URL.createObjectURL(file);
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Url = e.target.result; // 将文件转换为Base64
    scope.row.url = base64Url;
  };
  reader.readAsDataURL(file); // 读取文件为Base64
};

// 将excel表格数据封装成json数组
function formatDate(sheetlist) {
  try {
    if (sheetlist.length < 1) return;
    tableColumnLabel.value = sheetlist[0]; // 获取表格列名
    for (let i = 1; i < sheetlist.length - 1; i++) {
      let obj = {};
      for (let j = 0; j < sheetlist[1].length; j++) {
        obj[sheetlist[1][j]] = sheetlist[i + 1][j] ?? "";
      }
      tableData.value.push(obj);
    }
    console.log("tableData.value", tableData.value);
    resetTableData()
  } catch (error) {
    console.error("数据封装失败:", error); // 更详细的错误信息
    return;
  }
}

// 格式化收货信息
const resetName = () => {
  const copyTableED = []
  tableData.value.forEach((item, index) => {
    const info = splitReceivingInfo(item.receivingInfo)
    item.name = info.name.trim();
    item.phone = info.phone.trim();
    item.address = info.address.trim();
    const isSister = copyTableED.find(itt => formatCity(item.address) == formatCity(itt?.address || '') && formatName(itt?.name.trim()).trim() == formatName(item.name.trim()).trim())
    if (isSister) {
      item.combine = 0
      const finx = tableData.value.findIndex(itt => isSister && formatCity(isSister.address) == formatCity(itt.address) && formatName(isSister.name.trim()) == formatName(itt.name.trim()))
      tableData.value[finx].combine+=1
    } else { // 有相同的
      copyTableED.push(item)
      item.combine = 1
    }
  });
};

// 格式化商品规格
const resetSize = () => {
  tableData.value.forEach((item, index) => {
    const size = extractDimension(item.specification)
    item.size = size.trim();
  });
};

// 取规格中的编号
function extractFirstNumber(str) {
  // 匹配第一个连续数字序列（不需要全局匹配）
  const match = str.match(/\d+/);

  if (!match) return ""; // 无数字时返回空字符串

  // 处理前导零（如 "04"→"4"，"00"→"0"）
  const cleaned = match[0].replace(/^0+/, '');
  return cleaned === '' ? '0' : cleaned;
}

// 核心转换函数
const convertImageToBase64 = async (imagePath) => {
  return new Promise(async (resolve, reject) => {
     try {
      // 步骤 1：获取图片 URL
      const imageUrl = new URL(`${imagePath}`, import.meta.url).href

      // 步骤 2：获取图片数据
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error(`HTTP 错误! 状态码: ${response.status}`)

      // 步骤 3：转换 Blob 为 Base64
      const blob = await response.blob()
      const base64 = await blobToBase64(blob)
      resolve(base64)
    } catch (err) {
      console.error('转换错误:', err)
    } finally {
      loading.value = false
    }
   })
}

// Blob 转 Base64 工具函数
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 获取图片并转换为Base64
const resizeImg = () => {
   tableData.value.forEach((item, index) => {
    //  Jennie-11,A1（84.1cm*59.4cm）
    const specification = item.specification.split(",")[0]
     const pid = item.productId.trim()
     const productId = combineProduceId.find(item => item.cid.includes(pid))?.fid || pid
     const pathImg = `../../../assets/img/${productId}/${item.size}/${extractFirstNumber(specification)}.jpg`
     // 动态获取路径的图片，不支持require语法
     convertImageToBase64(pathImg).then((base64) => {
      if (base64) {
        item.url = base64
      }
     })
   });
};

// 统一处理
const resetTableData = () => {
  resetName()
  resetSize()
  resizeImg()
};

// 匹配规格尺寸
function extractDimension(str) {
  const regex = /(\d+\.?\d*)(cm|厘米|米)?\s*[*x]\s*(\d+\.?\d*)(cm|厘米|米)?/i;
  const match = str.match(regex);
  if (!match) return '';
  // 解构匹配结果（注意索引位置）
  const [_, num1, unit1, num2, unit2] = match;
  // 检查单位有效性：两个单位必须同为 cm/厘米 或 无单位
  const hasMeter = [unit1, unit2].some(u => u === '米');
  const isValid = [unit1, unit2].every(u =>
    !u || ['cm', '厘米'].includes(u.toLowerCase())
  );
  return (hasMeter || !isValid) ? '' : `${num1}x${num2}`;
}

// 分割 ReceivingInfo 字段，将收货信息拆分成收货人姓名和手机号、地址三个字段
function splitReceivingInfo(info) {
  const phoneRegex = /1\d{10}/; // 匹配以1开头的11位手机号码
  const match = info.match(phoneRegex);
  if (match) {
    const phone = match[0];
    const name = info.substring(0, match.index);
    const address = info.substring(match.index + phone.length);
    return { name, phone, address };
  } else {
    return { name: '', phone: "", address: "" };
  }
}

// 导入excel
async function beforeUpload(file) {
  const reader = new FileReader();
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
      console.error("文件类型不正确或读取失败:", e); // 更详细的错误信息
      return;
    }
  };
}

// 保存到本地，再次获取（暂时不用）
const getTable = () => {
  const tableCopy = localStorage.getItem("excelData");
  if (tableCopy) {
    tableData.value = JSON.parse(tableCopy);
  }
};

// 清楚table
const clearTable = () => {
  tableData.value = [];
};

// 保存到本地
const handleSave = () => {
  localStorage.setItem("excelData", JSON.stringify(tableData.value));
};

// 获取省份
const formatCity = (address) => {
  return address.split(" ")[0]
}


// 导出图片文件夹(平铺)
async function exportFoldersPingpu() {
  // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const zip = new JSZip();
  const copyTable = _.cloneDeep(tableData.value);
  const qianTable = []
  copyTable.forEach((item, index) => {
    if (item.url) {
      const url2 = item.url.split(",")[1];
      item.image = url2;
    }
  });
  const folderName = `欢-${month}.${day}-图片`;
  const folder = zip.folder(folderName);
  copyTable.forEach((item, index) => {
    if (item.url && item.name) {
      // 解压缩图片数据
      const imageName = `${formatCity(item.address)}+${item.name}+${item.size}cm+pp背胶+1张(${Math.floor(Math.random()*10000000)}).jpg`;
      folder.file(imageName, item.image, { base64: true });
    }
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `欢-${month}.${day}-pp背胶-图片平铺.zip`);
  });
}

// 导出图片文件夹
async function exportFolders1() {
  // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const zip = new JSZip();
  const copyTable = _.cloneDeep(tableData.value);
  const qianTable = []
  copyTable.forEach((item, index) => {
    if (item.url) {
      const url2 = item.url.split(",")[1];
      item.image = url2;
    }
  });
  const copyTableED = []
  copyTable.forEach((item, index) => {
    if (item.url && item.name) {
      const isSister = copyTableED.some(itt => formatCity(item.address) == formatCity(itt?.address || '') && formatName(itt?.name.trim()).trim() == formatName(item.name.trim()).trim())
      if (!isSister) {
        copyTableED.push(item)
      }
    }
  });

  copyTableED.forEach((item, index) => {
      const folderName = `${item.name}+${item.combine}张+${item.address}`;
      const folder = zip.folder(folderName);
      copyTable.forEach(table => {
        const isSisterItem = formatCity(table.address) == formatCity(item.address) && formatName(table.name.trim()).trim() == formatName(item.name.trim()).trim()
        if (isSisterItem) {
          const imageName = `${table.size}cm(${Math.floor(Math.random()*10000000)}).jpg`;
          folder.file(imageName, table.image, { base64: true });
        }
      })
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `欢-${month}.${day}-pp背胶-按收货人分.zip`);
  });
}

// 导出图片,平铺，文件命名为备注（南京赵总）
async function exportImg() {
  // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const zip = new JSZip();
  const copyTable = _.cloneDeep(tableData.value);
  const qianTable = []
  copyTable.forEach((item, index) => {
    if (item.url) {
      const url2 = item.url.split(",")[1];
      item.image = url2;
    }
  });
  const remarkName = 'h0000'
  const copyTableED = []
  copyTable.forEach((item, index) => {
    if (item.url && item.name) {
      const isSisterItem1 = copyTableED.find(itt => formatCity(item.address) == formatCity(itt?.address || '') && formatName(itt?.name.trim()).trim() == formatName(item.name.trim()).trim())
      if (isSisterItem1) { // 有同名订单收货人，直接添加图片
        isSisterItem1.children.push({...item})
        // isSisterItem1.children.push({...item, remark: `${isSisterItem1.children[0].remark}(${isSisterItem1.children.length+1})`})
      } else {
        item.children = [{...item}]
        copyTableED.push(item)
      }
    }
  });
  copyTableED.forEach((it, ix) => {
    const fatherRemark = `【${remarkName}${ix+1}】`
    it.remark = fatherRemark
    it.children.forEach((item, index) => {
      item.remark = (it.children.length > 1) ? `${fatherRemark}(${index+1})`: fatherRemark
    })
  });
  console.log(1111111111, copyTableED) 
  const folderName = `图片平铺`;
  const folder = zip.folder(folderName);
  copyTableED.forEach((item, index) => {
      item.children.forEach(table => {
        const imageName = `${table.remark}+${table.size}cm+随机串(${Math.floor(Math.random()*10000000)}).jpg`;
        folder.file(imageName, table.image, { base64: true });
      })
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `欢-${month}.${day}-pp背胶.zip`);
  });

  exportExcelSizeDuoDuo(copyTableED)
}

// 导出图片文件夹
async function exportFolders2() {
  // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const zip = new JSZip();
  const copyTable = _.cloneDeep(tableData.value);
  const qianTable = []
  copyTable.forEach((item, index) => {
    if (item.url) {
      const url2 = item.url.split(",")[1];
      item.image = url2;
    }
  });
  const copyTableED = []
  copyTable.forEach((item, index) => {
    if (item.url && item.name) {
      const isSister = copyTableED.some(itt => formatCity(item.address) == formatCity(itt?.address || '') && formatName(itt?.name.trim()).trim() == formatName(item.name.trim()).trim())
      if (!isSister) {
        copyTableED.push(item)
      }
    }
  });

  copyTableED.forEach((item, index) => {
      const folderName = `${item.name}+${item.combine}张+${item.address}`;
      const folder = zip.folder(folderName);
      copyTable.forEach(table => {
        const isSisterItem = formatCity(table.address) == formatCity(item.address) && formatName(table.name.trim()).trim() == formatName(item.name.trim()).trim()
        if (isSisterItem) {
          const imageName = `${table.size}cm+室外写真+随机串(${Math.floor(Math.random()*10000000)}).jpg`;
          folder.file(imageName, table.image, { base64: true });
        }
      })
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `欢-${month}.${day}-室外写真.zip`);
  });
}

const exportFolders = () => {
  exportImg()
  // exportFoldersPingpu()
  // exportFolders1()
  // exportFolders2()
}


const exportExcelSizeDuoDuo = (tableDataExport) => {
  const worksheetData = [
    ["收件人(必填)", "手机号(必填)", "收货地址(必填)", "平台订单号（非必填）", "商品信息(非必填)", "规格信息(非必填)","商品数量(非必填)","重量kg(非必填)","备注(非必填)"]
  ];
  tableDataExport.forEach((row, index) => {
    worksheetData.push([
      row.name,
      row.phone,
      row.address,
      row.orderId,
      "",
      row.size,
      "",
      "",
      row.remark,
    ]);
  });
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

   // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `打印单${month}-${day}.xlsx`);
};

// 导出规格尺寸，自己算账用
const exportExcelSize = () => {
  const worksheetData = [
    ["收货人姓名", "手机", "地址", "尺寸", "规格", "订单号",]
  ];

  tableData.value.forEach((row, index) => {
    worksheetData.push([
      row.name,
      row.phone,
      row.address,
      row.size,
      row.specification,
      row.orderId,
    ]);
  });
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

   // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `完整数据${month}-${day}.xlsx`);
};

// 拆分姓名的[]   张三[0029] => 张三
const formatName = (name) => {
  return name.split('[')[0]
};

// 导出给老板的，可用作算运费（主要是去掉重复的收货人信息，针对同一个人下了多单的情况）
const exportExcelBoss = () => {
  const worksheetData = [
    ["收货人姓名", "手机", "地址"]
  ];
  tableData.value.forEach((row, index) => {
    if (!worksheetData.some(item => formatName(item[0]?.trim()).trim() == formatName(row.name.trim()).trim())) {
      worksheetData.push([
        row.name,
        row.phone,
        row.address,
      ]);
    }
  });
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });
   // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `运费${month}-${day}.xlsx`);
};

const exportExcelBoss2 = () => {
  const worksheetData = [
    ["收货人信息"]
  ];
  tableData.value.forEach((row, index) => {
    if (!worksheetData.some(item => formatName(item[0]?.trim()).trim() == formatName(row.name.trim()).trim())) {
      worksheetData.push([
        row.receivingInfo,
      ]);
    }
  });
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });
   // 获取当天月、日
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `运费${month}-${day}.xlsx`);
};

const exportExcel = () => {
  exportExcelBoss()
  // exportExcelBoss2()
  exportExcelSize()
};

</script>

<style lang="scss">
@import url("./ExcelUploader.scss");
</style>
