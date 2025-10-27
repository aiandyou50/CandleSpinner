import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type JettonTransfer = {
    $$type: 'JettonTransfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardTonAmount: bigint;
    forwardPayload: Cell | null;
}

export function storeJettonTransfer(src: JettonTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3187890513, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardTonAmount);
        if (src.forwardPayload !== null && src.forwardPayload !== undefined) { b_0.storeBit(true).storeRef(src.forwardPayload); } else { b_0.storeBit(false); }
    };
}

export function loadJettonTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3187890513) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _responseDestination = sc_0.loadAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCellOpt();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCellOpt();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransfer(source: JettonTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeCell(source.forwardPayload);
    return builder.build();
}

export function dictValueParserJettonTransfer(): DictionaryValue<JettonTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransfer(src.loadRef().beginParse());
        }
    }
}

export type JettonTransferNotification = {
    $$type: 'JettonTransferNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    forwardPayload: Slice;
}

export function storeJettonTransferNotification(src: JettonTransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3874941220, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeRef(src.forwardPayload.asCell());
    };
}

export function loadJettonTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3874941220) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forwardPayload = sc_0.loadRef().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransferNotification(source: JettonTransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransferNotification(): DictionaryValue<JettonTransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type UpdateGameWallet = {
    $$type: 'UpdateGameWallet';
    newWallet: Address;
}

export function storeUpdateGameWallet(src: UpdateGameWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1275670469, 32);
        b_0.storeAddress(src.newWallet);
    };
}

export function loadUpdateGameWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1275670469) { throw Error('Invalid prefix'); }
    const _newWallet = sc_0.loadAddress();
    return { $$type: 'UpdateGameWallet' as const, newWallet: _newWallet };
}

export function loadTupleUpdateGameWallet(source: TupleReader) {
    const _newWallet = source.readAddress();
    return { $$type: 'UpdateGameWallet' as const, newWallet: _newWallet };
}

export function loadGetterTupleUpdateGameWallet(source: TupleReader) {
    const _newWallet = source.readAddress();
    return { $$type: 'UpdateGameWallet' as const, newWallet: _newWallet };
}

export function storeTupleUpdateGameWallet(source: UpdateGameWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newWallet);
    return builder.build();
}

export function dictValueParserUpdateGameWallet(): DictionaryValue<UpdateGameWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateGameWallet(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateGameWallet(src.loadRef().beginParse());
        }
    }
}

export type UpdateContractWallet = {
    $$type: 'UpdateContractWallet';
    newWallet: Address;
}

export function storeUpdateContractWallet(src: UpdateContractWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(982889259, 32);
        b_0.storeAddress(src.newWallet);
    };
}

export function loadUpdateContractWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 982889259) { throw Error('Invalid prefix'); }
    const _newWallet = sc_0.loadAddress();
    return { $$type: 'UpdateContractWallet' as const, newWallet: _newWallet };
}

export function loadTupleUpdateContractWallet(source: TupleReader) {
    const _newWallet = source.readAddress();
    return { $$type: 'UpdateContractWallet' as const, newWallet: _newWallet };
}

export function loadGetterTupleUpdateContractWallet(source: TupleReader) {
    const _newWallet = source.readAddress();
    return { $$type: 'UpdateContractWallet' as const, newWallet: _newWallet };
}

export function storeTupleUpdateContractWallet(source: UpdateContractWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newWallet);
    return builder.build();
}

export function dictValueParserUpdateContractWallet(): DictionaryValue<UpdateContractWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateContractWallet(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateContractWallet(src.loadRef().beginParse());
        }
    }
}

export type WithdrawTON = {
    $$type: 'WithdrawTON';
    amount: bigint;
}

export function storeWithdrawTON(src: WithdrawTON) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1511823115, 32);
        b_0.storeCoins(src.amount);
    };
}

export function loadWithdrawTON(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1511823115) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    return { $$type: 'WithdrawTON' as const, amount: _amount };
}

export function loadTupleWithdrawTON(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'WithdrawTON' as const, amount: _amount };
}

export function loadGetterTupleWithdrawTON(source: TupleReader) {
    const _amount = source.readBigNumber();
    return { $$type: 'WithdrawTON' as const, amount: _amount };
}

