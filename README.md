# Challenger Code

Challenge yourself with coding exercises.
Official website: [challengerco.de](https://challengerco.de/).

## Installation

If you want to install locally:

    $ npm i challenger-code

Start with

    $ npm start

You will need a running instance of MongoDB listening to 127.0.0.1,
no security.
It will use database `cc`.

### Configuration

You will need to have a file in the root directory
called `.challenger-code.json`, containing:

```
{
	"jwtSecret": "...",
    "githubId": "...",
    "githubSecret": "..."
}
```

The first value `jwtSecret` is used to encrypt JWT tokens,
so make sure that it is kept secret.
The next values `githubId` and `githubSecret` are used to authenticate using GitHub.
Please refer to
[GitHub: Authorizing OAuth Apps](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/)
for details.

## API

The following API calls are published.

### `GET /api/challenge/:owner/list`

Returns a list of challenges with `id` and `name` from `owner`.

### `GET /api/challenge/:owner/:id`

Returns the challenge with the given `owner` and `id`.

### `POST /api/challenge/:owner/:id/run`

Runs the given challenge `id` from `owner` with some code.
Body parameters:

* `code`: the code to run.

## Pending Stuff

This is a list of things I'm working on.
Please let me know if you want to tackle any
so we don't duplicate efforts.
Thanks!

* Challenge editor:
accepts submissions from anyone,
saved as `challengeco.de/owner/challenges`.
* Admin role:
select challenges for the main collection.
* Challenger list:
select by category, difficulty.
* User page:
show challenges run and achievements by any player.
* ✅View challenge stats:
show min and average for: nodes, execution time, memory?
* Check max memory used by a challenge run.
* Browser runner:
run challenges directly in the browser.
* ✅Redirect [http site](http://challengerco.de/) to https.

## Architecture

The project uses [fastify](https://github.com/fastify/fastify).
It loosely follows the structure of
[fastify-example-twitter](https://github.com/fastify/fastify-example-twitter).

## Acknowledgements

The code and challenges are open for participation.
Pull requests are very welcome!

(C) 2020 Alex Fernández.
Licensed under the GPL v3.
See LICENSE file for details.

