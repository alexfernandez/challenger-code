# Challenger Code

Challenge yourself with coding exercises.

## API

The following API calls are published.

### `GET /api/challenges/:owner`

Returns a list of challenges with `id` and `name` from `owner`.
Currently only valid for `owner=main`.
No body parameters.

### `GET /api/challenge/:owner/:id`

Returns the challenge with the given `owner` and `id`.
Currently only valid for `owner=main`.
No body parameters.

### `POST /api/challenge/:id/run`

Runs the given challenge `id` from `owner` with some code.
Currently only valid for `owner=main`.
Body parameters:

* `code`: the code to run.

## Pending Stuff

This is a list of things I'm working on.
Please let me know if you want to tackle any
so we don't duplicate efforts.
Thanks!

* Challenge editor:
accepts submissions from anyone,
saved as `challengeco.de/username/challenges`.
* Admin role:
select challenges for the main collection.
* Challenger list:
select by category, difficulty.
* User page:
show challenges run and achievements by any player.
* View challenge stats:
show min and average for: nodes, execution time, memory?
* Check max memory used by a challenge run.
* Browser runner:
run challenges directly in the browser.
* Redirect [http site](http://challengerco.de/) to https.

## Acknowledgements

The code and challenges are open for participation.
Pull requests are very welcome!

(C) 2020 Alex Fernández.
Licensed under the GPL v3.
See LICENSE file for details.

