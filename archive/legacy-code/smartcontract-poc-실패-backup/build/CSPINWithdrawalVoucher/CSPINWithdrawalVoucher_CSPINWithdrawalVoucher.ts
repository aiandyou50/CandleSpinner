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

export type WithdrawJetton = {
    $$type: 'WithdrawJetton';
    amount: bigint;
    recipient: Address;
}

export function storeWithdrawJetton(src: WithdrawJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2303366791, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.recipient);
    };
}

export function loadWithdrawJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2303366791) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _recipient = sc_0.loadAddress();
    return { $$type: 'WithdrawJetton' as const, amount: _amount, recipient: _recipient };
}

export function loadTupleWithdrawJetton(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'WithdrawJetton' as const, amount: _amount, recipient: _recipient };
}

export function loadGetterTupleWithdrawJetton(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    return { $$type: 'WithdrawJetton' as const, amount: _amount, recipient: _recipient };
}

export function storeTupleWithdrawJetton(source: WithdrawJetton) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.recipient);
    return builder.build();
}

export function dictValueParserWithdrawJetton(): DictionaryValue<WithdrawJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawJetton(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawJetton(src.loadRef().beginParse());
        }
    }
}

export type Pause = {
    $$type: 'Pause';
}

export function storePause(src: Pause) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2051344601, 32);
    };
}

export function loadPause(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2051344601) { throw Error('Invalid prefix'); }
    return { $$type: 'Pause' as const };
}

export function loadTuplePause(source: TupleReader) {
    return { $$type: 'Pause' as const };
}

export function loadGetterTuplePause(source: TupleReader) {
    return { $$type: 'Pause' as const };
}

export function storeTuplePause(source: Pause) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserPause(): DictionaryValue<Pause> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePause(src)).endCell());
        },
        parse: (src) => {
            return loadPause(src.loadRef().beginParse());
        }
    }
}

export type Unpause = {
    $$type: 'Unpause';
}

export function storeUnpause(src: Unpause) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2378902809, 32);
    };
}

export function loadUnpause(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2378902809) { throw Error('Invalid prefix'); }
    return { $$type: 'Unpause' as const };
}

export function loadTupleUnpause(source: TupleReader) {
    return { $$type: 'Unpause' as const };
}

export function loadGetterTupleUnpause(source: TupleReader) {
    return { $$type: 'Unpause' as const };
}

export function storeTupleUnpause(source: Unpause) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserUnpause(): DictionaryValue<Unpause> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnpause(src)).endCell());
        },
        parse: (src) => {
            return loadUnpause(src.loadRef().beginParse());
        }
    }
}

export type ClaimWithVoucher = {
    $$type: 'ClaimWithVoucher';
    amount: bigint;
    recipient: Address;
    nonce: bigint;
    signature: Cell;
}

export function storeClaimWithVoucher(src: ClaimWithVoucher) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3489514392, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.recipient);
        b_0.storeUint(src.nonce, 64);
        b_0.storeRef(src.signature);
    };
}

export function loadClaimWithVoucher(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3489514392) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _recipient = sc_0.loadAddress();
    const _nonce = sc_0.loadUintBig(64);
    const _signature = sc_0.loadRef();
    return { $$type: 'ClaimWithVoucher' as const, amount: _amount, recipient: _recipient, nonce: _nonce, signature: _signature };
}

export function loadTupleClaimWithVoucher(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    const _nonce = source.readBigNumber();
    const _signature = source.readCell();
    return { $$type: 'ClaimWithVoucher' as const, amount: _amount, recipient: _recipient, nonce: _nonce, signature: _signature };
}

export function loadGetterTupleClaimWithVoucher(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _recipient = source.readAddress();
    const _nonce = source.readBigNumber();
    const _signature = source.readCell();
    return { $$type: 'ClaimWithVoucher' as const, amount: _amount, recipient: _recipient, nonce: _nonce, signature: _signature };
}

export function storeTupleClaimWithVoucher(source: ClaimWithVoucher) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.recipient);
    builder.writeNumber(source.nonce);
    builder.writeCell(source.signature);
    return builder.build();
}

