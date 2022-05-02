import { until } from '@vueuse/shared';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { API, ApiError } from '../app/api';
import { AppState } from '../app/appstate';
import { Auth } from '../app/auth';
import createorganization from '../components/createorganization.vue';
import createproject from '../components/createproject.vue';
import createprojectgroup from '../components/createprojectgroup.vue';
import orgmembers from '../components/orgmembers.vue';
import projectgroupsettings from '../components/projectgroupsettings.vue';
import projects from '../components/projects.vue';
import projectsettings from '../components/projectsettings.vue';
import runs from '../components/runs.vue';
import runsummary from '../components/runsummary.vue';
import tasksummary from '../components/tasksummary.vue';
import usersettings from '../components/usersettings.vue';
import { parseRef, parseRunNumber, projectRunLink } from '../util/link';
import AddLinkedAccount from '../views/AddLinkedAccount.vue';
import CreateSource from '../views/CreateSource.vue';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Logout from '../views/Logout.vue';
import Oauth2 from '../views/Oauth2.vue';
import Org from '../views/Org.vue';
import Project from '../views/Project.vue';
import ProjectGroup from '../views/ProjectGroup.vue';
import Register from '../views/Register.vue';
import User from '../views/User.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/newsource',
    name: 'newsource',
    component: CreateSource,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout,
  },
  {
    path: '/oauth2/callback',
    name: 'oauth2',
    component: Oauth2,
  },
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/neworganization',
    component: createorganization,
  },
  {
    path: '/user/:username',
    component: User,
    props: (route) => ({
      username: firstEntry(route.params.username),
      runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
      taskid: firstEntry(route.params.taskid),
    }),
    children: [
      {
        path: '',
        name: 'user',
        component: projects,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
        }),
      },
      {
        path: 'projects',
        name: 'user projects',
        component: projects,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
        }),
      },
      {
        path: 'runs',
        name: 'user direct runs',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
        }),
      },
      {
        path: 'runs/:runnumber',
        name: 'user direct run',
        component: runsummary,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
        }),
      },
      {
        path: 'runs/:runnumber/tasks/:taskid',
        name: 'user direct run task',
        component: tasksummary,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
          taskid: firstEntry(route.params.taskid),
        }),
      },
      {
        path: 'settings',
        name: 'user settings',
        component: usersettings,
        props: (route) => ({
          username: firstEntry(route.params.username),
        }),
      },
      {
        path: 'linkedaccounts/add/:remotesource',
        name: 'user add linked account',
        component: AddLinkedAccount,
        props: (route) => ({
          username: firstEntry(route.params.username),
          remoteSourceName: firstEntry(route.params.remotesource),
        }),
      },
      {
        path: 'createprojectgroup',
        name: 'user create project group',
        component: createprojectgroup,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
        }),
      },
      {
        path: 'createproject',
        name: 'user create project',
        component: createproject,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
        }),
      },
    ],
  },
  {
    path: '/user/:username/projects/:projectref(.*\\.proj)',
    component: Project,
    props: (route) => ({
      ownertype: 'user',
      ownername: firstEntry(route.params.username),
      projectref: parseRef(firstEntry(route.params.projectref)),
      runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
      taskid: firstEntry(route.params.taskid),
    }),
    children: [
      {
        path: '',
        name: 'user project',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
      {
        path: 'runs',
        name: 'user project runs',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
      {
        path: 'branches',
        name: 'user project branches runs',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'branches',
        }),
      },
      {
        path: 'tags',
        name: 'user project tags runs',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'tags',
        }),
      },
      {
        path: 'pullrequests',
        name: 'user project pull requests runs',
        component: runs,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'pullrequests',
        }),
      },
      {
        path: 'runs/:runnumber',
        name: 'user project run',
        component: runsummary,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
        }),
      },
      {
        path: 'runs/:runnumber/tasks/:taskid',
        name: 'user project run task',
        component: tasksummary,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
          taskid: firstEntry(route.params.taskid),
        }),
      },
      {
        path: 'settings',
        name: 'user project settings',
        component: projectsettings,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
    ],
  },

  {
    path: '/user/:username/projectgroups/:projectgroupref(.*\\.proj)',
    component: ProjectGroup,
    props: (route) => ({
      ownertype: 'user',
      ownername: firstEntry(route.params.username),
      projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
    }),
    children: [
      {
        path: '',
        name: 'user project group',
        component: projects,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'projects',
        name: 'user project group projects',
        component: projects,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'settings',
        name: 'user project group settings',
        component: projectgroupsettings,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'createprojectgroup',
        name: 'user project group create project group',
        component: createprojectgroup,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'createproject',
        name: 'user project group create project',
        component: createproject,
        props: (route) => ({
          ownertype: 'user',
          ownername: firstEntry(route.params.username),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
    ],
  },

  {
    path: '/org/:orgname',
    component: Org,
    props: (route) => ({ orgname: firstEntry(route.params.orgname) }),
    children: [
      {
        path: '',
        name: 'org',
        component: projects,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
        }),
      },
      {
        path: 'projects',
        name: 'org projects',
        component: projects,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
        }),
      },
      {
        path: 'members',
        name: 'org members',
        component: orgmembers,
        props: (route) => ({ orgname: firstEntry(route.params.orgname) }),
      },
      // {
      //   path: 'settings',
      //   name: 'org settings',
      //   component: orgsettings,
      //   props: (route) => ({
      //     username: firstEntry(route.params.username),
      //   }),
      // },
      {
        path: 'createprojectgroup',
        name: 'org create project group',
        component: createprojectgroup,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
        }),
      },
      {
        path: 'createproject',
        name: 'org create project',
        component: createproject,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
        }),
      },
    ],
  },

  {
    path: '/org/:orgname/projects/:projectref(.*\\.proj)',
    component: Project,
    props: (route) => ({
      ownertype: 'org',
      ownername: firstEntry(route.params.orgname),
      projectref: parseRef(firstEntry(route.params.projectref)),
    }),
    children: [
      {
        path: '',
        name: 'org project',
        component: runs,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
      {
        path: 'runs',
        name: 'org project runs',
        component: runs,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
      {
        path: 'branches',
        name: 'org project branches runs',
        component: runs,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'branches',
        }),
      },
      {
        path: 'tags',
        name: 'org project tags runs',
        component: runs,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'tags',
        }),
      },
      {
        path: 'pullrequests',
        name: 'org project pull requests runs',
        component: runs,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
          query: 'pullrequests',
        }),
      },
      {
        path: 'runs/:runnumber',
        name: 'org project run',
        component: runsummary,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
        }),
      },
      {
        path: 'runs/:runnumber/tasks/:taskid',
        name: 'org project run task',
        component: tasksummary,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
          runnumber: parseRunNumber(firstEntry(route.params.runnumber)),
          taskid: firstEntry(route.params.taskid),
        }),
      },
      {
        path: 'settings',
        name: 'org project settings',
        component: projectsettings,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectref: parseRef(firstEntry(route.params.projectref)),
        }),
      },
    ],
  },

  {
    path: '/org/:orgname/projectgroups/:projectgroupref(.*\\.proj)',
    component: ProjectGroup,
    props: (route) => ({
      ownertype: 'org',
      ownername: firstEntry(route.params.orgname),
      projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
    }),
    children: [
      {
        path: '',
        name: 'org project group',
        component: projects,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'projects',
        name: 'org project group projects',
        component: projects,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'settings',
        name: 'org project group settings',
        component: projectgroupsettings,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'createprojectgroup',
        name: 'org project group create project group',
        component: createprojectgroup,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
      {
        path: 'createproject',
        name: 'org project group create project',
        component: createproject,
        props: (route) => ({
          ownertype: 'org',
          ownername: firstEntry(route.params.orgname),
          projectgroupref: parseRef(firstEntry(route.params.projectgroupref)),
        }),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export const setupNavigationGuards = (
  auth: Auth,
  api: API,
  appState: AppState
) => {
  router.beforeEach(async (to) => {
    appState.setGlobalError();
    await until(auth.isReady).toBe(true);

    if (
      !auth.authenticated.value &&
      !['login', 'oauth2'].includes(to.name?.toString() || '')
    ) {
      auth.setLoginReturnPath();
    }

    if (
      !auth.authenticated.value &&
      !['home', 'register', 'login', 'oauth2', 'newsource'].includes(
        to.name?.toString() || ''
      )
    ) {
      return { name: 'home' };
    }

    const { path, query } = to;

    if (path == '/run') {
      // generic run handler by projectref and runnumber
      const projectref = query.projectref?.toString() || '';
      const runnumber = parseRunNumber(query.runnumber?.toString() || '');

      try {
        const project = await api.getProject(projectref);

        const parts = project.path.split('/');
        const nextPath = projectRunLink(
          parts[0],
          parts[1],
          parts.slice(2),
          runnumber
        );

        return { path: nextPath.path, replace: true };
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.aborted) return;
        }
        appState.setGlobalError(e);
      }
    }
  });
};

export default router;

function firstEntry(v: string | string[]): string {
  return Array.isArray(v) ? v[0] ?? undefined : v;
}
