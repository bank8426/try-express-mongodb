<h3 align="center">Subscription Tracker API</h3>

## ⚠️ Note

This project was implemented based on a tutorial video on YouTube from JS Mastery [Complete Backend Course | Build and Deploy Your First Production-Ready API](https://www.youtube.com/watch?v=rOpEN1JDaD0).

## Table of Contents

1. [Introduction](#introduction)
2. [Demo](#demo)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Quick Start](#quick-start)
6. [What I learned](#learn)
7. [Implementation Notes](#note)
8. [Missing Features](#miss)

## <a name="introduction">Introduction</a>

Backend API for a subscription management service that sends email reminders to users every notice period before a subscription expires.
This backend also implements user registration, authentication with JWT, rate limiting, and bot protection.

The reason I wanted to follow this tutorial is that I want to try to learn more about Express.js and MongoDB.

## <a name="demo">Demo</a>

### Auth

#### Sign up

<a href="">
  <img src="public/readme/sign-up.png" alt="Sign up" />
</a>

#### Sign in

<a href="">
  <img src="public/readme/sign-in.png" alt="Sign in" />
</a>

### Users

#### Get users

<a href="">
  <img src="public/readme/get-users.png" alt="Get users" />
</a>

#### Get user by id

<a href="">
  <img src="public/readme/get-user-by-id.png" alt="Get user by id" />
</a>

### Subscriptions

#### Create subscription

<a href="">
  <img src="public/readme/create-subscription.png" alt="Create subscription" />
</a>

#### Get subscriptions by user id

<a href="">
  <img src="public/readme/get-subscription-by-user-id.png" alt="Get subscription by user id" />
</a>

## <a name="tech-stack">Tech Stack</a>

- Express - as a backend framework

- MongoDB Atlas - as a cloud MongoDB database service(Free tier)

- Mongoose - as an Object Data Modeling (ODM) library for `MongoDB`. `ODM` is like `ORM`(Object Relational Mapping) but for `NoSQL database`, which is used to map the `Model`'s data structure in the database into an Object class in the application as in Object Oriented Programming (OOP) style. Allow you to call methods from that `Model` class to create, update, delete, and find data in the database without writing a raw query.

- Arcjet - as a middleware for rate limiting, protect from bots and also protect from attacks

<!-- TODO -->

- Upstash (workflow) - as a scheduling queue service, first you call trigger workflow with data(context) and callback url. Then it will call your backend based on callback url.Then your backend need to handle the workflow based on the data(context) that you sent.

1. Server side(create subscription api)
1. Create new subscription in database and return `subscriptionId`
1. Call `workflowClient.trigger` with `callback url`(`${SERVER_URL}/subscription/reminder` endpoint) and `subscriptionId` as body to Workflow.
1. Workflow side
1. Create `new workflow run` and call `callback url`(`${SERVER_URL}/subscription/reminder` endpoint) with `context` which has `workflowRunId`, `subscriptionId`(in `requestPayload`) and a lot of other information.
1. Server side(subscription/reminder endpoint) (need to use `serve` function from `@upstash/workflow/express` to handle request)
1. Extract `subscriptionId` from `context.requestPayload`
1. call `fetchSubscription` function which will call `context.run` to get `subscription` data by `subscriptionId` from database
1. Check if `subscription` is `active` and `renewalDate` is not passed
1. If `subscription` is `active` and `renewalDate` is not passed, it will call `sendReminderEmail` function to send email to user

in `subscription/reminder` endpoint

<!-- TODO -->

- NPM Libraries

  - bcryptjs - as a password hashing tool,

    - When a user sign up, hash a password before saving it into the database
    - When a user sign in, verify the user's input password with the hashed password from the database

  - jsonwebtoken - as a JSON Web Token (JWT) tool to

    - When a user sign in, create a JWT token
    - When a user accesses protected routes, verify the JWT token in the `request header`

  - nodemailer - as an email sending tool for sending email reminders (Use personal `gmail` as a sender)

  - validator - as a string validation tool for email (Actually, it provides various validation methods for string input, not just the email)

  - dayjs - as a date and time library for date comparison and formatting dates and times

  - cookie-parser - as a middleware for a cookie parsing tool. But actually, it's not really used in this project since we use a JWT token in the `Authorization` header. `cookie-parser` was added following a tutorial video. But there are use cases for it when implementing frontend and use `HTTP only cookie` to store JWT token to prevent `XSS attack` and also set `SameSite` to `Strict` to prevent `CSRF attack`.

  - nodemon - to restart the server automatically when a file is changed

## <a name="features">Features</a>

Advanced Rate Limiting and Bot Protection: with Arcjet that helps you secure the whole app.

👉 Database Modeling: Models and relationships using MongoDB & Mongoose.

👉 JWT Authentication: User CRUD operations and subscription management.

👉 Global Error Handling: Input validation and middleware integration.

👉 Logging Mechanisms: For better debugging and monitoring.

👉 Email Reminders: Automating smart email reminders with workflows using Upstash.

and many more, including code architecture and reusability

## <a name="quick-start">Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

- Git
- Node.js
- npm
- ngrok (for handling api callback from workflow to local development server)

**Cloning the Repository**

```bash
git clone https://github.com/bank8426/try-express-mongodb.git
cd try-express-mongodb
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

1. Create a new file named `.env.development.local` and copy content inside `.env.example`
2. Replace the placeholder values with your actual credentials

```env
# your base url
VITE_BASE_URL=http://localhost:5173

#https://www.syncfusion.com/
VITE_SYNCFUSION_LICENSE_KEY=

# https://cloud.appwrite.io/
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_API_KEY=
VITE_APPWRITE_DATABASE_ID=
# create users collection in database
VITE_APPWRITE_USERS_COLLECTION_ID=
# create trips collection in database
VITE_APPWRITE_TRIPS_COLLECTION_ID=
# it chage based on server region
VITE_APPWRITE_API_ENDPOINT=

# https://sentry.io/ for using with react-router
SENTRY_AUTH_TOKEN=

# https://aistudio.google.com/
GEMINI_API_KEY=

# https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=

# https://dashboard.stripe.com/test/dashboard
STRIPE_SECRET_KEY=
```

**Running the Project**

You will need 2 terminals to run the project if you want to run qstash on local mode.

- First terminal to run qstash

```bash
npx @upstash/qstash-cli dev
```

<!-- https://upstash.com/docs/qstash/howto/local-tunnel -->

- Second terminal to run server

```bash
npm run dev
```

Your server will run on [http://localhost:5500](http://localhost:5500/)

## <a name="learn">What I learned</a>

- `Express.js`

  - `app.use()` is used to mount a middleware function which can use for something like parsing request body, parsing cookie in request header, call 3rd party middleware and also include `Router` when create nested routes
  - `app.get()/post()/put()/delete()` is used to handle HTTP request but it can add middleware function and chain it as well by adding it as parameter before last callback function.
    - Ex.
      ```js
      userRouter.get("/", authorize, getUsers);
      ```

- `Mongoose`

  - when handle create new data into database, you can use `pre` middleware with `save` as a first parameter(method name from Model class of Mongoose) to handle some logic before creating new data. But this can do after you created schema
    - Ex.
    ```js
      const yourSchema = new mongoose.Schema({ ... })
      yourSchema.pre("save", function (next) {
        ...
        next();
      })
      const YourModel = mongoose.model("YourModel", yourSchema)
    ```

- `arcjet` - there're many rate limiting algorithm that can be use. Token bucket
  is new to me. It use the idea that each request will consume a token(We can set the number of tokens that each request will consume) and if the token is not available, it will be blocked.

- `bcryptjs` can be used for creating salt that will mix with password before hash it to create hashed password that will be saved into database, and also use it to verify hashed password

- `jsonwebtoken` can be used for creating and verifying JSON Web Tokens (JWT) similor to `jose` library. But this is easier to use.

- `dayjs` is a date and time library that can be used for date comparison and format date and time. Ex. isBefore(), isAfter(), isSame() etc. But need to create dayjs instance first.

- `nodemailer` can be used for sending email by using your own gmail account for free. But also need to enable `2 step verification` in your gmail account and generate `app password` for it.

<!-- TODO -->

TODO
ngrok
register account
follow step in https://dashboard.ngrok.com/get-started/setup
run `ngrok http http://localhost:5500` if you use same port as example
get your `forwarding url` and update it in endpoint url .env file before run `npm run dev`

## <a name="note">Implementation Notes</a>

- MongoDB Atlas - everytime your IP address changed, you need to add it to the whitelist in the cloud mongodb. By go to https://cloud.mongodb.com/ and click on `Network Access` in `Security` section -> `Add IP Address` -> `Add Current IP Address`. Actually you can allow all IP address by click on `Add IP Address` -> `Allow Access from Anywhere`

- Workflow

workflow callback
call everytime after workflow method is called

from https://upstash.com/docs/workflow/troubleshooting/general#authorization-error-handling

also because of using sleepUntil which try to resume workflow from where it left off.

The recommended pattern to check the condition is to check it inside the Workflow method and return the result instead of checking the condition on the server side, then calling the Workflow method, which will make it confusing and throw an error like (`Incompatible step name. Expected <STEP_NAME>, got <STEP_NAME> since it is considered as `Updating).https://upstash.com/docs/workflow/howto/changes

- Workflow method

  - `stepName` in this project, we called it `label` since we also use it to check `email template label` when sending email - But since the purpose of `stepName` iso track current step of `workflow` and it must be `unique`. Then the problem happened

    - If you use the same label for different workflow methods( `run` and `sleepUntil` in this case), it will throw error.

    - If you use the same label with same workflow method, it will has some weird behavior. (from what i try)

  - `stepName` miss

## <a name="miss">Missing Features</a>

Auth

- Sign out ( By default, it's done on frontend by just removing token from cookie. To do on backend might need to create new collection for blacklisted tokens)

Subscription

- Get all subscriptions
- Get subscription details by subscription id
- Update subscription
- Cancel subscription
- Delete subscription (May be soft delete)
- Get upcoming renewal

User

- Create user (No need since when user sign up, it will create user in database, maybe for invitation user case)
- Update user
- Delete user (May be soft delete)
