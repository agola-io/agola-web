
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

export function userLocalRunsLink(username) {
    return { name: "user local runs", params: { username: username } }
}

export function userLocalRunLink(username, runid) {
    return { name: "user local run", params: { username: username, runid: runid } }
}

export function userLocalRunTaskLink(username, runid, taskid) {
    return { name: "user local run task", params: { username: username, runid: runid, taskid: taskid } }
}

export function projectLink(ownertype, ownername, projectname) {
    return { name: ownertype + " project", params: { username: ownername, projectname: projectname } }
}

export function projectRunsLink(ownertype, ownername, projectname) {
    return { name: ownertype + " project runs", params: { orgname: ownername, projectname: projectname } }
}

export function projectRunLink(ownertype, ownername, projectname, runid) {
    return { name: ownertype + " project run", params: { orgname: ownername, projectname: projectname, runid: runid } }
}

export function projectRunTaskLink(ownertype, ownername, projectname, runid, taskid) {
    return { name: ownertype + " project run task", params: { orgname: ownername, projectname: projectname, runid: runid, taskid: taskid } }
}