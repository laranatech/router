# 2.2.0

- feat: generic router — now you can set handler result type
- breaking: `res.write(result)` -> `return result`

# 2.1.0

- fix: `/list` and `/:param` are not separate routes, `list` will be resolved first,
if states sooner
- feat: handler type changed, now it accepts `Res` instead of `Req`, which allows
access to `params`, `route` and so on
- fix: `GET` method is now default

# 2.0.1

- fix: one endpoint with different methods

# 2.0.0

- simplified router

# 1.0.2

- fix: reload
- feat: currentRoute

# 1.0.1

- fix: push payload

# 1.0.0

initial version
