<template>
  <div>
    <!-- 面包屑 图标分隔符 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">

      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 列表 索引列-->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180" align="center"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180" align="center"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180" align="center"></el-table-column>
        <el-table-column label="状态" width="180" align="center">
          <!-- 屏蔽某段代码的语法规范检查 -->
          <!-- eslint-disable-next-line -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.msg_state" active-color="#13ce66" inactive-color="#e3e3e3" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <!-- eslint-disable-next-line -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户提示框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <!-- 内容区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!-- 手机 -->
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
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
            max: 18,
            message: '长度在 6 到 18 个字符',
            trigger: 'blur',
          },
        ],

        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],

        mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      },
    }
  },

  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      console.log('用户列表->', res)
      if (res.meta.status !== 200) {
        this.$message.error('获取用户失败：' + res.meta.msg)
        return
      }

      this.userList = res.data.users
      this.total = res.data.total
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log('handleSizeChange->:', newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    // 监听 页码值改变的监听
    handleCurrentChange(newPage) {
      // console.log('handleCurrentChange->:', newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    // 用户状态改变监听
    async userStateChanged(userinfo) {
      // console.log('userStateChanged->:', val)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        this.$message.error('操作失败：' + res.meta.msg)
        return
      }

      this.$message.success(res.meta.msg)
    },
  },
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-pagination {
  margin-top: 15px;
}
</style>