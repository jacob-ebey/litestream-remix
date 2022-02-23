# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Fly Setup

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Create Fly application. We don't want to deploy yet as we have to add volumes for SQLite.

```sh
flyctl launch --region ord --no-deploy
```

4. Add volumes to your app in two regions

```sh
flyctl volumes create --region ord --size 1 data
flyctl volumes create --region hkg --size 1 data
```

5. Scale your app to match the number of volumes you have added

```sh
flyctl scale count 2
```

6. Deploy your app from the CLI the first time

```sh
flyctl deploy --remote-only
```

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

If you've followed the setup instructions already, all you need to do is run this:

```sh
npm run deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.
