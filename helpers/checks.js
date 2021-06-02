const getConfig = require("./config");

const updateChecksAsCompleted = async (context) => {
    const config = await getConfig(context);
    const { head } = context.payload.pull_request;

    await context.octokit.checks.create(
        context.repo({
            name: config.name,
            head_sha: head.sha,
            status: "completed",
            conclusion: "success",
            completed_at: new Date().toISOString(),
            title: "Ready for review",
        })
    );
};

const updateChecksAsFailed = async (context) => {
    const config = await getConfig(context);
    const { head } = context.payload.pull_request;

    await context.octokit.checks.create(
        context.repo({
            name: config.name,
            head_sha: head.sha,
            status: "completed",
            conclusion: "failure",
            completed_at: new Date().toISOString(),
            title: config.message,
        })
    );
};

module.exports = {
    updateChecksAsCompleted,
};
