<template>
  <div class="money">
    <div class="money__top">
      <el-upload
        action=""
        :before-upload="beforeUpload"
        :http-request="() => {}"
      >
        <el-button type="primary" size="small" style="margin-right: 6px;"
          >导入excel</el-button
        >
      </el-upload>
      <div v-if="tableData?.length" style="margin-right: 12px">
        {{ tableData?.length }}条
      </div>
      <!-- <el-button type="" size="small" @click="resetName">整理收货信息</el-button>
      <el-button type="" size="small" @click="resetSize">整理尺寸</el-button> -->
      <el-button type="danger" size="small" style="margin-left: 40px;" @click="handleMoney">算 账</el-button>
      <div class="money__total">
        <section>
          <label>合计</label>
          <span>￥{{ totalMoney }}</span>
        </section>
        <section>
          <label>快递数量：</label>
          <span>{{totalFreightNumber}}个</span>
        </section>
        <section>
          <label>运费合计：</label>
          <span>￥{{totalFreight}}</span>
        </section>
      </div>
    </div>
    <div class="money__input">
      <el-select
        v-model="boss"
        size="small"
        style="width: 120px;margin-right: 15px;"
        placeholder="选择老板"
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
      <section>
        <label>打包费</label>
        <el-input
          v-model="cost"
          size="small"
          type="number"
          style="width: 100px"
          placeholder="运费"
        />
      </section>
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
      <el-table-column prop="name" label="收货人姓名" width="130">
        <template #default="scope">
          {{ scope.row.name }}
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
      <el-table-column prop="size" label="费用" width="110px">
        <template #default="scope">
          <span style="color: red;">{{ scope.row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="合并订单" width="80">
        <template #default="scope">
          <span :class="scope.row.combine> 1 ? 'excel--combine': ''">{{scope.row.combine}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="运费数量" width="80px">
        <template #default="scope">
          <span style="color: blue;">{{ scope.row.isOne }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="specification" label="规格" width="150" />
      <el-table-column prop="receivingInfo" label="收货信息" width="200">
        <template #default="scope">
          <span>{{scope.row.receivingInfo}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderId" label="订单号" width="160" />
      <el-table-column prop="productId" label="商品Id" width="120" />
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

const boss = ref("");
const bossList = ref([
  {
    label: "娄底",
    value: 1,
    print: 9,
    page: 4,
    freight: 3,
    cost: 0,
  },
  {
    label: "山西",
    value: 4,
    print: 10,
    page: 0,
    freight: 4,
    cost: 0,
  },
  {
    label: "江苏",
    value: 2,
    print: 8.5, // 打印费
    page: 1.5, // 纸筒费
    freight: 2.5, // 极兔2.5  申通3.5
    cost: 1, // 打包费
  },
  {
    label: "重庆",
    value: 3,
    print: 9,
    page: 0,
    freight: 3.5,
    cost: 0,
  },
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

// 拆分姓名的[]   张三[0029] => 张三
const formatName = (name) => {
  return name.split('[')[0]
};

// 算纸筒向上取整的值
function customRound(number) {
  // 定义基准数列（必须为升序）
  const benchmarks = [30, 40, 50, 60, 80, 90, 100, 120];
  // 边界检测：非数字返回第一个基准值
  if (typeof number !== 'number' || isNaN(number)) return benchmarks[0];
  // 遍历找到第一个大于等于输入值的基准数
  for (const benchmark of benchmarks) {
    if (number <= benchmark) return benchmark;
  }
  // 超过所有基准值则返回最后一个
  return benchmarks[benchmarks.length - 1];
}

const handleMoney = () => {
  const copyTableData = _.cloneDeep(tableData.value); 
  let total = 0
  let totalFreight1 = 0
  let totalFreightNumber1 = 0
  const copyTableED = []
  copyTableData.forEach((item) => {
    const areaMoney = (item.width/100) * (item.height/100) * print.value  // 打印费
    let pageMoneyMath = Math.min(item.width, item.height) / 100 * page.value; // 纸筒费
    if (boss.value == 2) {
      pageMoneyMath = parseInt(customRound(Math.min(item.width, item.height))) / 100 * page.value // 江苏老板纸筒费
    }
    const isSister = copyTableED.some(itt => formatCity(item.address) == formatCity(itt.address) && formatName(itt.name.trim()).trim() == formatName(item.name.trim()).trim())
    const freightMoney = isSister ? 0 : freight.value; // 运费
    const costMoney = isSister ? 0 : cost.value; // 打包费
    const pageMoney = isSister ? 0 : pageMoneyMath; // 纸筒费
    item.isOne = isSister ? 0 : 1; // 运费个数
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

// 格式化收货信息
const resetName = () => {
  const copyTableED = []
  tableData.value.forEach((item, index) => {
    const info = splitReceivingInfo(item.receivingInfo);
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
  resetName();
  resetSize();
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
    return { name: "", phone: "", address: "" };
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

// 获取省份
const formatCity = (address) => {
  return address.split(" ")[0];
};

const exportExcel = () => {
  exportExcelBoss();
  exportExcelSize();
};
</script>

<style lang="scss">
.money {
  &__top {
    display: flex;
    align-items: center;
  }
  padding: 15px;
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
