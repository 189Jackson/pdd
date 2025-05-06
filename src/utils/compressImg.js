import Compressor from 'compressorjs';
import { base64toFile } from "@/utils/base64ToFile";

// 图片压缩+裁剪
export const compressor = (base64Data, wt = 1024) => {
  return new Promise((resolve, reject) => {
    new Compressor(base64toFile(base64Data), {
      // quality: 0.6,
      // width: wt,
      // height: wt,
      success: (result) => {
        console.log(888888888, result);
        resolve(result);
      },
    });
  });
  // return new ImageCompressor(base64Data)
  // return new ImageCompressor(base64toFile(base64Data))
};

// 图片裁剪
const compress = (file, wt = 1024) => {
  var quality = 1;
  var base64IMG = file;
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = function () {
      var oWidth = img.width;
      var oHeight = img.height;
      //开始进行转换到canvas再压缩操作
      var canvas = document.createElement("canvas");
      const newWidth = wt;
      const newHeight = (oHeight * wt) / oWidth;
      canvas.width = newWidth; //设置画布的宽度
      canvas.height = newHeight; //设置画布的高度
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // 填充底色，处理png背景为黑色的问题
      ctx.fillRect(0, 0, newWidth, newHeight);
      //ctx.drawImage(图像对象,画点起始Y,画点起始Y,画出宽度,画出高度)//画出宽度和高度决定了你复刻了多少像素，和是画布宽高度是两回事
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      //此时我们可以使用canvas.toBlob(function(blob){ //参数blob就已经是二进制文件了 });来把canvas转回二进制文件，但是我们使用提交表单的时候才即使转换的方式。
      var smBase64 = canvas.toDataURL("image/jpeg", quality); //canvas转成新的base64数据，第二个参数为保存质量
      resolve(smBase64);
    };
    img.src = base64IMG;
  });
};

export default compress;
