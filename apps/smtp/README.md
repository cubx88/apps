<div style="text-align: center">
  <img width="150" alt="" src="./public/logo.png">
</div>

<div style="text-align: center">
  <h1>Saleor App SMTP</h1>

  <p>The SMTP application is responsible for sending emails and messages to customers. It is connected to the Saleor API via webhooks, which notify the application about events. The messages are delivered by the SMTP protocol configured in the application.</p>
</div>

<div style="text-align: center">
  <a target="_blank" rel="noopener noreferrer" href="https://docs.saleor.io/developer/app-store/apps/smtp/overview">Docs</a>
<br><br>
</div>

### How to use this project

#### Requirements

- [node v22](https://nodejs.org)
- [pnpm](https://pnpm.io/)
- [ngrok](https://ngrok.com/)
- [docker](https://www.docker.com/)
- Saleor Cloud account (free!) or local instance

#### Running app locally in development containers

> [!IMPORTANT]
> You can use the devcontainer Dockerfile and docker-compose.yaml directly - but remember to run `pnpm install` manually

The easiest way to run Saleor for local development is to use [development containers](https://containers.dev/).
If you have Visual Studio Code, follow their [guide](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container) on how to open an existing folder in a container.

The development container only creates a container; you still need to start the server.

The development container will have a port opened:

1. `3000` - where the app dev server will listen for requests

#### Running app in development mode

1. Install the dependencies by running the following command in the shell:

```shell
pnpm install
```

2. Create a file named `.env` and use the contents of the [`.env.example`](./.env.example) file as a reference.

3. Start the development server by running the following command in the shell:

```shell
pnpm dev
```

4. SMTP app will be available under `http://localhost:3000`

5. Tunnel the app by running:

```shell
ngrok http localhost:3000
```

> [!NOTE]
> See [How to tunnel an app](https://docs.saleor.io/developer/extending/apps/developing-with-tunnels) for more info.

6. Go to Dashboard, open the `Apps` tab and click `Install external app`, provide your tunnel URL with the path for the manifest file. For example `${YOUR_TUNNEL_URL}/api/manifest`

### Configuration

[Here](./docs/configuration.md) you can find doc how configure the app

### Generated schema and typings

Commands `build` and `dev` would generate schema and typed functions using Saleor's GraphQL endpoint. Commit a `generated` folder to your repo as they are necessary for queries and keeping track of the schema changes.

[Learn more](https://www.graphql-code-generator.com/) about GraphQL code generation.

### Storing registration data - APL

During the registration process, Saleor API passes the auth token to the app. With this token, the app can query Saleor API with privileged access (depending on permissions requested during installation).
To store this data, the app-template uses a different [APL interface](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl).

The choice of the APL is done using the `APL` environment variable. If the value is not set, FileAPL is used. Available choices:

- `file`: no additional setup is required. Good choice for local development. Can't be used for multi tenant-apps or be deployed (not intended for production)
- `upstash`: use [Upstash](https://upstash.com/) Redis as storage method. Free account required. Can be used for development and production and supports multi-tenancy. Requires `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables to be set

If you want to use your own database, you can implement your own APL. [Check the documentation to read more.](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)

### Learn more about Saleor Apps

[Apps guide](https://docs.saleor.io/developer/extending/apps/overview)

## OTEL

Visit `@saleor/apps-otel` [README](../../packages/otel/README.md) to learn how to run app with OTEL locally.
