import router from "@/router";
import { apiurl, fetch as authfetch, loginapi, registerapi } from "@/util/auth";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_SSH_KEY = "github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==";

export async function fetch(url, init, signal, token, tokenType) {
  try {
    let res = await authfetch(url, init, signal, token, tokenType);
    if (!res.ok) {
      if (res.status === 401) {
        router.push({
          name: "login",
          query: { redirect: router.currentRoute.fullPath }
        });
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
        return;
      }
      let data = await res.json();
      return { data: null, error: data.message };
    } else {
      if (res.status == 204) {
        return { data: null, error: null };
      }
      return { data: await res.json(), error: null };
    }
  } catch (e) {
    if (e.name == "AbortError") {
      return { data: null, error: null, aborted: true };
    }
    return { data: null, error: "api call failed: " + e.message };
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
  };

  try {
    let res = await loginapi(init);
    if (!res.ok) {
      let data = await res.json();
      return { data: null, error: data.message };
    } else {
      return { data: await res.json(), error: null };
    }
  } catch (e) {
    return { data: null, error: "api call failed: " + e.message };
  }
}

export async function register(
  username,
  remotesourcename,
  remoteloginname,
  remotepassword
) {
  let init = {
    method: "POST",
    body: JSON.stringify({
      username: username,
      remote_source_name: remotesourcename,
      remote_source_login_name: remoteloginname,
      remote_source_login_password: remotepassword
    })
  };

  try {
    let res = await registerapi(init);
    if (!res.ok) {
      let data = await res.json();
      return { data: null, error: data.message };
    } else {
      return { data: await res.json(), error: null };
    }
  } catch (e) {
    return { data: null, error: "api call failed: " + e.message };
  }
}

export async function fetchCurrentUser(signal) {
  let path = "/user";
  return await fetch(apiurl(path), null, signal);
}

export async function fetchOrgMembers(orgref, signal) {
  let path = "/orgs/" + orgref + "/members";
  return await fetch(apiurl(path), null, signal);
}

export async function fetchRuns(group, startRunID, lastrun, signal) {
  let u = apiurl("/runs");
  if (group) {
    u.searchParams.append("group", group);
  }
  if (lastrun) {
    u.searchParams.append("lastrun", true);
  }
  if (startRunID) {
    u.searchParams.append("start", startRunID);
  }

  return await fetch(u, null, signal);
}

export async function fetchRun(runid, signal) {
  return await fetch(apiurl("/runs/" + runid), null, signal);
}

export async function fetchTask(runid, taskid, signal) {
  return await fetch(apiurl("/runs/" + runid + "/tasks/" + taskid), signal);
}

export async function fetchUser(username, signal) {
  let path = "/users/" + username;
  return await fetch(apiurl(path), null, signal);
}

export async function fetchProjectGroup(projectgroupref, signal) {
  let path = "/projectgroups/" + encodeURIComponent(projectgroupref);

  return await fetch(apiurl(path), null, signal);
}

export async function fetchProjectGroupSubgroups(projectgroupref, signal) {
  let path = "/projectgroups/" + encodeURIComponent(projectgroupref);
  path += "/subgroups";

  return await fetch(apiurl(path), null, signal);
}

export async function fetchProjectGroupProjects(projectgroupref, signal) {
  let path = "/projectgroups/" + encodeURIComponent(projectgroupref);
  path += "/projects";

  return await fetch(apiurl(path), null, signal);
}

export async function fetchProject(ref, signal) {
  let path = "/projects/" + encodeURIComponent(ref);

  return await fetch(apiurl(path), null, signal);
}

export async function fetchSecrets(ownertype, ref, all, signal) {
  let path;
  if (ownertype == "project") {
    path = "/projects/";
  } else if (ownertype == "projectgroup") {
    path = "/projectgroups/";
  }
  path += encodeURIComponent(ref);
  path += "/secrets";
  if (all) {
    path += "?tree&removeoverridden";
  }
  return await fetch(apiurl(path), null, signal);
}

export async function fetchVariables(ownertype, ref, all, signal) {
  let path;
  if (ownertype == "project") {
    path = "/projects/";
  } else if (ownertype == "projectgroup") {
    path = "/projectgroups/";
  }
  path += encodeURIComponent(ref);
  path += "/variables";
  if (all) {
    path += "?tree&removeoverridden";
  }
  return await fetch(apiurl(path), null, signal);
}

