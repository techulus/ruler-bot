const {
    updateChecksAsCompleted,
    updateChecksAsFailed,
} = require("./helpers/checks");
const getConfig = require("./helpers/config");

/**
 * Ruler both handler
 */
module.exports = (app) => {
    app.on(
        [
            "pull_request.opened",
            "pull_request.reopened",
            "pull_request.edited",
            "pull_request.synchronize",
        ],
        async (context) => {
            const config = await getConfig(context);
            context.log.info({
                config,
            });

            const {
                title,
                additions,
                deletions,
                state,
                draft,
                locked,
                merged,
            } = context.payload.pull_request;
            context.log.info({
                event: context.name,
                title,
                additions,
                deletions,
                state,
                draft,
                locked,
                merged,
            });

            // Ignore, we don't have to do anything
            if (draft || locked || merged || state != "open") {
                context.log.info(
                    "Ignoring PR as it doesn't pass the basic filters"
                );
                return;
            }

            context.log.info(`Checking safe words in "${title}"`);
            for (let i = 0; i < config.safeWords.length; i++) {
                if (
                    title
                        .toLowerCase()
                        .indexOf(config.safeWords[i].toLowerCase()) > -1
                ) {
                    context.log.info(
                        `Ignoring PR as title contains safe word: "${config.safeWords[i]}"`
                    );
                    return;
                }
            }

            context.log.info("Checking for content changes");
            if (Math.abs(additions - deletions) < config.maxChange) {
                context.log.info("All good, changes are under the limit");
                try {
                    return updateChecksAsCompleted(context);
                } catch (error) {
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
                    return updateChecksAsFailed(context);
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
