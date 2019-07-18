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

Finally, run `npm run start` (or `docker-compose up --build`) and see terminal output.

## Prerequisites

+ [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) (Ubuntu Installation is linked. Run `install-mongodb.sh` in `sudo bash`)

+ Docker (Optional -- See Docker-Windows.md for further instruction). Change `USING_DOCKER` in `.env` to `1`.


## Program Entry

Entry is in `src/index.ts`, which can also be found in `package.json`, specifically under the `start` script.

Or, you can run `docker-compose up --build`

## Tests

Tests are located under `src/test`, and test files follow `*.test.ts`

To run tests, run `npm run test`

## Configuration Files

+ `package.json` &rarr; node config
+ `tsconfig.json` &rarr; typscript config
+ `.env` &rarr; Environment variables containing Node variables, API keys, secrets, and other configurations (gitignore-ed)

## Algorithm

1. Skin is listed on bitskins. The listed event is fired and a signal is sent to us.

[Purchase Logic in `onListed.ts`]

2. Our program (the script) makes a decision if this event shows a good purchase and buys it. The decision will be based off of several factors, detailed below.

3. We either send or don’t send the API command to buy the item listed in the event fired in step 1. 

4. We get a confirmation on if the item was sold to us, or has been sold to someone else. 

[End Purchase Logic]

5. If the item was not sold to us, log it, and then return to step 1.

6. If the item was sold to us, proceed to step 5

7. List the item we just bought at a markup. The marked-up price will be based off of several factors, detailed below.

8. Wait until the item sells.

[Cron Job]

9. If the item does not sell within a certain time (this time will be detailed), then lower the price by x%. This is detailed below

[End Cron Job]

10. Use new funds to buy skins: Rinse and repeat

