import { apiurl, fetch } from "@/util/auth";

export async function fetchRun(runid) {
    let res = await fetch(apiurl("/run/" + runid));
    return res.json();
}

export async function fetchTask(runid, taskid) {
    let res = await fetch(apiurl("/run/" + runid + "/task/" + taskid))
    return res.json();
}