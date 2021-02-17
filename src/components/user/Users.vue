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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
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
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
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
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户提示框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data() {
    //自定义校验规则 (1)

    // 校验邮箱
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    // 校验手机号
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      userList: [],
      // 分页的总数据条数
      total: 0,
      //控制添加用户Dialog的显示与隐藏
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

        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //自定义校验规则 (2)
          { validator: checkEmail, trigger: 'blur' },
        ],

        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          //自定义校验规则 (2)
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //控制修改用户Dialog的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},

      //修改用户信息的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //自定义校验规则 (2)
          { validator: checkEmail, trigger: 'blur' },
        ],

        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          //自定义校验规则 (2)
          { validator: checkMobile, trigger: 'blur' },
        ],
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

    // 监听添加用户dialog 关闭的事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log('添加用户', valid)
        if (!valid) {
          this.$message.error('预校验失败！！！')
          return
        }
        // 发起网络请求添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }

        this.$message.success('添加用户:' + res.meta.msg)
        // 隐藏dialog
        this.addDialogVisible = false
        // 从新获取用户列表数据
        this.getUserList()
      })
    },

    //展示 修改用户信息 dialog
    async showEditDialog(id) {
      // console.log('showEditDialog->:', id)
      //根据id获取用户数据
      const { data: res } = await this.$http.get(`users/${id}`)
      // console.log('用户数据' + res)
      if (res.meta.status !== 200) {
        this.$message.error('查询失败' + res.meta.msg)
        return
      }

      this.editForm = res.data
      // console.log(this.editForm)
      this.editDialogVisible = true
    },

    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('预校验失败！！！')
          return
        }

        //发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改失败' + res.meta.msg)
          return
        }

        //关闭对话框
        this.editDialogVisible = false
        //刷新数据
        this.getUserList()
        //提示修改成功
        this.$message.success(res.meta.msg)
      })
    },

    //根据Id删除用户
    async removeUserById(id) {
      //先弹框提示
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log('删除用户:' + confirmResult)
      //根据 返回的cancel  confirm 进行判断
      if (confirmResult !== 'confirm') {
        this.$message.info('您已取消删除')
        return
      }

      // 确定删除操作
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败:' + res.meta.msg)
        return
      }

      // 提示删除成功
      this.$message.success(res.meta.msg)
      // 刷新用户数据列表
      this.getUserList()
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