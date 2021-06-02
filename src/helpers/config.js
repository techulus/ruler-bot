const defaultConfig = {
    name: "Ruler",
    maxChange: 1000,
    close: true,
    message: "FYI: The PR changes have exceeded configured threshold",
    safeWords: ["ruler-ignore", "wip", "draft"],
};

const getConfig = async (context) => {
    return await context.config("ruler.yml", defaultConfig);
};

module.exports = getConfig;
