# Node.js Backend Testing with Mocha, Chai, and Sinon

Backend testing project for a Node.js + Express application using Mocha, Chai, and Sinon.

This repository demonstrates how to test a real backend codebase, not only isolated utility functions. The project focuses on controller and middleware testing for common backend scenarios such as authentication, authorization, database interaction, response validation, and error handling.

## Test Execution Result

The current test suite covers controllers and middleware for authentication, authorization, user status management, and feed CRUD operations.

```bash
PS nodejs/backend/testing/mocha/chai/sinon> npm test

> nodejs-tests@1.0.0 test
> mocha --timeout 5000

  Auth Controller
    ✔ should throw an error with code 500 if accessing the database fails
    ✔ should throw an error with code 401 if no user is found
    ✔ should throw an error with code 401 if password is wrong
    ✔ should return a token if login succeeds
    ✔ should send a response with a valid user status for an existing user
    ✔ should call next with an error if user is not found in getUserStatus
    ✔ should update the user status
    ✔ should call next with an error if user is not found in updateUserStatus
    ✔ should create a new user on signup
    ✔ should call next with an error if signup fails

  Auth middleware
    ✔ should throw an error if no authorization header is present
    ✔ should throw an error if authorization header is only one string
    ✔ should throw an error if the token cannot be verified
    ✔ should yeild a userId after decoding the token

  Feed Controller
    ✔ should add a created post to the posts of the creator
    ✔ should throw an error with code 422 if no image is provided
    ✔ should call next with an error if creating a post failed
    ✔ should send fetched posts with totalItems
    ✔ should send a single post
    ✔ should update an existing post
    ✔ should delete a post

  21 passing (20s)
```

## Project goal

The main goal of this project is to show practical backend testing skills in a realistic Node.js environment.

The tests are written to verify:

- controller behavior in successful and failure scenarios
- middleware behavior for authentication and request validation
- integration with MongoDB through Mongoose
- correctness of HTTP-like response objects
- correct propagation of backend errors through `next(err)`
- business logic around users, posts, authorization, and state updates

This is not a toy test setup. The project covers real backend concerns that are important in production applications.

## What is tested

The repository currently contains tests for:

- Auth Controller
- Feed Controller
- Auth Middleware

These tests cover both happy-path and failure-path scenarios.

### Auth Controller

The authentication controller tests verify the logic of:

- user login
- user signup
- getting current user status
- updating user status

The tests check cases such as:

- database failure during login
- login with non-existing user
- login with wrong password
- successful login with token creation
- successful retrieval of user status
- user not found when requesting status
- successful update of user status
- user not found during status update
- successful signup
- signup failure with correct error forwarding

Why these tests matter:

- Authentication is one of the highest-risk parts of backend systems
- It is important to verify both security-related logic and correct error behavior
- Login and signup flows must behave predictably under both valid and invalid conditions
- Status-related methods verify database reads and writes on user entities

### Feed Controller

The feed controller tests verify the logic of:

- creating posts
- fetching paginated posts
- fetching a single post
- updating posts
- deleting posts

The tests check cases such as:

- creating a post and attaching it to the creator
- rejecting post creation when no image is provided
- handling internal errors during post creation
- fetching post list with total item count
- fetching a single post by id
- updating an existing post
- deleting a post and removing it from the creator's posts array

Why these tests matter:

- Feed and content management features represent common CRUD backend logic
- These tests verify consistency between related models like `User` and `Post`
- They also validate response payloads, authorization-sensitive operations, and side effects such as file deletion

### Auth Middleware

The authentication middleware tests verify:

- request rejection when authorization header is missing
- rejection when authorization header format is invalid
- rejection when token verification fails
- successful extraction of `userId` from a decoded JWT

Why these tests matter:

- Middleware is often the first security boundary in an Express app
- If middleware fails, every protected route may become vulnerable or unstable
- These tests ensure that authentication checks are enforced before controller logic is executed

