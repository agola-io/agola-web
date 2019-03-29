import Vue from "vue";
import VueRouter from "vue-router";
import Home from "./views/Home.vue";
import User from "./views/User.vue";
import Org from "./views/Org.vue";
import Project from "./views/Project.vue";
//import Run from "./views/Run.vue";
import projects from "./components/projects.vue";
import projectsettings from "./components/projectsettings.vue";
import runs from "./components/runs.vue";
import run from "./components/run.vue";
import task from "./components/task.vue";
import Oauth2 from "./views/Oauth2.vue";
import Register from "./views/Register.vue";
import Login from "./views/Login.vue";
import Logout from "./views/Logout.vue";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout
    },
    {
      path: "/oauth2/callback",
      name: "oauth2callback",
      component: Oauth2
    },
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/user/:username",
      component: User,
      props: (route) => ({ username: route.params.username }),
      children: [
        {
          path: "",
          name: "user",
          component: projects,
          props: (route) => ({ ownertype: "user", ownername: route.params.username })
        },
        {
          path: "projects",
          name: "user projects",
          component: projects,
          props: (route) => ({ ownertype: "user", ownername: route.params.username })
        },
        {
          path: "runs",
          name: "user local runs",
          component: runs,
          props: (route) => ({ ownertype: "user", username: route.params.username })
        },
        {
          path: "runs/:runid",
          name: "user local run",
          component: run,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "user local run task",
          component: task,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, runid: route.params.runid, taskid: route.params.taskid })
        },
      ]
    },
    {
      path: "/user/:username/projects/:projectname",
      component: Project,
      props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname }),
      children: [
        {
          path: "",
          name: "user project",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname })
        },
        {
          path: "runs",
          name: "user project runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname })
        },
        {
          path: "branches",
          name: "user project branches runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname, query: "branches" })
        },
        {
          path: "tags",
          name: "user project tags runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname, query: "tags" })
        },
        {
          path: "pullrequests",
          name: "user project pull requests runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname, query: "pullrequests" })
        },
        {
          path: "runs/:runid",
          name: "user project run",
          component: run,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname, runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "user project run task",
          component: task,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname, runid: route.params.runid, taskid: route.params.taskid })
        },
        {
          path: "settings",
          name: "user project settings",
          component: projectsettings,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectname: route.params.projectname })
        },
      ]
    },
    {
      path: "/org/:orgname",
      name: "org",
      component: Org,
      props: (route) => ({ orgname: route.params.orgname }),
    },

    {
      path: "/org/:orgname/projects/:projectname",
      component: Project,
      props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname }),
      children: [
        {
          path: "",
          name: "org project",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname })
        },
        {
          path: "runs",
          name: "org project runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname })
        },
        {
          path: "branches",
          name: "org project branches runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname, query: "branches" })
        },
        {
          path: "tags",
          name: "org project tags runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname, query: "tags" })
        },
        {
          path: "pullrequests",
          name: "org project pull requests runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname, query: "pullrequests" })
        },
        {
          path: "runs/:runid",
          name: "org project run",
          component: run,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname, runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "org project run task",
          component: task,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname, runid: route.params.runid, taskid: route.params.taskid })
        },
        {
          path: "settings",
          name: "org project settings",
          component: projectsettings,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectname: route.params.projectname })
        },
      ]
    },
  ]
});
