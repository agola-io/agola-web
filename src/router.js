import Vue from "vue";
import VueRouter from "vue-router";
import Home from "./views/Home.vue";
import User from "./views/User.vue";
import Org from "./views/Org.vue";
import Project from "./views/Project.vue";
import ProjectGroup from "./views/ProjectGroup.vue";
import AddLinkedAccount from "./views/AddLinkedAccount.vue";
import usersettings from "./components/usersettings.vue";
import projects from "./components/projects.vue";
import projectsettings from "./components/projectsettings.vue";
import projectgroupsettings from "./components/projectgroupsettings.vue";
import createproject from "./components/createproject.vue";
import createprojectgroup from "./components/createprojectgroup.vue";
import createorganization from "./components/createorganization.vue";
import orgmembers from "./components/orgmembers.vue";
import runs from "./components/runs.vue";
import runsummary from "./components/runsummary.vue";
import tasksummary from "./components/tasksummary.vue";
import Oauth2 from "./views/Oauth2.vue";
import Register from "./views/Register.vue";
import Login from "./views/Login.vue";
import Logout from "./views/Logout.vue";

import { parseRef, projectRunLink } from "@/util/link.js";
import { fetchProject } from "@/util/data.js";

import store from "./store";

Vue.use(VueRouter);

const router = new VueRouter({
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
      path: "/neworganization",
      component: createorganization,
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
          name: "user direct runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username })
        },
        {
          path: "runs/:runid",
          name: "user direct run",
          component: runsummary,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "user direct run task",
          component: tasksummary,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, runid: route.params.runid, taskid: route.params.taskid })
        },
        {
          path: "settings",
          name: "user settings",
          component: usersettings,
          props: (route) => ({ username: route.params.username }),
        },
        {
          path: "linkedaccounts/add/:remotesource",
          name: "user add linked account",
          component: AddLinkedAccount,
          props: (route) => ({ username: route.params.username, remoteSourceName: route.params.remotesource })
        },
        {
          path: "createprojectgroup",
          name: "user create project group",
          component: createprojectgroup,
          props: (route) => ({ ownertype: "user", ownername: route.params.username })
        },
        {
          path: "createproject",
          name: "user create project",
          component: createproject,
          props: (route) => ({ ownertype: "user", ownername: route.params.username })
        },
      ]
    },
    {
      path: "/user/:username/projects/:projectref(.*\\.proj)",
      component: Project,
      props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref) }),
      children: [
        {
          path: "",
          name: "user project",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref) })
        },
        {
          path: "runs",
          name: "user project runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref) })
        },
        {
          path: "branches",
          name: "user project branches runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref), query: "branches" })
        },
        {
          path: "tags",
          name: "user project tags runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref), query: "tags" })
        },
        {
          path: "pullrequests",
          name: "user project pull requests runs",
          component: runs,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref), query: "pullrequests" })
        },
        {
          path: "runs/:runid",
          name: "user project run",
          component: runsummary,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref), runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "user project run task",
          component: tasksummary,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref), runid: route.params.runid, taskid: route.params.taskid })
        },
        {
          path: "settings",
          name: "user project settings",
          component: projectsettings,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectref: parseRef(route.params.projectref) })
        },
      ]
    },

    {
      path: "/user/:username/projectgroups/:projectgroupref(.*\\.proj)",
      component: ProjectGroup,
      props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) }),
      children: [
        {
          path: "",
          name: "user project group",
          component: projects,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) }),
        },
        {
          path: "projects",
          name: "user project group projects",
          component: projects,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "settings",
          name: "user project group settings",
          component: projectgroupsettings,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "createprojectgroup",
          name: "user project group create project group",
          component: createprojectgroup,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "createproject",
          name: "user project group create project",
          component: createproject,
          props: (route) => ({ ownertype: "user", ownername: route.params.username, projectgroupref: parseRef(route.params.projectgroupref) })
        },
      ]
    },

    {
      path: "/org/:orgname",
      component: Org,
      props: (route) => ({ orgname: route.params.orgname }),
      children: [
        {
          path: "",
          name: "org",
          component: projects,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname })
        },
        {
          path: "projects",
          name: "org projects",
          component: projects,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname })
        },
        {
          path: "members",
          name: "org members",
          component: orgmembers,
          props: (route) => ({ orgname: route.params.orgname })
        },
        /*         {
                  path: "settings",
                  name: "org settings",
                  component: orgsettings,
                  props: (route) => ({ username: route.params.username }),
                }, */
        {
          path: "createprojectgroup",
          name: "org create project group",
          component: createprojectgroup,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname })
        },
        {
          path: "createproject",
          name: "org create project",
          component: createproject,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname })
        },
      ]
    },

    {
      path: "/org/:orgname/projects/:projectref(.*\\.proj)",
      component: Project,
      props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref) }),
      children: [
        {
          path: "",
          name: "org project",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref) })
        },
        {
          path: "runs",
          name: "org project runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref) })
        },
        {
          path: "branches",
          name: "org project branches runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref), query: "branches" })
        },
        {
          path: "tags",
          name: "org project tags runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref), query: "tags" })
        },
        {
          path: "pullrequests",
          name: "org project pull requests runs",
          component: runs,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref), query: "pullrequests" })
        },
        {
          path: "runs/:runid",
          name: "org project run",
          component: runsummary,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref), runid: route.params.runid })
        },
        {
          path: "runs/:runid/tasks/:taskid",
          name: "org project run task",
          component: tasksummary,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref), runid: route.params.runid, taskid: route.params.taskid })
        },
        {
          path: "settings",
          name: "org project settings",
          component: projectsettings,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectref: parseRef(route.params.projectref) })
        },
      ]
    },

    {
      path: "/org/:orgname/projectgroups/:projectgroupref(.*\\.proj)",
      component: ProjectGroup,
      props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) }),
      children: [
        {
          path: "",
          name: "org project group",
          component: projects,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) }),
        },
        {
          path: "projects",
          name: "org project group projects",
          component: projects,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "settings",
          name: "org project group settings",
          component: projectgroupsettings,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "createprojectgroup",
          name: "org project group create project group",
          component: createprojectgroup,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) })
        },
        {
          path: "createproject",
          name: "org project group create project",
          component: createproject,
          props: (route) => ({ ownertype: "org", ownername: route.params.orgname, projectgroupref: parseRef(route.params.projectgroupref) })
        },
      ]
    },
  ]
});

router.beforeEach(async (to, from, next) => {
  store.dispatch("setError", null);

  const { path, query } = to

  if (path == "/run") {
    // generic run handler by projectref and runid
    let projectref = query.projectref
    let runid = query.runid

    let { data, error } = await fetchProject(projectref);
    if (error) {
      this.$store.dispatch("setError", error);
      return;
    }

    let project = data;

    let parts = project.path.split("/")
    let nextPath = projectRunLink(parts[0], parts[1], parts.slice(2), runid)

    next({ path: nextPath.path, replace: true })
  }

  next()
})

export default router