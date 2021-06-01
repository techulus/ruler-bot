const defaultConfig = {
  name: "Ruler",
  maxChange: 1000,
  close: true,
  message: "Closing the PR as the changes have exceeded 1000 lines",
};

module.exports = (app) => {
  app.on(
    ["pull_request.opened", "pull_request.edited", "pull_request.synchronize"],
    async (context) => {
      const config = await context.config("ruler.yml", defaultConfig);
      context.log.info({
        config,
      });

      const { additions, deletions, head } = context.payload.pull_request;
      context.log.info({
        event: context.name,
        additions,
        deletions,
      });

      if (additions + deletions < config.maxChange) {
        try {
          return context.octokit.checks.create(
            context.repo({
              name: config.name,
              head_sha: head.sha,
              status: "completed",
              conclusion: "success",
              completed_at: new Date().toISOString(),
              title: "Ready for review",
            })
          );
        } catch (e) {
          context.log.error({ error });
        }
      }

      try {
        await context.octokit.issues.createComment(
          context.issue({ body: config.message })
        );

        if (config.close) {
          await context.octokit.issues.update(
            context.issue({ state: "closed" })
          );
        } else {
          return context.octokit.checks.create(
            context.repo({
              name: config.name,
              head_sha: head.sha,
              status: "completed",
              conclusion: "failure",
              completed_at: new Date().toISOString(),
              title: "Check has failed",
            })
          );
        }
      } catch (error) {
        context.log.error({ error });
      }
    }
  );

  // For testing
  // app.onAny(async (context) => {
  //   context.log.info({ event: context.name });
  // });
};
