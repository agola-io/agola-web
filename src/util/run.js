
export function runStatus(run) {
    // * if the run has a result then return the result
    // * if stopping return "stopping"
    // * return the phase
    if (run.result != "unknown") return run.result;
    if (run.stopping) return "stopping";
    if (run.phase != "finished") return run.phase;

    return run.result;
}

export function runResultClass(run) {
    let status = runStatus(run);

    if (status == "setuperror") return "setuperror";
    if (status == "queued") return "unknown";
    if (status == "cancelled") return "failed";
    if (status == "running") return "running";
    if (status == "stopping") return "failed";
    if (status == "stopped") return "failed";
    if (status == "success") return "success";
    if (status == "failed") return "failed";
    return "unknown";
}