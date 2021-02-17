<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <i class="el-icon-platform-eleme"></i>

        <span>电商管理后台系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主题区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-menu" @click="toggleCollapse">
          <i :class="isCollapse ? 'el-icon-s-fold' : 'el-icon-s-unfold'"></i>
        </div>
        <!-- 侧边栏菜单 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <!-- index  前面加： 说明是动态数据, index 的值必须是字符串类型 所以拼一个'' -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index=" '/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      menuList: [],

      // 一级菜单图标
      icons: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      isCollapse: false,

      //被激活的二级菜单path
      activePath: '',
    }
  },
  // 生命周期函数
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()

      this.$router.push('/login')
    },

    // 点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 获取左侧菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log('菜单数据->:', res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取菜单失败：' + res.meta.msg)
      }
      this.menuList = res.data
    },

    // 保存二级菜单path 的激活状态
    saveNavState(path) {
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path
    },
  },
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 12px;
    }
  }
}

.el-aside {
  background-color: #333744;

  // 去掉菜单和主体的细线条
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

// 一级菜单图标
.iconfont {
  margin-right: 8px;
}

.toggle-menu {
  background-color: #4a5064;
  text-align: center;
  cursor: pointer;
  > i {
    color: #fff;
    line-height: 26px;
  }
}
</style>




