# Challenger Code

Challenge yourself with coding exercises.

## API

The following API calls are published.

### `GET /api/challenges`

Returns a list of challenges with `id` and `name`.
No parameters.

### `GET /api/challenge/:id`

Returns the challenge with the given `id`.
No parameters.

### `POST /api/challenge/:id/run`

Runs the given challenge `id` with some code.
Body parameters:

* `code`: the code to run.

## Pending Stuff

This is a list of things I'm working on.
Please let me know if you want to tackle any
so we don't duplicate efforts.
Thanks!

* Challenge editor:
accepts submissions from anyone,
as `challengeco.de/username/challenges`.
* Admin role:
select challenges for the main collection.
* Challenger list:
select by category, difficulty.
* User page:
show challenges run and achievements by any player.
* Browser runner:
run challenges directly in the browser.
* Redirect [http site](http://challengerco.de/) to https.

## Acknowledgements

The code and challenges are open for participation.
Pull requests are very welcome!

(C) 2020 Alex Fernández.
Licensed under the GPL v3.
See LICENSE file for details.

