<template>
  <div>
    <!-- 面包屑 图标分隔符 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" style="width: 100%" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" align="center"></el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <!-- eslint-disable-next-line -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色弹出框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" :close-on-click-modal="false" @close="addRoleDialogClosed">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹出框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'roles',
  data() {
    return {
      roleList: [],

      addRoleDialogVisible: false,
      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      //添加角色表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },

      editRoleDialogVisible: false,
      //编辑角色的表单数据
      editRoleForm: {},

      //编辑角色表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表数据失败：' + res.meta.msg)
        return
      }
      this.roleList = res.data
      console.log(this.roleList)
    },

    // 添加角色 确定
    addRole() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        // console.log('添加用户', valid)
        if (!valid) {
          this.$message.error('预校验失败！！！')
          return
        }
        // 发起网络请求添加用户
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        }

        this.$message.success('添加角色:' + res.meta.msg)
        // 隐藏dialog
        this.addRoleDialogVisible = false
        // 从新获取角色列表数据
        this.getRolesList()
      })
    },

    //添加角色对话框的关闭事件,重置校验
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    // 显示编辑弹出框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('查询失败' + res.meta.msg)
        return
      }

      this.editRoleForm = res.data
      // console.log(this.editRoleForm)
      this.editRoleDialogVisible = true
    },

    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },

    editRole() {
      // console.log(this.editRoleForm)
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('预校验失败！！！')
          return
        }

        //发起修改角色信息的数据请求
        const { data: res } = await this.$http.put(
          `roles/${this.editRoleForm.roleId}`,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改失败' + res.meta.msg)
          return
        }

        //关闭对话框
        this.editRoleDialogVisible = false
        //刷新数据
        this.getRolesList()
        //提示修改成功
        this.$message.success(res.meta.msg)
      })
    },

    //根据id 删除角色
    async removeRoleById(id) {
      //先弹出确认对话框提示
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      console.log('删除角色:' + confirmResult)
      //根据 返回的cancel  confirm 进行判断
      if (confirmResult !== 'confirm') {
        this.$message.info('您已取消删除')
        return
      }

      // 确定删除操作
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败:' + res.meta.msg)
        return
      }

      // 提示删除成功
      this.$message.success(res.meta.msg)
      // 刷新用户数据列表
      this.getRolesList()
    },
  },
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>