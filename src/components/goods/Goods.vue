<template>
  <div>
    <!-- 面包屑 图标分隔符 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert title="注意：服务端暂不提供图片上传、商品添加、编辑的提交功能，如需测试，可在本地8888端口自启服务端，具体参考Network Request URL！" type="warning" :closable="false" show-icon>
      </el-alert>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'goods',
}
</script>
<style lang="less" scoped>
</style>