import { apiurl, fetch } from "@/util/auth";

export async function fetchRun(runid) {
    let res = await fetch(apiurl("/run/" + runid));
    return res.json();
}

export async function fetchTask(runid, taskid) {
    let res = await fetch(apiurl("/run/" + runid + "/task/" + taskid))
    return res.json();
}

export async function fetchVariables(ownertype, ownername, projectname, all) {
    let path =
        "/projects/" +
        encodeURIComponent(ownertype + "/" + ownername + "/" + projectname);
    path += "/variables";
    if (all) {
        path += "?tree&removeoverridden";
    }
    let res = await fetch(apiurl(path));
    return res.json();
}