<template>
  <div>
    <!-- 面包屑 图标分隔符 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="tree-table" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <!-- eslint-disable-next-line -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- eslint-disable-next-line -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- eslint-disable-next-line -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类弹出框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类弹出框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'cate',
  data() {
    return {
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
          align: 'center',
          headerAlign: 'center',
          width: '180',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
          align: 'center',
          headerAlign: 'center',
          width: '180',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
          align: 'center',
          headerAlign: 'center',
        },
      ],
      queryInfo: {
        type: 3,
        pagenum: 1, //当前的页数
        pagesize: 10, //当前每页显示多少条数据
      },
      addCateDialogVisible: false,
      editCateDialogVisible: false,

      //添加分类的表单数据
      addCateForm: {
        cat_name: '',
        //父级分类id
        cat_pid: 0,
        //分类的等级，默认添加一级分类
        cat_level: 0,
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },

      //编辑分类的表单数据
      editCateForm: {
        cat_id: 0,
        cat_name: '',
      },
      //编辑分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },

      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败：' + res.meta.msg)
        return
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },

    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log('handleSizeChange->:', newSize)
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 监听 页码值改变的监听
    handleCurrentChange(newPage) {
      // console.log('handleCurrentChange->:', newPage)
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    showAddCateDialog() {
      // 添加分类弹出dialog 之前先获取数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },

    // 获取添加分类dialog的父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类失败：' + res.meta.msg)
        return
      }
      this.parentCateList = res.data
    },

    //选择项发生变化回调
    parentCateChanged() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('添加分类校验错误')
          return
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败：' + res.meta.msg)
          return
        }

        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.label = 0
      this.addCateForm.cat_pid = 0
    },

    showEditDialog(cateInfo) {
      this.editCateForm.cat_id = cateInfo.cat_id
      this.editCateForm.cat_name = cateInfo.cat_name
      this.editCateDialogVisible = true
      // console.log(this.editCateForm)
    },

    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_id = 0
      this.editCateForm.cat_name = ''
    },

    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('编辑分类校验错误')
          return
        }
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('编辑分类失败：' + res.meta.msg)
          return
        }

        this.$message.success(res.meta.msg)
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },

    async removeRoleById(id) {
      // 提示确认删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        this.$message.info('您取消了删除')
        return
      }
      //确定删除
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败：' + res.meta.msg)
        return
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
    },
  },
}
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-pagination {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>