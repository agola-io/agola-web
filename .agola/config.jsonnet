local node_runtime(version, arch) = {
  arch: arch,
  containers: [
    {
      image: 'node:' + version,
    },
  ],
};

local task_build(version, arch) = {
  name: 'build - node ' + version + ' ' + arch,
  runtime: node_runtime(version, arch),
  environment: {},
  steps: [
    { type: 'run', command: 'env' },
    { type: 'clone' },
    { type: 'restore_cache', keys: ['cache-node'+version+'-sum-{{ md5sum "package.json" }}', 'cache-node'+version+'-date-'], dest_dir: './node_modules' },
    { type: 'run', command: 'npm install' },
    { type: 'run', command: 'npm run build' },
    { type: 'save_cache', key: 'cache-node'+version+'-sum-{{ md5sum "package.json" }}', contents: [{ source_dir: './node_modules' }] },
    { type: 'save_cache', key: 'cache-node'+version+'-date-{{ year }}-{{ month }}-{{ day }}', contents: [{ source_dir: './node_modules' }] },
  ],
};

{
  runs: [
    {
      name: 'agola web build/test',
      tasks: std.flattenArrays([
        [
          task_build(version, arch),
        ]
        for version in ['11', '12']
        for arch in ['amd64']
      ]) 
    },
  ],
}