export function storeTupleWithdrawTON(source: WithdrawTON) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserWithdrawTON(): DictionaryValue<WithdrawTON> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawTON(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawTON(src.loadRef().beginParse());
        }
    }
}

export type CSPINWithdrawalAuto$Data = {
    $$type: 'CSPINWithdrawalAuto$Data';
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;
    paused: boolean;
    maxSingleWithdraw: bigint;
    totalWithdrawn: bigint;
    withdrawCount: bigint;
}

export function storeCSPINWithdrawalAuto$Data(src: CSPINWithdrawalAuto$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonMaster);
        b_0.storeAddress(src.gameJettonWallet);
        const b_1 = new Builder();
        b_1.storeAddress(src.contractJettonWallet);
        b_1.storeBit(src.paused);
        b_1.storeInt(src.maxSingleWithdraw, 257);
        b_1.storeInt(src.totalWithdrawn, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.withdrawCount, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadCSPINWithdrawalAuto$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _jettonMaster = sc_0.loadAddress();
    const _gameJettonWallet = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _contractJettonWallet = sc_1.loadAddress();
    const _paused = sc_1.loadBit();
    const _maxSingleWithdraw = sc_1.loadIntBig(257);
    const _totalWithdrawn = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _withdrawCount = sc_2.loadIntBig(257);
    return { $$type: 'CSPINWithdrawalAuto$Data' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadTupleCSPINWithdrawalAuto$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'CSPINWithdrawalAuto$Data' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadGetterTupleCSPINWithdrawalAuto$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'CSPINWithdrawalAuto$Data' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function storeTupleCSPINWithdrawalAuto$Data(source: CSPINWithdrawalAuto$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.jettonMaster);
    builder.writeAddress(source.gameJettonWallet);
    builder.writeAddress(source.contractJettonWallet);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.maxSingleWithdraw);
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.withdrawCount);
    return builder.build();
}

export function dictValueParserCSPINWithdrawalAuto$Data(): DictionaryValue<CSPINWithdrawalAuto$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCSPINWithdrawalAuto$Data(src)).endCell());
        },
        parse: (src) => {
            return loadCSPINWithdrawalAuto$Data(src.loadRef().beginParse());
        }
    }
}

export type ContractInfo = {
    $$type: 'ContractInfo';
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;
    paused: boolean;
    maxSingleWithdraw: bigint;
    totalWithdrawn: bigint;
    withdrawCount: bigint;
}

export function storeContractInfo(src: ContractInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonMaster);
        b_0.storeAddress(src.gameJettonWallet);
        const b_1 = new Builder();
        b_1.storeAddress(src.contractJettonWallet);
        b_1.storeBit(src.paused);
        b_1.storeInt(src.maxSingleWithdraw, 257);
        b_1.storeInt(src.totalWithdrawn, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.withdrawCount, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractInfo(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _jettonMaster = sc_0.loadAddress();
    const _gameJettonWallet = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _contractJettonWallet = sc_1.loadAddress();
    const _paused = sc_1.loadBit();
    const _maxSingleWithdraw = sc_1.loadIntBig(257);
    const _totalWithdrawn = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _withdrawCount = sc_2.loadIntBig(257);
    return { $$type: 'ContractInfo' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadTupleContractInfo(source: TupleReader) {
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'ContractInfo' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadGetterTupleContractInfo(source: TupleReader) {
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'ContractInfo' as const, owner: _owner, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function storeTupleContractInfo(source: ContractInfo) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.jettonMaster);
    builder.writeAddress(source.gameJettonWallet);
    builder.writeAddress(source.contractJettonWallet);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.maxSingleWithdraw);
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.withdrawCount);
    return builder.build();
}

export function dictValueParserContractInfo(): DictionaryValue<ContractInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractInfo(src)).endCell());
        },
        parse: (src) => {
            return loadContractInfo(src.loadRef().beginParse());
        }
    }
}

export type Stats = {
    $$type: 'Stats';
    totalWithdrawn: bigint;
    withdrawCount: bigint;
}

export function storeStats(src: Stats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.totalWithdrawn, 257);
        b_0.storeInt(src.withdrawCount, 257);
    };
}

