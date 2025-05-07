<template>
  <div class="money">
    <div class="money__top">
      <el-upload
        action=""
        drag
        :before-upload="beforeUpload"
        :http-request="() => {}"
      >
        <div>点击或者拖拽excel</div>
      </el-upload>
      <div v-if="tableData?.length" style="margin-left: 12px">
        {{ tableData?.length }}条
      </div>
      <el-button type="danger" size="small" style="margin-left: 40px;" @click="handleMoney">算 账</el-button>
      <div class="money__total">
        <section>
          <label>合计</label>
          <span style="font-size: 16px;">￥{{ totalMoney }}</span>
        </section>
        <section>
          <label>（ 快递数量：</label>
          <span>{{totalFreightNumber}}个</span>
        </section>
        <section>
          <label>运费合计：</label>
          <span>￥{{totalFreight}} ）</span>
        </section>
        <el-button type="primary" @click="exportExcel">导出excel</el-button>
      </div>
    </div>
    <div class="money__input">
      <el-select
        v-model="boss"
        size="small"
        style="width: 120px;margin-right: 15px;"
        placeholder="选择模板"
        @change="changeBoss"
      >
        <el-option
          v-for="item in bossList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <section>
        <label>打印费</label>
        <el-input
          v-model="print"
          size="small"
          type="number"
          style="width: 100px"
          placeholder="打印费"
        />
      </section>
      <section>
        <label>运费</label>
        <el-input
          v-model="freight"
          size="small"
          type="number"
          style="width: 100px"
          placeholder="运费"
        />
      </section>
      <section>
        <label>纸筒费</label>
        <el-input
          v-model="page"
          size="small"
          type="number"
          style="width: 100px"
          placeholder="纸筒费"
        />
      </section>
      <!-- <section>
        <label>打包费</label>
        <el-input
          v-model="cost"
          size="small"
          type="number"
          style="width: 100px"
          placeholder="运费"
        />
      </section> -->
    </div>

    <!-- 表格组件 -->
    <el-table
      :data="tableData"
      style="width: 100%; height: calc(100vh - 230px);"
      border
      size="small"
    >
      <el-table-column prop="" label="" width="43">
        <template #default="scope">
          {{ scope?.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="快递单号" width="160">
        <template #default="scope">
          {{ scope.row.kid }}
        </template>
      </el-table-column>
      <el-table-column prop="size" label="尺寸" width="120px">
        <template #default="scope">
          <el-input
            size="small"
            v-model="scope.row.size"
            style="width: 90px"
            placeholder="尺寸"
          />
        </template>
      </el-table-column>
      <!-- iitem.pageMoney = pageMoney // 纸筒费
    iitem.freightMoney = freightMoney // 运费
    iitem.areaMoney = areaMoney // 打印费 -->
      <el-table-column prop="size" label="打印费" width="90px">
        <template #default="scope">
          <span style="color: red;">{{ scope.row.areaMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="纸筒费" width="90px">
        <template #default="scope">
          <span style="color: red;">{{ scope.row.pageMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="运费" width="90px">
        <template #default="scope">
          <span style="color: red;">{{ scope.row.freightMoney }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="size" label="单价" width="110px">
        <template #default="scope">
          <span style="color: red;">{{ scope.row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="合并订单" width="80">
        <template #default="scope">
          <span :class="scope.row.combine> 1 ? 'excel--combine': ''">{{scope.row.combine}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="订单号" width="220" />
      <el-table-column prop="specification" label="商品规格" width="380" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import _ from "lodash";
const loading = ref(false);
const tableColumnLabel = ref([]); // 获取表头内容
const tableData = ref([]); // 表格数据

const totalMoney = ref(); // 合计
const print = ref(); // 打印费
const page = ref(); // 纸筒费
const freight = ref(); // 运费
const cost = ref(); // 打包费

const totalFreightNumber = ref() // 运费个数
const totalFreight = ref()  // 运费总数

const boss = ref('1');
const bossList = ref([
  {
    label: "计算基数",
    value: '1',
    print: 9.5,
    page: 4,
    freight: 3,
    cost: 0,
  },
//   {
//     label: "山西",
//     value: 4,
//     print: 10,
//     page: 0,
//     freight: 4,
//     cost: 0,
//   },
//   {
//     label: "江苏",
//     value: 2,
//     print: 8.5, // 打印费
//     page: 1.5, // 纸筒费
//     freight: 2.5, // 极兔2.5  申通3.5
//     cost: 1, // 打包费
//   },
//   {
//     label: "重庆",
//     value: 3,
//     print: 9,
//     page: 0,
//     freight: 3.5,
//     cost: 0,
//   },
]);

const changeBoss = (val) => {
  const bossInfo = bossList.value.find((item) => item.value == boss.value);
  if (bossInfo) {
    print.value = bossInfo.print;
    page.value = bossInfo.page;
    freight.value = bossInfo.freight;
    cost.value = bossInfo.cost;
  }
};

changeBoss()

// 拆分姓名的[]   张三[0029] => 张三
const formatName = (name) => {
  return name.split('[')[0]
};


const handleMoney = () => {
  const copyTableData = _.cloneDeep(tableData.value); 
  let total = 0
  let totalFreight1 = 0
  let totalFreightNumber1 = 0
  const copyTableED = []
  copyTableData.forEach((item, inx) => {
    const areaMoney = (item.width/100) * (item.height/100) * print.value  // 打印费
    const minWidth = Math.min(item.width, item.height); // 找到最小边长度
    const isSister = copyTableED.some(itt => itt.kid == item.kid)

    const maxWidthArr = [minWidth]
    for (let index = inx+1; index < copyTableData.length; index++) {
      if (copyTableData[index].kid == item.kid) {
        const minWidth2 = Math.min(copyTableData[index].width, copyTableData[index].height);
        maxWidthArr.push(minWidth2)
      }
    }
    const maxWidth = Math.max(...maxWidthArr)

    // let pageMoneyMath = Math.min(item.width, item.height) / 100 * page.value; // 纸筒费
    let pageMoneyMath = maxWidth / 100 * page.value; // 纸筒费
    const freightMoney = isSister ? 0 : freight.value; // 运费
    const costMoney = isSister ? 0 : cost.value; // 打包费
    const pageMoney = isSister ? 0 : pageMoneyMath; // 纸筒费
    item.isOne = isSister ? 0 : 1; // 运费个数
    item.minWidth = minWidth;
    
    item.pageMoney = pageMoney.toFixed(5); // 纸筒费
    item.freightMoney = freightMoney.toFixed(5); // 运费
    item.areaMoney = areaMoney.toFixed(5); // 打印费

    const itemTotal = areaMoney + pageMoney + parseFloat(freightMoney) + parseFloat(costMoney);
    item.total = parseFloat(itemTotal).toFixed(5);

    copyTableED.push(item)
    total += itemTotal
    totalFreightNumber1 += parseFloat(item.isOne)
    totalFreight1 += (parseFloat(item.isOne)*parseFloat(freight.value))
  });
  totalFreightNumber.value = totalFreightNumber1
  totalFreight.value = totalFreight1;
  tableData.value = copyTableData
  totalMoney.value = parseFloat(total).toFixed(5);
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
    resetTableData();
  } catch (error) {
    console.error("数据封装失败:", error); // 更详细的错误信息
    return;
  }
}




// 格式化商品规格
const resetSize = () => {
  tableData.value.forEach((item, index) => {
    const size = extractDimension(item.specification);
    const [width, height] = size.split("x");
    item.width = parseFloat(width.trim());
    item.height = parseFloat(height.trim());
    item.size = size.trim();
  });
};

// 取规格中的编号
function extractFirstNumber(str) {
  // 匹配第一个连续数字序列（不需要全局匹配）
  const match = str.match(/\d+/);

  if (!match) return ""; // 无数字时返回空字符串

  // 处理前导零（如 "04"→"4"，"00"→"0"）
  const cleaned = match[0].replace(/^0+/, "");
  return cleaned === "" ? "0" : cleaned;
}

// 统一处理
const resetTableData = () => {
  resetSize();
  resetName();
};

// 格式化收货信息
const resetName = () => {
  const copyTableED = []
  tableData.value.forEach((item, index) => {
    const isSister = copyTableED.find(itt => item.kid == itt.kid)
    if (isSister) {
      item.combine = 0
      const finx = tableData.value.findIndex(itt => item.kid == itt.kid)
      tableData.value[finx].combine+=1
    } else { // 有相同的
      copyTableED.push(item)
      item.combine = 1
    }
  });
};

// 匹配规格尺寸
function extractDimension(str) {
  const regex = /(\d+\.?\d*)(cm|厘米|米)?\s*[*x]\s*(\d+\.?\d*)(cm|厘米|米)?/i;
  const match = str.match(regex);
  if (!match) return "";
  // 解构匹配结果（注意索引位置）
  const [_, num1, unit1, num2, unit2] = match;
  // 检查单位有效性：两个单位必须同为 cm/厘米 或 无单位
  const hasMeter = [unit1, unit2].some((u) => u === "米");
  const isValid = [unit1, unit2].every(
    (u) => !u || ["cm", "厘米"].includes(u.toLowerCase())
  );
  return hasMeter || !isValid ? "" : `${num1}x${num2}`;
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


const exportExcel = () => {
  const worksheetData = [
    ["快递单号", "尺寸", "打印费", "纸筒费", "运费", "单价","合并订单","订单号","商品规格"]
  ];
  tableData.value.forEach((row, index) => {
      worksheetData.push([
        row.kid,
        row.size,
        row.areaMoney,
        row.pageMoney,
        row.freightMoney,
        row.total,
        row.combine,
        row.orderId,
        row.specification,
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
  saveAs(blob, `对账单${month}-${day}.xlsx`);
};



</script>

<style lang="scss">
.money {
  padding: 14px;
  &__top {
    display: flex;
    align-items: center;
  }
  &__input {
    margin: 0 12px 12px 0;
    display: flex;
    align-items: center;
    section {
      margin-right: 20px;
      white-space: nowrap;
    }
    label {
      padding-right: 4px;
      font-size: 13px;
    }
  }
  &__total{
    margin-left: 20px;
    display: flex;
    section{
      margin-right: 30px;
      white-space: nowrap;
      span{
        font-weight: 700;
      }
    }
  }
}
.excel{
    &--combine{
      color: red;
      font-size: 18px;
      font-weight: 700;
    }
  }
</style>
