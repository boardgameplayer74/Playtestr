## TL;DR
**Who is it:** It's the brain-child of Patrick Crowe, an AWS engineer and Data Science kind of guy.

**What is it:** Playtestr is a [Next.js](https://nextjs.org/) + [Typescript](https://www.typescriptlang.org/) project running in a [Docker Container](https://www.docker.com/resources/what-container) on [AWS Fargate](https://aws.amazon.com/fargate).
It was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), integrated with [Amplify](https://aws.amazon.com/amplify/), and coded primarily in [Cloud9](https://aws.amazon.com/cloud9/).

**Why is it:** Its purpose is to create a web based platform for playtesting boardgames on a scale not available before. Forget *hundreds* of playtests and think *thousands*, with deep analytics about card weights, winning and losing tactics, etc - all provided with compelling graphics and an easy-to-use UI.

## Getting Started
If You're here, it probably means you plan on building a copy of this thing locally so you can help with the coding. Thank You!

After you've cloned it from git, you'll want to run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Then make changes in the relevant code modules listed below.  When changes are tested and complete you'll want to make sure it builds:

```bash
next build
# or
yarn build
```

Then you should be ready to commit and push it back to git. If we approve the change, we'll push it to AWS by running

```bash
amplify publish
```

## The Code

The `pages/index.js` contains the basic skeleton of the interface, laid out with [`react-tabs`](https://github.com/reactjs/react-tabs) to flip between the different modules.

### The Turn Module
This is responsible for controlling the flow of the game and determining which player (agent) acts next. Its settings are chosen from within the **Turn Module Interface (TMI)**, but many parameters come from other modules. The **TMI** uses five kinds of structures to coordinate the flow of the game: **stages**, **phases**, **rounds**, **turns**, and **steps**.  You can discover more about these in the relevant code files. All the components for the **TMI** can be found in the `/components/TurnModule` directory.

### The Action Module
The job of the action module is to determine what actions are available to agents at any point in the game. Available actions are dictated by the game phase: if a phase doesn't include a certain action in it, then it may not be performed. This collection of actions forms the basis for what the agent can do, but may be further restricted by the current state of the game components. The Action Module also determines how agents are allotted actions on their turns using parameters set in the **Action Module Interface (AMI)**. You can discover more about the **AMI** components in files located in the `/components/ActionModule` directory.

### Other Modules
TODO

### REST API
The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). There will probably be a bunch of routes here eventually, but for now there is only `pages/api/hello.js`. Nextjs uses this instead of React pages.