export async function createRemoteSource(
  token, type, name, clientID, clientSecret, apiURL, authType, skipVerify,
  sshHostKey, skipSshHostKeyCheck, registrationEnabled, loginEnabled, signal,
) {
  let path = "/remotesources";
  let init = {
    method: "POST",
    body: JSON.stringify({
      name,
      apiurl: apiURL,
      type,
      auth_type: authType,
      skip_verify: skipVerify,
      ssh_host_key: sshHostKey,
      skip_ssh_host_key_check: skipSshHostKeyCheck,
      oauth_2_client_id: clientID,
      oauth_2_client_secret: clientSecret,
      registration_enabled: registrationEnabled,
      login_enabled: loginEnabled,
    })
  };
  return await fetch(apiurl(path), init, signal, token, "token");
}

export async function createOrganization(orgname, visibility, signal) {
  let path = "/orgs";
  let init = {
    method: "POST",
    body: JSON.stringify({
      name: orgname,
      visibility: visibility
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function createUserToken(username, tokenname, signal) {
  let path = "/users/" + username + "/tokens";
  let init = {
    method: "POST",
    body: JSON.stringify({
      token_name: tokenname
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function deleteUserToken(username, tokenname, signal) {
  let path = "/users/" + username + "/tokens/" + tokenname;
  let init = {
    method: "DELETE"
  };
  return await fetch(apiurl(path), init, signal);
}

export async function createUserLinkedAccount(
  username,
  remotesourcename,
  loginname,
  password,
  signal
) {
  let path = "/users/" + username + "/linkedaccounts";
  let init = {
    method: "POST",
    body: JSON.stringify({
      remote_source_name: remotesourcename,
      remote_source_login_name: loginname,
      remote_source_login_password: password
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function deleteLinkedAccount(username, laid, signal) {
  let path = "/users/" + username + "/linkedaccounts/" + laid;
  let init = {
    method: "DELETE"
  };
  return await fetch(apiurl(path), init, signal);
}

export async function restartRun(runid, fromStart, signal) {
  let path = "/runs/" + runid + "/actions";
  let init = {
    method: "PUT",
    body: JSON.stringify({
      action_type: "restart",
      from_start: fromStart
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function cancelRun(runid, signal) {
  let path = "/runs/" + runid + "/actions";
  let init = {
    method: "PUT",
    body: JSON.stringify({
      action_type: "cancel"
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function stopRun(runid, signal) {
  let path = "/runs/" + runid + "/actions";
  let init = {
    method: "PUT",
    body: JSON.stringify({
      action_type: "stop"
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function approveTask(runid, taskid, signal) {
  let path = "/runs/" + runid + "/tasks/" + taskid + "/actions";
  let init = {
    method: "PUT",
    body: JSON.stringify({
      action_type: "approve"
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function fetchRemoteSources(signal) {
  let path = "/remotesources";
  return await fetch(apiurl(path), null, signal);
}

export async function userRemoteRepos(remotesourceid, signal) {
  let path = "/user/remoterepos/" + remotesourceid;
  return await fetch(apiurl(path, null, signal));
}

export async function createProjectGroup(parentref, name, visibility, signal) {
  let path = "/projectgroups";
  let init = {
    method: "POST",
    body: JSON.stringify({
      name: name,
      parent_ref: parentref,
      visibility: visibility
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function updateProjectGroup(
  projectgroupref,
  name,
  visibility,
  signal
) {
  let path = "/projectgroups/" + encodeURIComponent(projectgroupref);
  let init = {
    method: "PUT",
    body: JSON.stringify({
      name: name,
      visibility: visibility
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function createProject(
  parentref,
  name,
  visibility,
  remotesourcename,
  remoterepopath,
  passvarstoforkedpr,
  signal
) {
  let path = "/projects";
  let init = {
    method: "POST",
    body: JSON.stringify({
      name: name,
      parent_ref: parentref,
      visibility: visibility,
      remote_source_name: remotesourcename,
      repo_path: remoterepopath,
      pass_vars_to_forked_pr: passvarstoforkedpr
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function updateProject(projectref, name, visibility, passvarstoforkedpr, signal) {
  let path = "/projects/" + encodeURIComponent(projectref);
  let init = {
    method: "PUT",
    body: JSON.stringify({
      name: name,
      visibility: visibility,
      pass_vars_to_forked_pr: passvarstoforkedpr
    })
  };
  return await fetch(apiurl(path), init, signal);
}

export async function deleteProject(projectref, signal) {
  let path = "/projects/" + encodeURIComponent(projectref);
  let init = {
    method: "DELETE"
  };
  return await fetch(apiurl(path), init, signal);
}

export async function projectUpdateRepoLinkedAccount(projectref, signal) {
  let path =
    "/projects/" + encodeURIComponent(projectref) + "/updaterepolinkedaccount";
  let init = {
    method: "PUT"
  };
  return await fetch(apiurl(path), init, signal);
}

export async function deleteProjectGroup(projectgroupref, signal) {
  let path = "/projectgroups/" + encodeURIComponent(projectgroupref);
  let init = {
    method: "DELETE"
  };
  return await fetch(apiurl(path), init, signal);
}