export function dictValueParserClaimWithVoucher(): DictionaryValue<ClaimWithVoucher> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimWithVoucher(src)).endCell());
        },
        parse: (src) => {
            return loadClaimWithVoucher(src.loadRef().beginParse());
        }
    }
}

export type CSPINWithdrawalVoucher$Data = {
    $$type: 'CSPINWithdrawalVoucher$Data';
    owner: Address;
    ownerPublicKey: bigint;
    jettonMaster: Address;
    gameJettonWallet: Address;
    contractJettonWallet: Address;
    paused: boolean;
    maxSingleWithdraw: bigint;
    totalWithdrawn: bigint;
    withdrawCount: bigint;
    usedNonces: Dictionary<bigint, boolean>;
}

export function storeCSPINWithdrawalVoucher$Data(src: CSPINWithdrawalVoucher$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.ownerPublicKey, 256);
        b_0.storeAddress(src.jettonMaster);
        const b_1 = new Builder();
        b_1.storeAddress(src.gameJettonWallet);
        b_1.storeAddress(src.contractJettonWallet);
        b_1.storeBit(src.paused);
        b_1.storeInt(src.maxSingleWithdraw, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.totalWithdrawn, 257);
        b_2.storeInt(src.withdrawCount, 257);
        b_2.storeDict(src.usedNonces, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadCSPINWithdrawalVoucher$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _ownerPublicKey = sc_0.loadUintBig(256);
    const _jettonMaster = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _gameJettonWallet = sc_1.loadAddress();
    const _contractJettonWallet = sc_1.loadAddress();
    const _paused = sc_1.loadBit();
    const _maxSingleWithdraw = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _totalWithdrawn = sc_2.loadIntBig(257);
    const _withdrawCount = sc_2.loadIntBig(257);
    const _usedNonces = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    return { $$type: 'CSPINWithdrawalVoucher$Data' as const, owner: _owner, ownerPublicKey: _ownerPublicKey, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount, usedNonces: _usedNonces };
}

export function loadTupleCSPINWithdrawalVoucher$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _ownerPublicKey = source.readBigNumber();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    const _usedNonces = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'CSPINWithdrawalVoucher$Data' as const, owner: _owner, ownerPublicKey: _ownerPublicKey, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount, usedNonces: _usedNonces };
}

export function loadGetterTupleCSPINWithdrawalVoucher$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _ownerPublicKey = source.readBigNumber();
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _contractJettonWallet = source.readAddress();
    const _paused = source.readBoolean();
    const _maxSingleWithdraw = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _withdrawCount = source.readBigNumber();
    const _usedNonces = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'CSPINWithdrawalVoucher$Data' as const, owner: _owner, ownerPublicKey: _ownerPublicKey, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, contractJettonWallet: _contractJettonWallet, paused: _paused, maxSingleWithdraw: _maxSingleWithdraw, totalWithdrawn: _totalWithdrawn, withdrawCount: _withdrawCount, usedNonces: _usedNonces };
}

export function storeTupleCSPINWithdrawalVoucher$Data(source: CSPINWithdrawalVoucher$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.ownerPublicKey);
    builder.writeAddress(source.jettonMaster);
    builder.writeAddress(source.gameJettonWallet);
    builder.writeAddress(source.contractJettonWallet);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.maxSingleWithdraw);
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.withdrawCount);
    builder.writeCell(source.usedNonces.size > 0 ? beginCell().storeDictDirect(source.usedNonces, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserCSPINWithdrawalVoucher$Data(): DictionaryValue<CSPINWithdrawalVoucher$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCSPINWithdrawalVoucher$Data(src)).endCell());
        },
        parse: (src) => {
            return loadCSPINWithdrawalVoucher$Data(src.loadRef().beginParse());
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

 type CSPINWithdrawalVoucher_init_args = {
    $$type: 'CSPINWithdrawalVoucher_init_args';
    owner: Address;
    ownerPublicKey: bigint;
    jettonMaster: Address;
    gameJettonWallet: Address;
    maxWithdraw: bigint;
}

function initCSPINWithdrawalVoucher_init_args(src: CSPINWithdrawalVoucher_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.ownerPublicKey, 257);
        b_0.storeAddress(src.jettonMaster);
        const b_1 = new Builder();
        b_1.storeAddress(src.gameJettonWallet);
        b_1.storeInt(src.maxWithdraw, 257);
        b_0.storeRef(b_1.endCell());
    };
}

