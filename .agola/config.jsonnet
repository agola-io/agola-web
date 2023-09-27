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
    { type: 'clone' },
    { type: 'restore_cache', keys: ['cache-node' + version + '-sum-{{ md5sum "package.json" }}', 'cache-node' + version + '-date-'], dest_dir: '/root/.pnpm-store' },
    { type: 'run', command: 'npm install -g pnpm@^8' },
    { type: 'run', command: 'pnpm config set store-dir /root/.pnpm-store' },
    { type: 'run', command: 'pnpm install' },
    { type: 'save_cache', key: 'cache-node' + version + '-sum-{{ md5sum "package.json" }}', contents: [{ source_dir: '/root/.pnpm-store' }] },
    { type: 'save_cache', key: 'cache-node' + version + '-date-{{ year }}-{{ month }}-{{ day }}', contents: [{ source_dir: '/root/.pnpm-store' }] },
    { type: 'run', command: 'pnpm run check' },
    { type: 'run', command: 'pnpm run build' },
    { type: 'run', command: 'pnpm run coverage' },
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
        for version in ['16', '18']
        for arch in ['amd64']
      ]) + [
        {
          name: 'checkout code and save to workspace',
          runtime: {
            arch: 'amd64',
            containers: [
              {
                image: 'alpine/git',
              },
            ],
          },
          steps: [
            { type: 'clone' },
            { type: 'save_to_workspace', contents: [{ source_dir: '.', dest_dir: '.', paths: ['**'] }] },
          ],
          depends: [],
        },
        {
          name: 'test build docker image',
          runtime: {
            arch: 'amd64',
            containers: [
              {
                image: 'gcr.io/kaniko-project/executor:debug',
              },
            ],
          },
          shell: '/busybox/sh',
          working_dir: '/workspace',
          steps: [
            { type: 'restore_workspace', dest_dir: '/workspace' },
            { type: 'run', command: '/kaniko/executor --context=dir:///workspace --no-push' },
          ],
          depends: ['checkout code and save to workspace'],
        },
        {
          name: 'build and push docker image',
          runtime: {
            arch: 'amd64',
            containers: [
              {
                image: 'gcr.io/kaniko-project/executor:debug',
              },
            ],
          },
          environment: {
            DOCKERAUTH: { from_variable: 'dockerauth' },
          },
          shell: '/busybox/sh',
          working_dir: '/kaniko',
          steps: [
            { type: 'restore_workspace', dest_dir: '/workspace' },
            {
              type: 'run',
              name: 'generate docker auth',
              command: |||
                cat << EOF > /kaniko/.docker/config.json
                {
                  "auths": {
                    "https://index.docker.io/v1/": { "auth" : "$DOCKERAUTH" }
                  }
                }
                EOF
              |||,
            },
            { type: 'run', command: '/kaniko/executor --context=dir:///workspace --destination sorintlab/agola-web:$AGOLA_GIT_TAG' },
          ],
          depends: ['checkout code and save to workspace'],
          when: {
            tag: '#v.*#',
          },
        },
      ],
    },
  ],
}
