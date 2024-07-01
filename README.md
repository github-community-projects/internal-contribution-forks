[![CodeQL](https://github.com/github-community-projects/private-mirrors/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/github-community-projects/private-mirrors/actions/workflows/github-code-scanning/codeql)
[![Docker Build](https://github.com/github-community-projects/private-mirrors/actions/workflows/docker-build.yml/badge.svg)](https://github.com/github-community-projects/private-mirrors/actions/workflows/docker-build.yml)
[![Lint](https://github.com/github-community-projects/private-mirrors/actions/workflows/lint.yml/badge.svg)](https://github.com/github-community-projects/private-mirrors/actions/workflows/lint.yml)
[![Tests](https://github.com/github-community-projects/private-mirrors/actions/workflows/tests.yml/badge.svg)](https://github.com/github-community-projects/private-mirrors/actions/workflows/tests.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/github-community-projects/private-mirrors/badge)](https://scorecard.dev/viewer/?uri=github.com/github-community-projects/private-mirrors)

<h1 align="center">
  GitHub Private Mirrors App
</h1>

<h4 align="center">A GitHub App that allows you to contribute upstream using private mirrors of public repositories</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#developing">Developing</a> •
  <a href="#background">Background</a> •
  <a href="#license">MIT License</a>
</p>

The Private Mirrors App (PMA) is GitHub App that allows you to work on contributions to an upstream open source project using a private repository in your own organization. This is useful for developing and checking contributions internally before making any commits publicly visible.

For a video overview, check out [this short presentation and demo video](https://www.youtube.com/watch?v=xdiFALgHa2Y).

[![PMA YouTube Video Thumbnail](https://github.com/user-attachments/assets/37eaed15-bb23-4ba2-9c0e-04b6bec8a1e7)](https://www.youtube.com/watch?v=xdiFALgHa2Y)

> [!IMPORTANT]
> 📣 EMU support is now available! Check out the [hosting - GHEC](#integrating-the-app-into-ghec) section for more information.
>
> This app is still a work in progress and is pre-1.0 _public beta_. We are actively working on improving it with beta testers, and if you're interested in using it for your organization, [we'd love to hear from you](https://github.com/github-community-projects/private-mirrors/issues/new)!

## Background

Enterprises struggle with how to let their developers contribute to open source projects. Most are not opposed, in principle, to contributing back to the projects they rely upon. Many are enthusiastic about becoming better open source citizens, and understand the reputational and technical benefits that working in open source can accrue to the business. However, real and perceived security concerns make this process difficult at best and impossible at worst for companies.

To succeed, open source advocates and OSPOs need to address their stakeholders' concerns about:

- Credential leaks
- Intellectual property leaks
- PII / PHI disclosure
- Liability and/or reputational damage resulting from bad code

Addressing these concerns creates opportunities for enterprise development teams to participate more deeply in open source and foster a collaborative relationship with the open source community.

> The Private Mirrors App (PMA) is a GitHub App paired with a UI that manages the lifecycle of private mirrors, as well as the synchronization of code between the public fork of an upstream project and the private mirrors where the enterprise teams are working.

## Key Features

- Piggybacks off native GitHub fork network functionality to allow you to contribute to an upstream project using a private repository in your own organization
- No commit rewriting — keep commit history, author attributions, commit signing and other metadata intact
- No datastore — no need to worry about storing your code on a third-party server
- Reduces risk of making open source contributions to upstream projects because your work stays private until it passes approval
- Adapt the app to your workflow to ensure approvals, checks, and other requirements are met before code is merged upstream
- Works with GitHub Enterprise Managed Users (EMUs) and GitHub Enterprise Cloud (GHEC)

High Level Flow:

![Time-series diagram showing work starting upstream, moving into a public fork, and through PMA into a private mirror](https://github.com/user-attachments/assets/dfc3d0fa-14e3-4c8a-9ea3-921950cab98b)

The app uses an intermediary public fork to merge the private mirror into, and then enables the normal OSS contributor workflow into the upstream repository. This allows users to keep the private repo private while still allowing us to contribute to the upstream repository. Check out this [application flow diagram](./docs/architecture.md) for a more detailed look at how the app works.

## Hosting

You'll need to self-host the app. See the section on [Developing](#developing) for more information.

This app was created with the idea of self-hosting in mind and can be deployed to any hosting provider that supports Next.js/Docker.

Configuration is contained in a `.env` file which you'll need to customize for your environment. Use the `.env.example` in the root of this repository as a starting point. In particular, you'll need to set the following:

- `PUBLIC_ORG` and `PRIVATE_ORG` environment variables if you want to keep your private mirrors in a different GitHub organization from the public forks
- `ALLOWED_HANDLES` variable to a comma-separated list of GitHub user handles which ought to be allowed to access the app to create mirrors. If unset, all users who are members of the organization will be allowed to use the app.

```sh
docker build -t private-mirrors .
docker run --env-file=.env -p 3000:3000 private-mirrors

# alternatively, you can use docker compose
docker compose up
```

We recommend using Node 20.x or higher, though any Node LTS version >18 should work.

Once it's running, you'll need to create a GitHub App and configure it to point to your deployment. See the [Developing — GitHub App](#github-app) section for more information.

## Integrating the App into GHEC

The app can be integrated into GitHub Enterprise Cloud (GHEC) by following the same steps as GitHub.com. The app is designed to work with GHEC and GitHub Enterprise Managed Users (EMUs).

The only tradeoff is that a single app instance will only work between a single GitHub instance and a single GHEC instance. If you have multiple GitHub instances and GHEC instances, you will need to deploy multiple instances of the app.

To enable the app to work with GHEC, you will need to set the following environment variables in addition to installing the App on your GHEC organization instance.

```sh
PUBLIC_ORG=name-of-your-public-org    # Where your public forks will be created
PRIVATE_ORG=name-of-your-ghec-org     # Where your private mirrors will be created
```

The authentication of the UI will still need to be a user's github.com user, but the app will be able to create forks and mirrors in the GHEC instance.

## Usage

Once the app is installed, follow this document on [Using the Private Mirrors App](docs/using-the-app.md) to get the repository fork and mirrors set up for work.

## Developing

### Environment

Create a new `.env` file from the `.env.example` file

```sh
cp .env.example .env
```

### GitHub App

1. Create a new GitHub App [here](https://github.com/settings/apps/new)
2. There's an App manifest in the repo that lays out all the permissions and webhook events needed and can be found [here](./app.yml).
3. Copy all the secrets, credentials, and IDs into the `.env` file

### Webapp

This is a webapp built with Next.js. You can find the Next.js documentation [here](https://nextjs.org/docs).

#### Install dependencies

```sh
npm i
```

#### Start the application

```sh
npm run dev
```

You should be up and running on [http://localhost:3000](http://localhost:3000)!

#### Testing Webhooks

Webhooks are an important part of this application, they listen for events that happen to your organization and trigger the app to do things like create branch protections or sync code between forks.

We have our own webhook proxy that you can use to test webhooks locally. You will need to set `PUBLIC_ORG` (and `PRIVATE_ORG` if you want to test with a different organization) in your `.env` file to your GitHub organization name.

### GitHub Requirements

We recommend that you have a dedicated GitHub organization for your contributions. This will allow you to keep your contributions separate from your organization's daily operations.

> We have added support for GitHub Enterprise Managed Users (EMUs) and GitHub Enterprise Cloud (GHEC) in the app. If you are using GitHub Enterprise, you will need to make sure that the app is installed on your GitHub Enterprise instance.

Permissions:

- The GitHub App must be installed on the organization(s) you plan on contributing from
- Currently, any member of the organization can access the app and create additional private mirror repositories

## License

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](./LICENSE.md) for the full terms.

## Maintainers

Check out the [CODEOWNERS](./CODEOWNERS) file to see who to contact for code changes.

## Support

If you need support using this project or have questions about it, please [open an issue in this repository](https://github.com/github-community-projects/private-mirrors/issues/new) and we'd be happy to help. Requests made directly to GitHub staff or the support team will be redirected here to open an issue. GitHub SLA's and support/services contracts do not apply to this repository.

## More OSPO Tools

Looking for more resources for your open source program office (OSPO)? Check out the [`github-ospo`](https://github.com/github/github-ospo) repo for a variety of tools designed to support your needs.