## Testing philosophy

The test suite is designed around realistic backend behavior.

It intentionally focuses on the following ideas:

### 1. Testing real application layers

The project tests real controllers and middleware instead of only isolated helper functions. This is important because production bugs often happen in the interaction between:

- request objects
- response objects
- database models
- authentication logic
- error handling flow

### 2. Covering both success and error scenarios

A backend test suite is incomplete if it only checks the happy path. This project explicitly tests:

- successful controller execution
- missing data cases
- unauthorized access
- not found cases
- invalid credentials
- internal database failures

This makes the tests much more valuable than basic output assertions.

### 3. Combining real database interaction with stubs

The project uses a mixed strategy:

- real MongoDB + Mongoose interactions for integration-like behavior
- Sinon stubs for isolating specific failure conditions

This approach keeps the tests realistic while still allowing targeted control over edge cases.

### 4. Verifying side effects, not just return values

Many backend methods do not return plain values. They often:

- mutate models
- call `next(err)`
- write JSON responses
- change database state
- update related documents

Because of that, the tests verify:

- response status codes
- JSON payloads
- database updates
- array modifications
- token generation
- middleware side effects
- error propagation through Express conventions

## Testing stack

### Mocha

Mocha is used as the test runner.

Why it is used:

- clean structure with `describe`, `it`, `before`, `beforeEach`, `after`
- good support for asynchronous testing with Promises and `done`
- widely adopted in Node.js backend ecosystems

In this project, Mocha is responsible for:

- organizing test suites
- running async tests
- handling test lifecycle hooks
- reporting passing and failing cases

### Chai

Chai is used as the assertion library.

Why it is used:

- expressive assertions
- readable test output
- strong fit for behavior-driven testing style

In this project, Chai is used to verify:

- error objects and status codes
- response payload fields
- token and user id presence
- array lengths
- database object properties
- middleware side effects

Typical assertions in this project check things like:

- whether an error exists
- whether a status code equals the expected value
- whether a response contains the correct message
- whether a document was actually created, updated, or removed

### Sinon

Sinon is used for stubs and controlled behavior replacement.

Why it is used:

- backend tests often need to simulate failures or override dependencies
- some edge cases are difficult or inefficient to reproduce with only real database operations
- stubs allow precise control over model methods and external libraries

In this project, Sinon is used to stub:

- `User.findOne`
- `User.findById`
- `Post.prototype.save`
- `bcrypt.compare`
- `bcrypt.hash`
- `jwt.sign`
- `JWT.verify`
- `fs.unlink`

This makes it possible to test:

- forced database failures
- login failures without depending on actual password hashes
- token creation without generating a real JWT every time
- file deletion logic without touching the real filesystem

### Mongoose

Mongoose is used in the application and also directly in tests for real database interaction.

Why it is part of the test story:

- the controllers work with MongoDB models
- realistic controller tests should confirm that documents are created, updated, and removed correctly
- tests verify relations between `User` and `Post`

In this project, Mongoose is used to:

- connect to the test database
- seed initial user data
- reset collections between tests
- verify final database state after controller execution

### dotenv

`dotenv` is used to load test database credentials and configuration from `.env`.

Why it matters:

- sensitive credentials should not be hardcoded
- tests can run against a dedicated test database
- environment-based configuration is standard backend practice

## Why the test design looks this way

### Real database setup in controller tests

The controller suites connect to MongoDB before running tests.

This was done because the logic under test is not purely functional. The controllers work with:

- persistent models
- cross-document relationships
- stateful updates

Examples:

- `createPost` must not only create a `Post`, but also push it into the creator's `posts` array
- `deletePost` must remove the post and also update the related user document
- `updateUserStatus` must persist the new value to MongoDB

These are better validated against a real database than with excessive mocking.

### Stubs for targeted failure testing

Some tests intentionally stub model methods or library methods.

This was done to simulate edge conditions such as:

