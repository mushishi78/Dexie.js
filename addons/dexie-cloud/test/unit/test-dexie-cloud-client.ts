
import {module, test, asyncTest, start, stop, strictEqual, ok, equal} from 'qunit';
import {promisedTest} from "../promisedTest";
import Dexie from "dexie";
import dexieCloud from '../../src/dexie-cloud-client';

module("dexie-cloud-client");
Dexie.addons = []; // Prohibit dexie-observable and dexie-syncable from registering themselves.

const db = new Dexie("argur", {addons: [dexieCloud]});
db.version(1).stores({
  friends: "@id, name"
});

/*db.open().then(async ()=>{
  const id = await db.table("friends").bulkPut([{name: "Foo", age: 33}]);
  console.log(await db.table("friends").toArray());
}).catch(console.error);*/


promisedTest("basic-test", async ()=>{
  await new Dexie("argur", {addons: []}).delete();
  await db.cloud.configure({
    databaseUrl: "http://localhost:3000/z8qgl998z",
    requireAuth: true
  }).then(x => {
    console.log("db.cloud configure succeeded");
  }).catch(error => {
    console.log("db.cloud.configure failed");
  });
  console.log("Waiting for open to resolve");
  await db.open();
  console.log("open resolved. Adding a friend:");
  const id = await db.table("friends").add({name: "Foo"});
  ok(true, `id was ${id}`);
  let obj = await db.table("friends").get(id);
  equal(obj.name, "Foo", "We have the right name");
  await db.table("friends").put({id, name: "Bar"});
  obj = await db.table("friends").get(id);
  equal(obj.name, "Bar", "We have the new name");
  const numFriends = await db.table("friends").count();
  ok(true, `Num friends: ${numFriends}`);

});