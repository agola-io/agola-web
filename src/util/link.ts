import { RouteLocationPathRaw, RouteLocationRaw } from 'vue-router';

export function parseRef(ref: string): string[] {
  ref = ref.replace(/\.proj/, '');
  // return empty array or split return an array with the empty element
  if (!ref) {
    return [];
  }
  return ref.split('/');
}

export function parseRunNumber(runnumber: string): number {
  return parseInt(runnumber);
}

export function ownerLink(
  ownertype: string,
  ownername: string
): RouteLocationRaw {
  if (ownertype == 'user') {
    return { name: ownertype, params: { username: ownername } };
  } else if (ownertype == 'org') {
    return { name: ownertype, params: { orgname: ownername } };
  }
  return {};
}

export function ownerProjectsLink(
  ownertype: string,
  ownername: string
): RouteLocationRaw {
  if (ownertype == 'user') {
    return { name: ownertype + ' projects', params: { username: ownername } };
  } else if (ownertype == 'org') {
    return { name: ownertype + ' projects', params: { orgname: ownername } };
  }

  return {};
}

export function ownerSettingsLink(
  ownertype: string,
  ownername: string
): RouteLocationRaw {
  if (ownertype == 'user') {
    return { name: ownertype + ' settings', params: { username: ownername } };
  } else if (ownertype == 'org') {
    return { name: ownertype + ' settings', params: { orgname: ownername } };
  }

  return {};
}

export function userOrganizationsLink(): RouteLocationRaw {
  return { name: 'user orgs' };
}

export function userDirectRunsLink(username: string): RouteLocationRaw {
  return { name: 'user direct runs', params: { username: username } };
}

export function userDirectRunLink(
  username: string,
  runnumber: number
): RouteLocationRaw {
  return {
    name: 'user direct run',
    params: { username: username, runnumber: runnumber },
  };
}

export function userDirectRunTaskLink(
  username: string,
  runnumber: number,
  taskid: string
): RouteLocationRaw {
  return {
    name: 'user direct run task',
    params: { username: username, runnumber: runnumber, taskid: taskid },
  };
}

export function userAddLinkedAccountLink(
  username: string,
  remotesourcename: string
): RouteLocationRaw {
  return {
    name: 'user add linked account',
    params: { username: username, remotesource: remotesourcename },
  };
}

export function organizationLink(organizationRef: string[]): RouteLocationRaw {
  return { path: `/org/${organizationRef}` };
}

export function orgMembersLink(orgname: string): RouteLocationRaw {
  return { name: 'org members', params: { orgname: orgname } };
}

// Note, when creating a router link containing a project/projectgroup ref (a
// path), unfortunately, we cannot use route name and params since it will path
// escape it
export function projectGroupPath(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): string {
  let path = `/${ownertype}/${ownername}`;
  // root project group will have a .proj without a name
  const projectgrouppath = projectgroupref.join('/') + '.proj';
  path = `${path}/projectgroups/${projectgrouppath}`;
  return path;
}

export function projectPath(
  ownertype: string,
  ownername: string,
  projectref: string[]
): string {
  let path = `/${ownertype}/${ownername}`;
  const projectpath = projectref.join('/') + '.proj';
  path = `${path}/projects/${projectpath}`;
  return path;
}

export function projectGroupLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  return { path: projectGroupPath(ownertype, ownername, projectgroupref) };
}

export function projectGroupProjectsLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const projectgrouppath = projectgroupref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projectgroups/${projectgrouppath}/projects`,
  };
}

export function projectLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return { path: `/${ownertype}/${ownername}/projects/${projectpath}` };
}

export function projectRunsLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return { path: `/${ownertype}/${ownername}/projects/${projectpath}/runs` };
}

export function projectBranchesRunsLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projects/${projectpath}/branches`,
  };
}

export function projectTagsRunsLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return { path: `/${ownertype}/${ownername}/projects/${projectpath}/tags` };
}

export function projectPRsRunsLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projects/${projectpath}/pullrequests`,
  };
}

export function projectRunLink(
  ownertype: string,
  ownername: string,
  projectref: string[],
  runnumber: number
): RouteLocationPathRaw {
  const projectpath = projectref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projects/${projectpath}/runs/${runnumber}`,
  };
}

export function projectRunTaskLink(
  ownertype: string,
  ownername: string,
  projectref: string[],
  runnumber: number,
  taskid: string
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projects/${projectpath}/runs/${runnumber}/tasks/${taskid}`,
  };
}

export function projectGroupSettingsLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/settings` };
}

export function projectSettingsLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const projectpath = projectref.join('/') + '.proj';
  return {
    path: `/${ownertype}/${ownername}/projects/${projectpath}/settings`,
  };
}

export function projectNewSecretLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const path = projectPath(ownertype, ownername, projectref);
  return { path: `${path}/secrets/new` };
}

export function projectUpdateSecretLink(
  ownertype: string,
  ownername: string,
  projectref: string[],
  secretName?: string
): RouteLocationRaw {
  const path = projectPath(ownertype, ownername, projectref);
  return { path: `${path}/secrets/update/${secretName}` };
}

export function projectGroupNewSecretLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/secrets/new` };
}

export function projectGroupUpdateSecretLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[],
  secretName?: string
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/secrets/update/${secretName}` };
}

export function projectNewVariableLink(
  ownertype: string,
  ownername: string,
  projectref: string[]
): RouteLocationRaw {
  const path = projectPath(ownertype, ownername, projectref);
  return { path: `${path}/variables/new` };
}

export function projectUpdateVariableLink(
  ownertype: string,
  ownername: string,
  projectref: string[],
  variableName?: string
): RouteLocationRaw {
  const path = projectPath(ownertype, ownername, projectref);
  return { path: `${path}/variables/update/${variableName}` };
}

export function projectGroupNewVariableLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/variables/new` };
}

export function projectGroupUpdateVariableLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[],
  variableName?: string
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/variables/update/${variableName}` };
}

export function projectGroupCreateProjectGroupLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/createprojectgroup` };
}

export function projectGroupCreateProjectLink(
  ownertype: string,
  ownername: string,
  projectgroupref: string[]
): RouteLocationRaw {
  const path = projectGroupPath(ownertype, ownername, projectgroupref);
  return { path: `${path}/createproject` };
}
