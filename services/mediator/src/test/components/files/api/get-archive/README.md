# Note

Keep these files:

- queue.js is a dependency of app.js
- after mocking queue.js for the first time, the module gets cached
- app.js will always use the cached version, the cached mock cannot be overwritten
- file system mocking with memfs also works per test file
