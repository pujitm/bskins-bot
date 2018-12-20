# Bitskins Bot

## Getting Started
After `npm install` ...

At the root of the directory: `touch .env`
This file is ignored in `.gitignore`

Run `npm run start` and see terminal output

## Program Entry
Entry is in `src/index.ts`, which can also be found in `package.json`, specifically under the `start` script.

## Tests
Tests are located under `src/test`, and test files follow `*.test.ts`

To run tests, run `npm run test`

## Configuration Files

+ `package.json` &rarr; node config
+ `tsconfig.json` &rarr; typscript config
+ `.env` &rarr; Environment variables containing Node variables, API keys, secrets, and other configurations (gitignore-ed)
