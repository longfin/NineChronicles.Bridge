import test from "node:test";
import { HeadlessGraphQLClient } from "./headless-graphql-client";
import { Address, RawPrivateKey } from "@planetarium/account";
import { Sqlite3MonitorStateStore } from "./sqlite3-monitor-state-store";
import { Minter } from "./minter";
import { GarageObserver } from "./observers/garage-observer";
import { AssetBurntObserver } from "./observers/asset-burnt-observer";
import { AssetTransfer } from "./asset-transfer";
import { AssetTransferredObserver } from "./observers/asset-transferred-observer";


const odinClient = new HeadlessGraphQLClient("https://9c-internal-rpc-1.nine-chronicles.com/graphql", 1);
const heimdallClient = new HeadlessGraphQLClient("https://heimdall-internal-rpc-1.nine-chronicles.com/graphql", 1);

test(".getGarageUnloadEvents()", async () => {
    var x = await odinClient.getGarageUnloadEvents(
        8261390,
        Address.fromHex("0x9b9566db35d5eff2f0b0758c5ac4c354debaf118", true),
        Address.fromHex("0xeFE0bB583257C5C3c5650Bef70d135d4aD0E9b73", true),
    );
    const monitorStateStore = await Sqlite3MonitorStateStore.open("test");
    const account = RawPrivateKey.fromHex("");
    const minter = new Minter(
        account,
        heimdallClient
    );
    const observer = new GarageObserver(monitorStateStore, minter);
    await observer.notify({blockHash: "", events: x.map(ev => {return {...ev, blockHash: ""}})});

    return;
});

test("getAssetsBurnEvents()", async () => {
    var evs = await heimdallClient.getAssetBurntEvents(3662);
    const account = RawPrivateKey.fromHex("");
    const transfer = new AssetTransfer(
        account,
        odinClient
    );
    const observer = new AssetBurntObserver(transfer);
    await observer.notify({blockHash: "", events: evs.map(ev => {return {...ev, blockHash: ""}})});
 
    return;
});

test("getAssetTransferredEvents()", async() => {
    var evs = await odinClient.getAssetTransferredEvents(8277202, Address.fromHex("0x9b9566db35d5eff2f0b0758c5ac4c354debaf118", true));
    
    const account = RawPrivateKey.fromHex("");
    const minter = new Minter(
        account,
        heimdallClient,
    );
    const stateStore = await Sqlite3MonitorStateStore.open("test");
    const observer = new AssetTransferredObserver(stateStore, minter);
    await observer.notify({blockHash: "", events: evs.map(ev => {return {...ev, blockHash: ""}})});
 
    return;
});