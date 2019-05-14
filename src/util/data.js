import { apiurl, loginapi } from "@/util/auth";
import { fetch as authfetch } from "@/util/auth";

export async function fetch(url, init) {
    try {
        let res = await authfetch(url, init)
        if (!res.ok) {
            let data = await res.json()
            return { data: null, error: data.message }
        } else {
            if (res.status == 204) {
                return { data: null, error: null }
            }
            return { data: await res.json(), error: null }
        }
    } catch (e) {
        return { data: null, error: "api call failed: " + e }
    }
}

export async function login(username, password, remotesourcename) {
    let init = {
        method: "POST",
        body: JSON.stringify({
            remote_source_name: remotesourcename,
            login_name: username,
            password: password
        })
    }

    try {
        let res = await loginapi(init)
        if (!res.ok) {
            let data = await res.json()
            return { data: null, error: data.message }
        } else {
            return { data: await res.json(), error: null }
        }
    } catch (e) {
        return { data: null, error: "api call failed: " + e }
    }
}

export async function fetchCurrentUser() {
    let path = "/user"
    return await fetch(apiurl(path));
}

export async function fetchOrgMembers(orgref) {
    let path = "/orgs/" + orgref + "/members"
    return await fetch(apiurl(path));
}

export async function fetchRuns(group, startRunID, lastrun) {
    let u = apiurl("/runs");
    if (group) {
        u.searchParams.append("group", group)
    }
    if (lastrun) {
        u.searchParams.append("lastrun", true)
    }
    if (startRunID) {
        u.searchParams.append("start", startRunID)
    }
    return await fetch(u)
}

export async function fetchRun(runid) {
    return await fetch(apiurl("/runs/" + runid));
}

export async function fetchTask(runid, taskid) {
    return await fetch(apiurl("/runs/" + runid + "/tasks/" + taskid))
}

export async function fetchUser(username) {
    let path = "/users/" + username
    return await fetch(apiurl(path));
}

export async function fetchProjectGroupSubgroups(projectgroupref) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)
    path += "/subgroups";

    return await fetch(apiurl(path));
}

export async function fetchProjectGroupProjects(projectgroupref) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)
    path += "/projects";

    return await fetch(apiurl(path));
}

export async function fetchProject(ref) {
    let path = "/projects/" + encodeURIComponent(ref)

    return await fetch(apiurl(path));
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
    return await fetch(apiurl(path));
}

export async function createOrganization(orgname, visibility) {
    let path = "/orgs"
    let init = {
        method: "POST",
        body: JSON.stringify({
            name: orgname,
            visibility: visibility,
        })
    }
    return await fetch(apiurl(path), init)
}

export async function createUserToken(username, tokenname) {
    let path = "/users/" + username + "/tokens"
    let init = {
        method: "POST",
        body: JSON.stringify({
            token_name: tokenname,
        })
    }
    return await fetch(apiurl(path), init)
}

export async function deleteUserToken(username, tokenname) {
    let path = "/users/" + username + "/tokens/" + tokenname
    let init = {
        method: "DELETE",
    }
    return await fetch(apiurl(path), init)
}

export async function deleteLinkedAccount(username, laid) {
    let path = "/users/" + username + "/linkedaccounts/" + laid
    let init = {
        method: "DELETE",
    }
    return await fetch(apiurl(path), init)
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
    return await fetch(apiurl(path), init)
}

export async function stopRun(runid) {
    let path = "/runs/" + runid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "stop"
        })
    }
    return await fetch(apiurl(path), init)
}

export async function approveTask(runid, taskid) {
    let path = "/runs/" + runid + "/tasks/" + taskid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "approve"
        })
    }
    return await fetch(apiurl(path), init)
}

export async function fetchRemoteSources() {
    let path = "/remotesources"
    return await fetch(apiurl(path));
}

export async function userRemoteRepos(remotesourceid) {
    let path = "/user/remoterepos/" + remotesourceid
    return await fetch(apiurl(path));
}

export async function createProjectGroup(parentref, name, visibility) {
    let path = "/projectgroups"
    let init = {
        method: "POST",
        body: JSON.stringify({
            name: name,
            parent_ref: parentref,
            visibility: visibility
        })
    }
    return await fetch(apiurl(path), init)
}

export async function createProject(parentref, name, visibility, remotesourcename, remoterepopath) {
    let path = "/projects"
    let init = {
        method: "POST",
        body: JSON.stringify({
            name: name,
            parent_ref: parentref,
            visibility: visibility,
            remote_source_name: remotesourcename,
            repo_path: remoterepopath,
        })
    }
    return await fetch(apiurl(path), init)
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
    return await fetch(apiurl(path), init)
}

export async function deleteProject(projectref) {
    let path = "/projects/" + encodeURIComponent(projectref)
    let init = {
        method: "DELETE",
    }
    return await fetch(apiurl(path), init)
}

export async function deleteProjectGroup(projectgroupref) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)
    let init = {
        method: "DELETE",
    }
    return await fetch(apiurl(path), init)
}