export function loadStats(slice: Slice) {
    const sc_0 = slice;
    const _totalWithdrawn = sc_0.loadIntBig(257);
    const _withdrawCount = sc_0.loadIntBig(257);
    return { $$type: 'Stats' as const, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadTupleStats(source: TupleReader) {
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'Stats' as const, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function loadGetterTupleStats(source: TupleReader) {
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    return { $$type: 'Stats' as const, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount };
}

export function storeTupleStats(source: Stats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.withdrawCount);
    return builder.build();
}

export function dictValueParserStats(): DictionaryValue<Stats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStats(src)).endCell());
        },
        parse: (src) => {
            return loadStats(src.loadRef().beginParse());
        }
    }
}

 type CSPINWithdrawalAuto_init_args = {
    $$type: 'CSPINWithdrawalAuto_init_args';
    owner: Address;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;
}

function initCSPINWithdrawalAuto_init_args(src: CSPINWithdrawalAuto_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonMaster);
        b_0.storeAddress(src.gameJettonWallet);
        const b_1 = new Builder();
        b_1.storeAddress(src.contractJettonWallet);
        b_0.storeRef(b_1.endCell());
    };
}

async function CSPINWithdrawalAuto_init(owner: Address, jettonMaster: Address, gameJettonWallet: Address, contractJettonWallet: Address) {
    const __code = Cell.fromHex('b5ee9c7241021d0100067f000114ff00f4a413f4bcf2c80b01020162020f02f8d0eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e28fa40fa40fa40d401d0fa40d200810101d700810101d700d430d0810101d700301058105710566c188e1efa40fa40fa40d401d0fa403014433004d155027082238d7ea4c680007020e209925f09e027d749c21fe30007f901030c045207d31f2182104c092fc5bae3022182103a95b32bbae3022182105a1c970bbae302218210e6f6e924ba0405060901e831fa403010671056104510344138db3c35812a998d08600000000000000000000000000000000000000000000000000000000000000000045290c705b3f2f4106710565503c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54db310e01ec31fa403010671056104510344138db3c34812a998d08600000000000000000000000000000000000000000000000000000000000000000045290c705b3f2f41067105610455502c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54db310e03d831fa003010671056104510344138db3cf8276f10821005f5e1008200eecf2bc200f2f48200d557511ba012bef2f4718829034bbb5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0055060e0708002400000000544f4e207769746864726177616c005ec87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54db3101f8e302018210946a98b6ba8e6ed33f30c8018210aff90f5758cb1fcb3fc91068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54db31e0070a01fc31d33ffa00fa4031d430d081114df84227c705f2f4814d5025b3f2f48200eecf22c200f2f48200e4235324bbf2f4fa40305191a00aa402821005f5e100715413ba6d82089896806dc855608210be0359515008cb1f16cb3f5004fa0212cecef40001fa02f400c9250350aa5a6d6d40037fc8cf8580ca00cf8440ce01fa020b00a88069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb005515c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54db3102fe2082f0372d2cd103ef0b1ab133fb90b123d320b1e02cbb8aece55c08f4f1a778932736ba8eb63010575514db3c7f34c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54e082f0c24b37f361c4f1b9b13ca970b17a1bc3efb78c8967abee23544ac88ff44993720e0d017cba8eb510575514db3c7034c87f01ca0055705078ce15ce13ce01c8ce12ca0012810101cf0012810101cf0002c8810101cf0012cdcdc9ed54e05f08f2c0820e0010f84228c705f2e084020120101502016a111301afb1477b5134348000638a3e903e903e903500743e90348020404075c020404075c0350c3420404075c00c04160415c4159b062387be903e903e903500743e900c0510cc013455409c2088e35fa931a0001c0838b6cf1b20601200022701afb378bb5134348000638a3e903e903e903500743e90348020404075c020404075c0350c3420404075c00c04160415c4159b062387be903e903e903500743e900c0510cc013455409c2088e35fa931a0001c0838b6cf1b20a01400025c020120161b020148171901afb1b67b5134348000638a3e903e903e903500743e90348020404075c020404075c0350c3420404075c00c04160415c4159b062387be903e903e903500743e900c0510cc013455409c2088e35fa931a0001c0838b6cf1b2220180010547765547765537601afb1b03b5134348000638a3e903e903e903500743e90348020404075c020404075c0350c3420404075c00c04160415c4159b062387be903e903e903500743e900c0510cc013455409c2088e35fa931a0001c0838b6cf1b20601a0008f8276f1001afbacdeed44d0d200018e28fa40fa40fa40d401d0fa40d200810101d700810101d700d430d0810101d700301058105710566c188e1efa40fa40fa40d401d0fa403014433004d155027082238d7ea4c680007020e2db3c6c8181c00022335874a7a');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initCSPINWithdrawalAuto_init_args({ $$type: 'CSPINWithdrawalAuto_init_args', owner, jettonMaster, gameJettonWallet, contractJettonWallet })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const CSPINWithdrawalAuto_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    4429: { message: "Invalid sender" },
    10905: { message: "Invalid address" },
    19792: { message: "Contract is paused" },
    54615: { message: "Insufficient balance" },
    58403: { message: "Amount exceeds limit" },
    61135: { message: "Amount must be positive" },
} as const

