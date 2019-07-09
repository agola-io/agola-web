import { apiurl, loginapi, registerapi } from "@/util/auth";
import { fetch as authfetch } from "@/util/auth";
import router from "@/router";

export async function fetch(url, init) {
    try {
        let res = await authfetch(url, init)
        if (!res.ok) {
            if (res.status === 401) {
                router.push({ name: "login" })
                // if we return a response containing an error what happens is
                // that router.push mounts the login view before the calling
                // component processed the response and the calling component
                // may set the "unauthorized" error as a global error hiding the
                // login view.
                // So return an empty response so the caller won't set a global
                // error (but in the console will appear other errors since also
                // data is null)

                // TODO(sgotti) find a way to make this cleaner. The solution
                // could be to find a way to firstly let the component handle
                // the error and the do the router push...
                return
            }
            let data = await res.json()
            return { data: null, error: data.message }
        } else {
            if (res.status == 204) {
                return { data: null, error: null }
            }
            return { data: await res.json(), error: null }
        }
    } catch (e) {
        return { data: null, error: "api call failed: " + e.message }
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
        return { data: null, error: "api call failed: " + e.message }
    }
}

export async function register(username, remotesourcename, remoteloginname, remotepassword) {
    let init = {
        method: "POST",
        body: JSON.stringify({
            username: username,
            remote_source_name: remotesourcename,
            remote_source_login_name: remoteloginname,
            remote_source_login_password: remotepassword
        })
    }

    try {
        let res = await registerapi(init)
        if (!res.ok) {
            let data = await res.json()
            return { data: null, error: data.message }
        } else {
            return { data: await res.json(), error: null }
        }
    } catch (e) {
        return { data: null, error: "api call failed: " + e.message }
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

export async function fetchProjectGroup(projectgroupref) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)

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

export async function fetchSecrets(ownertype, ref, all) {
    let path
    if (ownertype == "project") {
        path = "/projects/"
    } else if (ownertype == "projectgroup") {
        path = "/projectgroups/"
    }
    path += encodeURIComponent(ref);
    path += "/secrets";
    if (all) {
        path += "?tree&removeoverridden";
    }
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

export async function createUserLinkedAccount(username, remotesourcename, loginname, password) {
    let path = "/users/" + username + "/linkedaccounts"
    let init = {
        method: "POST",
        body: JSON.stringify({
            remote_source_name: remotesourcename,
            remote_source_login_name: loginname,
            remote_source_login_password: password,
        })
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

export async function cancelRun(runid) {
    let path = "/runs/" + runid + "/actions"
    let init = {
        method: "PUT",
        body: JSON.stringify({
            action_type: "cancel"
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

export async function updateProjectGroup(projectgroupref, name, visibility) {
    let path = "/projectgroups/" + encodeURIComponent(projectgroupref)
    let init = {
        method: "PUT",
        body: JSON.stringify({
            name: name,
            visibility: visibility,
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

export async function projectUpdateRepoLinkedAccount(projectref) {
    let path = "/projects/" + encodeURIComponent(projectref) + "/updaterepolinkedaccount"
    let init = {
        method: "PUT",
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