import { apiurl, fetch } from "@/util/auth";

export async function fetchCurrentUser() {
    let path = "/user"
    let res = await fetch(apiurl(path));
    return res.json();
}

export async function fetchRuns(group, lastrun) {
    let u = apiurl("/runs");
    if (group) {
        u.searchParams.append("group", group)
    }
    if (lastrun) {
        u.searchParams.append("lastrun", true)
    }
    let res = await fetch(u)
    return res.json();
}

export async function fetchRun(runid) {
    let res = await fetch(apiurl("/runs/" + runid));
    return res.json();
}

export async function fetchTask(runid, taskid) {
    let res = await fetch(apiurl("/runs/" + runid + "/tasks/" + taskid))
    return res.json();
}

export async function fetchProject(ref) {
    let path = "/projects/" + encodeURIComponent(ref)

    let res = await fetch(apiurl(path));
    return res.json();
}

export async function fetchVariables(ownertype, ref, all) {
    let path
    if (ownertype == "project") {
        path = "/projects/"
    } else if (ownertype == "projectgroup") {
        path = "/projectgroups/"
    }
    path += encodeURIComponent(ref);
    path += "/variables";
    if (all) {
        path += "?tree&removeoverridden";
    }
    let res = await fetch(apiurl(path));
    return res.json();
}

export async function createUserToken(username, tokenname) {
    let path = "/users/" + username + "/tokens"
    let init = {
        method: "POST",
        body: JSON.stringify({
            token_name: tokenname,
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function deleteUserToken(username, tokenname) {
    let path = "/users/" + username + "/tokens/" + tokenname
    let init = {
        method: "DELETE",
    }
    let res = await fetch(apiurl(path), init)
    return res.text();
}

export async function restartRun(runid, fromStart) {
    let path = "/runs/" + runid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "restart",
            from_start: fromStart
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function stopRun(runid) {
    let path = "/runs/" + runid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "stop"
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function approveTask(runid, taskid) {
    let path = "/runs/" + runid + "/tasks/" + taskid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "approve"
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function fetchRemoteSources() {
    let path = "/remotesources"
    let res = await fetch(apiurl(path));
    return res.json();
}

export async function userRemoteRepos(remotesourceid) {
    let path = "/user/remoterepos/" + remotesourceid
    let res = await fetch(apiurl(path));
    return res.json();
}

export async function createProjectGroup(parentref, name) {
    let path = "/projectgroups"
    let init = {
        method: "POST",
        body: JSON.stringify({
            name: name,
            parent_ref: parentref,
            visibility: "public",
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function createProject(parentref, name, remotesourcename, remoterepopath) {
    let path = "/projects"
    let init = {
        method: "POST",
        body: JSON.stringify({
            name: name,
            parent_ref: parentref,
            visibility: "public",
            remote_source_name: remotesourcename,
            repo_path: remoterepopath,
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json();
}

export async function updateProject(projectref, name, visibility) {
    let path = "/projects/" + encodeURIComponent(projectref)
    let init = {
        method: "PUT",
        body: JSON.stringify({
            name: name,
            visibility: visibility,
        })
    }
    let res = await fetch(apiurl(path), init)
    return res.json()
}

export async function deleteProject(projectref) {
    let path = "/projects/" + encodeURIComponent(projectref)
    let init = {
        method: "DELETE",
    }
    let res = await fetch(apiurl(path), init)
    return res.text();
}

export async function deleteProjectGroup(projectgroupref) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)
    let init = {
        method: "DELETE",
    }
    let res = await fetch(apiurl(path), init)
    return res.text();
}