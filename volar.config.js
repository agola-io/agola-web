module.exports = {
  services: [
    require('volar-service-prettier').default(
      {
        languages: ['html', 'css', 'scss', 'typescript', 'javascript'],
        html: {
          breakContentsFromTags: true,
        },
        ignoreIdeOptions: true,
      },
      // provide your prettier options, otherwise auto resolve config file by plugin
      () => ({
        // ...
      })
    ),
  ],
};
