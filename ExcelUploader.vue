
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

function excelDateToJSDate(excelDate) {
  // Excel 1900年1月1日是第1天，但1900年不是闰年，Excel错误地认为1900年2月29日是有效日期
  // 因此，从1900年3月1日开始的时间戳需要减去1天
  const date = new Date(Math.round((excelDate - (excelDate > 60 ? 25569 : 25568)) * 86400 * 1000));
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
 
    for (const key in zipLoadResult["files"]) {
      if (key.indexOf("media/image") != -1 && !key.dir) {
        await zip
          .file(zipLoadResult["files"][key].name)
          .async("base64")
          .then((res) => {
            imageList.push(res);
          });
      }
    }
  } catch (error) {
    console.error("图片解析失败:", error); // 更详细的错误信息
  }
  return imageList;
}
