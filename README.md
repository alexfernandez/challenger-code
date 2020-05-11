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

### Acknowledgements

The code and challenges are open for participation.
Pull requests are very welcome!

(C) 2020 Alex Fernández.
Licensed under the GPL v3.
See LICENSE file for details.