async function CSPINWithdrawalVoucher_init(owner: Address, ownerPublicKey: bigint, jettonMaster: Address, gameJettonWallet: Address, maxWithdraw: bigint) {
    const __code = Cell.fromHex('b5ee9c7241021a0100065c000114ff00f4a413f4bcf2c80b01020162020e02f2d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e4afa40810101d700fa40d401d0fa40810101d7003010251024102305d155036d8d086000000000000000000000000000000000000000000000000000000000000000000470702010354014e30d0b925f0be009d70d1ff2e08221180304ea8210cffdc398bae3022182104c092fc5ba8ecf31fa4030108910781067105610451034413adb3c361089107810675504c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed54e02182103a95b32bbae3022182107a4508d9ba040b060701fe31fa00fa40d33f30814d5026b3f2f48200eecf23c200f2f48200e4235335bbf2f48142c32d81010123714133f40c6fa19401d70030925b6de26ef2f41c810101017f71216e955b59f45a3098c801cf004133f442e25121a00aa47070c882100f8a7ea501cb1f7001cb3f5004fa02500dcf162acf1612ca008208989680fa0205019e1bca00c9821005f5e1007126035a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001079106810571046103544300c01a231fa4030108910781067105610451034413adb3c3510891078106710565503c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed540b04b48ebb5b10795516db3c7f35c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed54e02182108dcb2d19bae3022182105a1c970bbae302218210894a9687ba0b08090a01765b10795516db3c7035c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed540b02b831fa0030108910781067105610451034413adb3c8200d557f8276f102cbef2f4529b716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0055080b0c03fe8f7431fa00fa403050abdb3c7070c882100f8a7ea501cb1f7001cb3f500dfa02500dcf162acf161bca008208989680fa021bca00c9821005f5e1007126035a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb005517e0018210946a98b6ba0b0c0d00168200e99af8422bc705f2f40064c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed5400fa8e75d33f30c8018210aff90f5758cb1fcb3fc9108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca005590509ace17cbff15ce03c8ce12ceca0012810101cf0002c8810101cf0013810101cf0013f40012cdcdc9ed54e05f0bf2c0820201200f14020120101202b9bb8c8ed44d0d200018e4afa40810101d700fa40d401d0fa40810101d7003010251024102305d155036d8d086000000000000000000000000000000000000000000000000000000000000000000470702010354014e30d5509db3c6ca181811002e8101012202714133f40c6fa19401d70030925b6de26eb302b5b9de2ed44d0d200018e4afa40810101d700fa40d401d0fa40810101d7003010251024102305d155036d8d086000000000000000000000000000000000000000000000000000000000000000000470702010354014e30ddb3c6ca28181300045321020162151702b5b1b67b51343480006392be9020404075c03e903500743e9020404075c00c040944090408c1745540db6342180000000000000000000000000000000000000000000000000000000000000000011c1c08040d500538c376cf1b2a2018160010547976547876538702b5b1b03b51343480006392be9020404075c03e903500743e9020404075c00c040944090408c1745540db6342180000000000000000000000000000000000000000000000000000000000000000011c1c08040d500538c376cf1b286018190058fa40d3fffa40d401d0fa40fa40d200810101d700d430d0810101d700810101d700f40430107a107910786c1a0008f8276f1003930e15');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initCSPINWithdrawalVoucher_init_args({ $$type: 'CSPINWithdrawalVoucher_init_args', owner, ownerPublicKey, jettonMaster, gameJettonWallet, maxWithdraw })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const CSPINWithdrawalVoucher_errors = {
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
    17091: { message: "Nonce already used" },
    19792: { message: "Contract is paused" },
    54615: { message: "Insufficient balance" },
    58403: { message: "Amount exceeds limit" },
    59802: { message: "Only owner can call this" },
    61135: { message: "Amount must be positive" },
} as const

export const CSPINWithdrawalVoucher_errors_backward = {
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
    "Nonce already used": 17091,
    "Contract is paused": 19792,
    "Insufficient balance": 54615,
    "Amount exceeds limit": 58403,
    "Only owner can call this": 59802,
    "Amount must be positive": 61135,
} as const

const CSPINWithdrawalVoucher_types: ABIType[] = [
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
    {"name":"UpdateGameWallet","header":1275670469,"fields":[{"name":"newWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"UpdateContractWallet","header":982889259,"fields":[{"name":"newWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawTON","header":1511823115,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"WithdrawJetton","header":2303366791,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Pause","header":2051344601,"fields":[]},
    {"name":"Unpause","header":2378902809,"fields":[]},
    {"name":"ClaimWithVoucher","header":3489514392,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"recipient","type":{"kind":"simple","type":"address","optional":false}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"signature","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"CSPINWithdrawalVoucher$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownerPublicKey","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gameJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"contractJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"maxSingleWithdraw","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"usedNonces","type":{"kind":"dict","key":"int","value":"bool"}}]},
    {"name":"ContractInfo","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gameJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"contractJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"maxSingleWithdraw","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Stats","header":null,"fields":[{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawCount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
]

const CSPINWithdrawalVoucher_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "UpdateGameWallet": 1275670469,
    "UpdateContractWallet": 982889259,
    "WithdrawTON": 1511823115,
    "WithdrawJetton": 2303366791,
    "Pause": 2051344601,
    "Unpause": 2378902809,
    "ClaimWithVoucher": 3489514392,
}

const CSPINWithdrawalVoucher_getters: ABIGetter[] = [
    {"name":"balance","methodId":104128,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"contractInfo","methodId":100057,"arguments":[],"returnType":{"kind":"simple","type":"ContractInfo","optional":false}},
    {"name":"stats","methodId":89570,"arguments":[],"returnType":{"kind":"simple","type":"Stats","optional":false}},
    {"name":"isNonceUsed","methodId":80072,"arguments":[{"name":"nonce","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const CSPINWithdrawalVoucher_getterMapping: { [key: string]: string } = {
    'balance': 'getBalance',
    'contractInfo': 'getContractInfo',
    'stats': 'getStats',
    'isNonceUsed': 'getIsNonceUsed',
}

const CSPINWithdrawalVoucher_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimWithVoucher"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateGameWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateContractWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Pause"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Unpause"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawTON"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class CSPINWithdrawalVoucher implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = CSPINWithdrawalVoucher_errors_backward;
    public static readonly opcodes = CSPINWithdrawalVoucher_opcodes;
    
    static async init(owner: Address, ownerPublicKey: bigint, jettonMaster: Address, gameJettonWallet: Address, maxWithdraw: bigint) {
        return await CSPINWithdrawalVoucher_init(owner, ownerPublicKey, jettonMaster, gameJettonWallet, maxWithdraw);
    }
    
    static async fromInit(owner: Address, ownerPublicKey: bigint, jettonMaster: Address, gameJettonWallet: Address, maxWithdraw: bigint) {
        const __gen_init = await CSPINWithdrawalVoucher_init(owner, ownerPublicKey, jettonMaster, gameJettonWallet, maxWithdraw);
        const address = contractAddress(0, __gen_init);
        return new CSPINWithdrawalVoucher(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new CSPINWithdrawalVoucher(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  CSPINWithdrawalVoucher_types,
        getters: CSPINWithdrawalVoucher_getters,
        receivers: CSPINWithdrawalVoucher_receivers,
        errors: CSPINWithdrawalVoucher_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: ClaimWithVoucher | UpdateGameWallet | UpdateContractWallet | Pause | Unpause | WithdrawTON | WithdrawJetton | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimWithVoucher') {
            body = beginCell().store(storeClaimWithVoucher(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateGameWallet') {
            body = beginCell().store(storeUpdateGameWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateContractWallet') {
            body = beginCell().store(storeUpdateContractWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Pause') {
            body = beginCell().store(storePause(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Unpause') {
            body = beginCell().store(storeUnpause(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawTON') {
            body = beginCell().store(storeWithdrawTON(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawJetton') {
            body = beginCell().store(storeWithdrawJetton(message)).endCell();
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
    
    async getStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('stats', builder.build())).stack;
        const result = loadGetterTupleStats(source);
        return result;
    }
    
    async getIsNonceUsed(provider: ContractProvider, nonce: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(nonce);
        const source = (await provider.get('isNonceUsed', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
}