- database access failure
- invalid credentials
- missing user lookups
- failing save operations
- token verification failure

This gives precise control over scenarios that are important to test but inconvenient to reproduce with only full integration setup.

### Custom `req`, `res`, and `next`

The tests manually construct lightweight request and response objects.

This was done because Express controllers and middleware mostly depend on:

- `req.body`
- `req.params`
- `req.query`
- `req.userId`
- `res.status()`
- `res.json()`
- `next(err)`

By mocking only the required fields, the tests stay:

- small
- readable
- focused on backend logic
- independent from a running HTTP server

## Project structure

```text
test/
├── auth-controller.js
├── feed-controller.js
└── auth-middleware.js

controllers/
├── auth.js
└── feed.js

models/
├── user.js
└── post.js

middleware/
└── is-auth.js
```

## Covered backend concerns

This repository demonstrates testing knowledge in the following backend areas:

- authentication flow testing
- authorization middleware testing
- controller unit and integration-style testing
- async behavior testing in Node.js
- database state verification
- CRUD operation testing
- response object verification
- Express error flow testing with `next(err)`
- dependency isolation with stubs
- side effect verification such as file deletion and relation updates

## Example scenarios covered

### Authentication scenarios
- login should fail if database access fails
- login should fail if the user does not exist
- login should fail if the password is incorrect
- login should succeed and return a token when credentials are valid

### User status scenarios
- user status should be returned for an existing user
- user status update should persist in the database
- not found errors should be forwarded correctly

### Feed scenarios
- post creation should add a post to the creator
- post creation should fail when no image is provided
- post list should return posts and totalItems
- single post fetch should return the correct post
- post update should persist the new values
- post deletion should remove both the post and its reference from the user

### Middleware scenarios
- missing authorization header should throw
- malformed authorization header should throw
- invalid token should throw
- valid token should attach userId to the request

## How to run the tests

### 1. Install dependencies
```bash
npm install
```

### Current test command:

```json
"test": "mocha --timeout 5000"
```

### Packages used for testing

The core testing-related packages in this project are:

```json
"chai": "^4.3.7",
"mocha": "^11.7.5",
"sinon": "^21.0.2"
```

### Additional packages that support test execution in this backend context:

```json
"dotenv": "^17.3.1",
"mongoose": "^5.3.2",
"bcryptjs": "^2.4.3",
"jsonwebtoken": "^8.3.0"
```

### Package roles summary

- **mocha** - test runner and test lifecycle management
- **chai** - assertions and result validation
- **sinon** - stubs and behavior replacement for isolated scenarios
- **mongoose** - real database interaction during controller tests
- **dotenv** - environment-based configuration for test database
- **bcryptjs** - password comparison and hashing in authentication tests
- **jsonwebtoken** - token creation and verification in auth logic tests

## Why this project is useful from an engineering perspective

This repository shows more than basic syntax knowledge. It demonstrates that I understand how to test backend systems at the level where real application logic lives.

**Key points demonstrated by the test suite:**

- understanding of Express controller architecture
- understanding of middleware behavior and request flow
- ability to test asynchronous Node.js code reliably
- ability to distinguish between real integration checks and isolated stub-based checks
- ability to validate business logic and database consistency
- ability to test failure conditions intentionally, not only success cases
- awareness of security-sensitive backend surfaces such as auth and authorization

## Potential future extensions

The test suite can be extended further with:

- validation error tests for signup and createPost
- additional authorization tests for update and delete operations
- route-level integration tests with Supertest
- separate test database bootstrap and teardown utilities
- CI integration for automated test execution on push and pull request

## Summary

This project is a practical backend testing showcase built around a real Node.js application structure.

It demonstrates:

- controller testing
- middleware testing
- async logic verification
- authentication testing
- database-integrated test cases
- targeted failure simulation with stubs

The overall goal of the repository is to show a structured and engineering-oriented approach to backend testing using Mocha, Chai, and Sinon in a realistic Express + MongoDB environment.
