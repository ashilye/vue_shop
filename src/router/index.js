import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'


Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },

    ]
  }
]

const router = new VueRouter({
  routes
})

//路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 从那个路径跳转而来
  //next 是一个函数,
  //   1, next() 放行  
  //   2, next('/xxx') 强制跳转到xxx页面

  //如果访问的是login页,直接放行
  if (to.path === '/login') return next();
  // 否则判断 sessionStorage 中是否有token,如果有 放行,如果没有 跳转到login页
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})
export default router