export const CSPINWithdrawalAuto_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Invalid sender": 4429,
    "Invalid address": 10905,
    "Contract is paused": 19792,
    "Insufficient balance": 54615,
    "Amount exceeds limit": 58403,
    "Amount must be positive": 61135,
} as const

const CSPINWithdrawalAuto_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransfer","header":3187890513,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"JettonTransferNotification","header":3874941220,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"UpdateGameWallet","header":1275670469,"fields":[{"name":"newWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateContractWallet","header":982889259,"fields":[{"name":"newWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawTON","header":1511823115,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"CSPINWithdrawalAuto$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gameJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"contractJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"maxSingleWithdraw","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ContractInfo","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gameJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"contractJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"maxSingleWithdraw","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Stats","header":null,"fields":[{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
]

const CSPINWithdrawalAuto_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "JettonTransfer": 3187890513,
    "JettonTransferNotification": 3874941220,
    "UpdateGameWallet": 1275670469,
    "UpdateContractWallet": 982889259,
    "WithdrawTON": 1511823115,
}

const CSPINWithdrawalAuto_getters: ABIGetter[] = [
    {"name":"balance","methodId":104128,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"contractInfo","methodId":100057,"arguments":[],"returnType":{"kind":"simple","type":"ContractInfo","optional":false}},
    {"name":"isPaused","methodId":126174,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"stats","methodId":89570,"arguments":[],"returnType":{"kind":"simple","type":"Stats","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const CSPINWithdrawalAuto_getterMapping: { [key: string]: string } = {
    'balance': 'getBalance',
    'contractInfo': 'getContractInfo',
    'isPaused': 'getIsPaused',
    'stats': 'getStats',
    'owner': 'getOwner',
}

const CSPINWithdrawalAuto_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"pause"}},
    {"receiver":"internal","message":{"kind":"text","text":"unpause"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateGameWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateContractWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawTON"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class CSPINWithdrawalAuto implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = CSPINWithdrawalAuto_errors_backward;
    public static readonly opcodes = CSPINWithdrawalAuto_opcodes;
    
    static async init(owner: Address, jettonMaster: Address, gameJettonWallet: Address, contractJettonWallet: Address) {
        return await CSPINWithdrawalAuto_init(owner, jettonMaster, gameJettonWallet, contractJettonWallet);
    }
    
    static async fromInit(owner: Address, jettonMaster: Address, gameJettonWallet: Address, contractJettonWallet: Address) {
        const __gen_init = await CSPINWithdrawalAuto_init(owner, jettonMaster, gameJettonWallet, contractJettonWallet);
        const address = contractAddress(0, __gen_init);
        return new CSPINWithdrawalAuto(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new CSPINWithdrawalAuto(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  CSPINWithdrawalAuto_types,
        getters: CSPINWithdrawalAuto_getters,
        receivers: CSPINWithdrawalAuto_receivers,
        errors: CSPINWithdrawalAuto_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "pause" | "unpause" | UpdateGameWallet | UpdateContractWallet | WithdrawTON | JettonTransferNotification | Deploy) {
        
        let body: Cell | null = null;
        if (message === "pause") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "unpause") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateGameWallet') {
            body = beginCell().store(storeUpdateGameWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateContractWallet') {
            body = beginCell().store(storeUpdateContractWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawTON') {
            body = beginCell().store(storeWithdrawTON(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getBalance(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('balance', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getContractInfo(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('contractInfo', builder.build())).stack;
        const result = loadGetterTupleContractInfo(source);
        return result;
    }
    
    async getIsPaused(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isPaused', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('stats', builder.build())).stack;
        const result = loadGetterTupleStats(source);
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}