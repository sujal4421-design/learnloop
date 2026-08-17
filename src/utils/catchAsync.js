// src/utils/catchAsync.js
//
// Express 4 does NOT automatically catch errors thrown inside async
// functions. If an `await` inside a controller throws (e.g. the database
// connection drops), the promise rejects silently — the request just hangs,
// or in worse cases crashes the process with an unhandled rejection.
//
// This wrapper catches that rejection and forwards it to Express's error
// handling via next(err), so our global error middleware (see server.js)
// can respond properly instead of the request failing silently.
//
// Usage: router.get('/', catchAsync(SomeController.index));

function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
