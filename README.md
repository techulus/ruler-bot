# ruler-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that Take actions based on size of pull request

## Configure

Default config:

```yaml
# Condition for triggering the check, Maximum allowed change -> (additions - deletions)
maxChange: 1000
# Message if the PR exceeds the threshold
message: "FYI: The PR changes have exceeded configured threshold"
# Close the PR if the change is more than threshold?
close: true
# Bot will ignore the PR if these words are present in title
safeWords:
  - ruler-ignore
  - wip
  - draft
```

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t ruler-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> ruler-bot
```

## Contributing

If you have suggestions for how ruler-bot could be improved, or want to report a bug, open an issue! We'd love all and
any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Thanks

<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

## License

[ISC](LICENSE) © 2021 Arjun Komath <arjun@hey.com>
