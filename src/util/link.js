export function parseRef(ref) {
    ref = ref.replace(/\.proj/, "")
    // return empty array or split return an array with the empty element
    if (!ref) {
        return []
    }
    return ref.split("/")
}

export function ownerLink(ownertype, ownername) {
    if (ownertype == "user") {
        return { name: ownertype, params: { username: ownername } }
    } else if (ownertype == "org") {
        return { name: ownertype, params: { orgname: ownername } }
    }
}

export function ownerProjectsLink(ownertype, ownername) {
    return { name: ownertype + " projects", params: { ownername: ownername } }
}

export function ownerSettingsLink(ownertype, ownername) {
    if (ownertype == "user") {
        return { name: ownertype + " settings", params: { username: ownername } }
    } else if (ownertype == "org") {
        return { name: ownertype + " settings", params: { orgname: ownername } }
    }
}

export function userLocalRunsLink(username) {
    return { name: "user local runs", params: { username: username } }
}

export function userLocalRunLink(username, runid) {
    return { name: "user local run", params: { username: username, runid: runid } }
}

export function userLocalRunTaskLink(username, runid, taskid) {
    return { name: "user local run task", params: { username: username, runid: runid, taskid: taskid } }
}

export function userAddLinkedAccountLink(username, remotesourcename) {
    return { name: "user add linked account", params: { username: username, remotesource: remotesourcename } }
}

export function orgMembersLink(orgname) {
    return { name: "org members", params: { orgname: orgname } }
}

// Note, when creating a router link containing a project/projectgroup ref (a
// path), unfortunately, we cannot use route name and params since it will path
// escape it
export function projectGroupPath(ownertype, ownername, projectgroupref) {
    let path = `/${ownertype}/${ownername}`
    // root project group will have a .proj without a name
    let projectgrouppath = (projectgroupref.join("/") + ".proj")
    path = `${path}/projectgroups/${projectgrouppath}`
    return path
}

export function projectPath(ownertype, ownername, projectref) {
    let path = `/${ownertype}/${ownername}`
    let projectpath = (projectref.join("/") + ".proj")
    path = `${path}/projects/${projectpath}`
    return path
}

export function projectGroupLink(ownertype, ownername, projectgroupref) {
    return { path: projectGroupPath(ownertype, ownername, projectgroupref) }
}

export function projectGroupProjectsLink(ownertype, ownername, projectgroupref) {
    let projectgrouppath = (projectgroupref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projectgroups/${projectgrouppath}/projects` }
}

export function projectLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}` }
}

export function projectRunsLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/runs` }
}

export function projectBranchesRunsLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/branches` }
}

export function projectTagsRunsLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/tags` }
}

export function projectPRsRunsLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/pullrequests` }
}

export function projectRunLink(ownertype, ownername, projectref, runid) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/runs/${runid}` }
}

export function projectRunTaskLink(ownertype, ownername, projectref, runid, taskid) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/runs/${runid}/tasks/${taskid}` }
}

export function projectGroupSettingsLink(ownertype, ownername, projectgroupref) {
    let path = projectGroupPath(ownertype, ownername, projectgroupref)
    return { path: `${path}/settings` }
}

export function projectSettingsLink(ownertype, ownername, projectref) {
    let projectpath = (projectref.join("/") + ".proj")
    return { path: `/${ownertype}/${ownername}/projects/${projectpath}/settings` }
}

export function projectGroupCreateProjectGroupLink(ownertype, ownername, projectgroupref) {
    let path = projectGroupPath(ownertype, ownername, projectgroupref)
    return { path: `${path}/createprojectgroup` }
}

export function projectGroupCreateProjectLink(ownertype, ownername, projectgroupref) {
    let path = projectGroupPath(ownertype, ownername, projectgroupref)
    return { path: `${path}/createproject` }
}