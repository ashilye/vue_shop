<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <!-- 头像区域 -->
        <img src="../assets/github_my.png" alt="logo">
      </div>

      <!-- 提交表单区域 -->
      <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      //表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          {
            min: 3,
            max: 32,
            message: '长度在 3 到 32 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 16,
            message: '长度在 6 到 16 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },

  methods: {
    //点击重置按钮
    resetLoginForm() {
      // console.log('log-->', this)
      this.$refs.loginFormRef.resetFields()
    },

    login() {
      this.$refs.loginFormRef.validate(async (val) => {
        // console.log('检验', val)
        if (!val) {
          this.$message.error('错了哦，请重新输入!')
          return
        }
        // console.log('检验通过', val)
        //返回的是Promise, 定律：如果某个方法返回值是Promise,那么可以使用await 来简化Promise操作,而 await只能用在async 修改的方法中
        //解构 data 重命名为 res
        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log('登录结果->', res)
        if (res.meta.status !== 200) {
          this.$message.error('登陆失败:' + res.meta.msg)
          return
        }
        // console.log('登录成功')
        //1,登录成功,需要将token保存在 sessionStorage 中,sessionStorage是网页中会话期间生效,保存这里比较合适
        window.sessionStorage.setItem('token', res.data.token)
        //2,页面跳转
        this.$router.push('/home')
      })
    },
  },
}
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
    transform: translate(
      -50%,
      -50%
    ); //向自身左方向移动自身的50%,向上自身高度50%
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%; // 图片圆形
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex; //弹性盒子
  justify-content: center; //对其
}
</style>
