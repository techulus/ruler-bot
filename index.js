const defaultConfig = {
  name: "Ruler",
  maxChange: 1000,
  close: true,
  message: "Closing the PR as the changes have exceeded 1000 lines",
  safeWords: ["ruler-ignore", "wip", "draft"],
};

module.exports = (app) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.reopened",
      "pull_request.edited",
      "pull_request.synchronize",
    ],
    async (context) => {
      const config = await context.config("ruler.yml", defaultConfig);
      context.log.info({
        config,
      });

      const { title, additions, deletions, head } =
        context.payload.pull_request;
      context.log.info({
        event: context.name,
        title,
        additions,
        deletions,
      });

      context.log.info(`Checking safe words in ${title}`);
      for (let i = 0; i < config.safeWords.length; i++) {
        if (title.indexOf(config.safeWords[i]) > -1) {
          context.log.info(
            `Ignoring PR as title contains safe word: ${config.safeWords[i]}`
          );
          return;
        }
      }

      context.log.info("Checking changes");
      if (Math.abs(additions - deletions) < config.maxChange) {
        context.log.info("All good, changes are under the limit");
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

      context.log.info("Oh oh, that doesn't look good");
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
