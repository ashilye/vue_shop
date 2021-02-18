<template>
  <div>
    <!-- 面包屑 图标分隔符 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat-opt">
        <el-col>
          <span>先择商品分类：</span>
          <el-cascader expand-trigger="hover" :options="cateList" :props="cateProps" v-model="selectedCateKeys" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand" align="center"></el-table-column>
            <el-table-column type="index" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <!-- eslint-disable-next-line -->
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand" align="center"></el-table-column>
            <el-table-column type="index" align="center"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <!-- eslint-disable-next-line -->
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'params',
  data() {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      selectedCateKeys: [],
      activeName: 'many',
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],

      addDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取分类列表失败：' + res.meta.msg)
        return
      }

      this.cateList = res.data
    },

    handleChange() {
      this.getParamsData()
    },

    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      //必须选中三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )

      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败：' + res.meta.msg)
        return
      }
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('预校验失败！！！')
          return
        }

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加失败：' + res.meta.msg)
          return
        }

        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
  },

  // 计算属性
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
}
</script>
<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}
.el-cascader {
  width: 30%;
}
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
</style>