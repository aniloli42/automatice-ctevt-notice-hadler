# CTEVT Notice To Facebook Post Automation

Project developed to post the CTEVT notices from websites automatically to [TECH ABOUT NEED Facebook Page](https://facebook.com/techaboutneed).

<!-- TOC -->

- [CTEVT Notice To Facebook Post Automation](#ctevt-notice-to-facebook-post-automation)
  - [Motivation](#motivation)
  - [Tech Used](#tech-used)
  - [Installation](#installation)
    - [Commands](#commands)
  - [API reference](#api-reference)
  - [Contribute](#contribute)

<!-- /TOC -->

## Motivation

During my diploma in computer engineering, I had to look into the CTEVT website to see if any notice releases such as results published, exam routines, etc. But, I don't like to visit the website every time just to see any notice published or not.

## Tech Used

- Node Js
- Express Js
- Typescript
- Mongoose ORM
- Mongo DB
- Redis
- Puppeteer
- Facebook API
- Esbuild
- Docker

## Installation

`.example.env` provides the secret need to be configured to run server successfully.

[Example Env File Here](./.example.env)

### Commands

- `pnpm start` to run server in production environment. Make sure `pnpm build` command run first.
- `pnpm dev` to run server in development environment.

## API reference

- `/v1/api/notices`: Get Notices. [Default 10 new notices returned]
- `/v1/api/notices?page={page_no}&limit={no_of_notices}`: Able to paginate the query by providing `page` and `limit`
- `/v1/api/notices/{notice_id}`: Get specific notice only by using `notice_id`

## Contribute

- [Create Issue](https://github.com/aniloli42/ctevt-notice-to-facebook-post-automation/issues/new) or contribute in [opened issues](https://github.com/aniloli42/ctevt-notice-to-facebook-post-automation/issues)
- Provide brief explain.
- Wait for discussion
