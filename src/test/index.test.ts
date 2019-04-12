require('dotenv').config()

// import { hello } from '../hello-test';
import { expect } from 'chai';
import * as BitSkins from "bitskins"
import 'mocha';

describe('Hello function', () => {

  it('test is alive', () => {
      const result = 'Hello World!';
    expect(result).to.equal('Hello World!');
  });

});

describe('Bitskins REST API', () => {
  it('is alive', async () => {
    const api = new BitSkins.API(process.env.API_KEY, process.env.API_SECRET)
    const balance = await api.getAccountBalance()
    expect(balance).to.not.be.null
    // console.log(balance)
  })
})