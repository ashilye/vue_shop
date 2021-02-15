<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/github_my.png" alt="logo">
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  //居中显示
  position: absolute; //绝对定位
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee; //边框
    border-radius: 50%; //圆形
    padding: 3px;
    box-shadow: 0 0 10px #ddd; // 阴影
    position: absolute; //定位
    left: 50%;
    transform: translate(-50%, -50%); //向自身左方向移动自身的50%,向上自身高度50%
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%; // 图片圆形
      background-color: #eee;
    }
  }
}
</style>
