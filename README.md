# Bitskins Bot

## Getting Started

See `Prerequisites`.

After `npm install` ...

At the root of the directory: `touch .env`
This file is ignored in `.gitignore`

OR Get it from our shared cloud storage.

------------------------------------------------------------------

In a separate terminal, run `start-mongod.sh`. 

Then, run `npm run test` to make sure everything is configured correctly.

Finally, run `npm run start` and see terminal output.

## Prerequisites

+ [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) (Ubuntu Installation is linked. Run `install-mongodb.sh` in `sudo bash`)


## Program Entry

Entry is in `src/index.ts`, which can also be found in `package.json`, specifically under the `start` script.

## Tests

Tests are located under `src/test`, and test files follow `*.test.ts`

To run tests, run `npm run test`

## Configuration Files

+ `package.json` &rarr; node config
+ `tsconfig.json` &rarr; typscript config
+ `.env` &rarr; Environment variables containing Node variables, API keys, secrets, and other configurations (gitignore-ed)
