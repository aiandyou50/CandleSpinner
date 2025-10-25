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

export type RequestWithdrawal = {
    $$type: 'RequestWithdrawal';
    jetton_amount: bigint;
    ton_address: Address;
    callback_addr: Address;
}

export function storeRequestWithdrawal(src: RequestWithdrawal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3494308786, 32);
        b_0.storeCoins(src.jetton_amount);
        b_0.storeAddress(src.ton_address);
        b_0.storeAddress(src.callback_addr);
    };
}

export function loadRequestWithdrawal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3494308786) { throw Error('Invalid prefix'); }
    const _jetton_amount = sc_0.loadCoins();
    const _ton_address = sc_0.loadAddress();
    const _callback_addr = sc_0.loadAddress();
    return { $$type: 'RequestWithdrawal' as const, jetton_amount: _jetton_amount, ton_address: _ton_address, callback_addr: _callback_addr };
}

export function loadTupleRequestWithdrawal(source: TupleReader) {
    const _jetton_amount = source.readBigNumber();
    const _ton_address = source.readAddress();
    const _callback_addr = source.readAddress();
    return { $$type: 'RequestWithdrawal' as const, jetton_amount: _jetton_amount, ton_address: _ton_address, callback_addr: _callback_addr };
}

export function loadGetterTupleRequestWithdrawal(source: TupleReader) {
    const _jetton_amount = source.readBigNumber();
    const _ton_address = source.readAddress();
    const _callback_addr = source.readAddress();
    return { $$type: 'RequestWithdrawal' as const, jetton_amount: _jetton_amount, ton_address: _ton_address, callback_addr: _callback_addr };
}

export function storeTupleRequestWithdrawal(source: RequestWithdrawal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.jetton_amount);
    builder.writeAddress(source.ton_address);
    builder.writeAddress(source.callback_addr);
    return builder.build();
}

export function dictValueParserRequestWithdrawal(): DictionaryValue<RequestWithdrawal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRequestWithdrawal(src)).endCell());
        },
        parse: (src) => {
            return loadRequestWithdrawal(src.loadRef().beginParse());
        }
    }
}

export type ApproveWithdrawal = {
    $$type: 'ApproveWithdrawal';
    request_id: bigint;
}

export function storeApproveWithdrawal(src: ApproveWithdrawal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1956174858, 32);
        b_0.storeUint(src.request_id, 64);
    };
}

export function loadApproveWithdrawal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1956174858) { throw Error('Invalid prefix'); }
    const _request_id = sc_0.loadUintBig(64);
    return { $$type: 'ApproveWithdrawal' as const, request_id: _request_id };
}

export function loadTupleApproveWithdrawal(source: TupleReader) {
    const _request_id = source.readBigNumber();
    return { $$type: 'ApproveWithdrawal' as const, request_id: _request_id };
}

export function loadGetterTupleApproveWithdrawal(source: TupleReader) {
    const _request_id = source.readBigNumber();
    return { $$type: 'ApproveWithdrawal' as const, request_id: _request_id };
}

export function storeTupleApproveWithdrawal(source: ApproveWithdrawal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.request_id);
    return builder.build();
}

export function dictValueParserApproveWithdrawal(): DictionaryValue<ApproveWithdrawal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeApproveWithdrawal(src)).endCell());
        },
        parse: (src) => {
            return loadApproveWithdrawal(src.loadRef().beginParse());
        }
    }
}

export type RejectWithdrawal = {
    $$type: 'RejectWithdrawal';
    request_id: bigint;
    reason: string;
}

export function storeRejectWithdrawal(src: RejectWithdrawal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1211889582, 32);
        b_0.storeUint(src.request_id, 64);
        b_0.storeStringRefTail(src.reason);
    };
}

export function loadRejectWithdrawal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1211889582) { throw Error('Invalid prefix'); }
    const _request_id = sc_0.loadUintBig(64);
    const _reason = sc_0.loadStringRefTail();
    return { $$type: 'RejectWithdrawal' as const, request_id: _request_id, reason: _reason };
}

export function loadTupleRejectWithdrawal(source: TupleReader) {
    const _request_id = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'RejectWithdrawal' as const, request_id: _request_id, reason: _reason };
}

export function loadGetterTupleRejectWithdrawal(source: TupleReader) {
    const _request_id = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'RejectWithdrawal' as const, request_id: _request_id, reason: _reason };
}

export function storeTupleRejectWithdrawal(source: RejectWithdrawal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.request_id);
    builder.writeString(source.reason);
    return builder.build();
}

export function dictValueParserRejectWithdrawal(): DictionaryValue<RejectWithdrawal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRejectWithdrawal(src)).endCell());
        },
        parse: (src) => {
            return loadRejectWithdrawal(src.loadRef().beginParse());
        }
    }
}

export type WithdrawalStats = {
    $$type: 'WithdrawalStats';
    processedRequests: bigint;
    totalWithdrawn: bigint;
    totalGasCollected: bigint;
    isPaused: boolean;
}

export function storeWithdrawalStats(src: WithdrawalStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.processedRequests, 257);
        b_0.storeInt(src.totalWithdrawn, 257);
        b_0.storeInt(src.totalGasCollected, 257);
        b_0.storeBit(src.isPaused);
    };
}

export function loadWithdrawalStats(slice: Slice) {
    const sc_0 = slice;
    const _processedRequests = sc_0.loadIntBig(257);
    const _totalWithdrawn = sc_0.loadIntBig(257);
    const _totalGasCollected = sc_0.loadIntBig(257);
    const _isPaused = sc_0.loadBit();
    return { $$type: 'WithdrawalStats' as const, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function loadTupleWithdrawalStats(source: TupleReader) {
    const _processedRequests = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _totalGasCollected = source.readBigNumber();
    const _isPaused = source.readBoolean();
    return { $$type: 'WithdrawalStats' as const, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function loadGetterTupleWithdrawalStats(source: TupleReader) {
    const _processedRequests = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _totalGasCollected = source.readBigNumber();
    const _isPaused = source.readBoolean();
    return { $$type: 'WithdrawalStats' as const, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function storeTupleWithdrawalStats(source: WithdrawalStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.processedRequests);
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.totalGasCollected);
    builder.writeBoolean(source.isPaused);
    return builder.build();
}

export function dictValueParserWithdrawalStats(): DictionaryValue<WithdrawalStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawalStats(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawalStats(src.loadRef().beginParse());
        }
    }
}

export type WithdrawalManager$Data = {
    $$type: 'WithdrawalManager$Data';
    jettonMaster: Address;
    gameJettonWallet: Address;
    owner: Address;
    processedRequests: bigint;
    totalWithdrawn: bigint;
    totalGasCollected: bigint;
    isPaused: boolean;
}

export function storeWithdrawalManager$Data(src: WithdrawalManager$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jettonMaster);
        b_0.storeAddress(src.gameJettonWallet);
        b_0.storeAddress(src.owner);
        const b_1 = new Builder();
        b_1.storeInt(src.processedRequests, 257);
        b_1.storeInt(src.totalWithdrawn, 257);
        b_1.storeInt(src.totalGasCollected, 257);
        b_1.storeBit(src.isPaused);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadWithdrawalManager$Data(slice: Slice) {
    const sc_0 = slice;
    const _jettonMaster = sc_0.loadAddress();
    const _gameJettonWallet = sc_0.loadAddress();
    const _owner = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _processedRequests = sc_1.loadIntBig(257);
    const _totalWithdrawn = sc_1.loadIntBig(257);
    const _totalGasCollected = sc_1.loadIntBig(257);
    const _isPaused = sc_1.loadBit();
    return { $$type: 'WithdrawalManager$Data' as const, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, owner: _owner, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function loadTupleWithdrawalManager$Data(source: TupleReader) {
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _owner = source.readAddress();
    const _processedRequests = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _totalGasCollected = source.readBigNumber();
    const _isPaused = source.readBoolean();
    return { $$type: 'WithdrawalManager$Data' as const, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, owner: _owner, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function loadGetterTupleWithdrawalManager$Data(source: TupleReader) {
    const _jettonMaster = source.readAddress();
    const _gameJettonWallet = source.readAddress();
    const _owner = source.readAddress();
    const _processedRequests = source.readBigNumber();
    const _totalWithdrawn = source.readBigNumber();
    const _totalGasCollected = source.readBigNumber();
    const _isPaused = source.readBoolean();
    return { $$type: 'WithdrawalManager$Data' as const, jettonMaster: _jettonMaster, gameJettonWallet: _gameJettonWallet, owner: _owner, processedRequests: _processedRequests, totalWithdrawn: _totalWithdrawn, totalGasCollected: _totalGasCollected, isPaused: _isPaused };
}

export function storeTupleWithdrawalManager$Data(source: WithdrawalManager$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jettonMaster);
    builder.writeAddress(source.gameJettonWallet);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.processedRequests);
    builder.writeNumber(source.totalWithdrawn);
    builder.writeNumber(source.totalGasCollected);
    builder.writeBoolean(source.isPaused);
    return builder.build();
}

export function dictValueParserWithdrawalManager$Data(): DictionaryValue<WithdrawalManager$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawalManager$Data(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawalManager$Data(src.loadRef().beginParse());
        }
    }
}

 type WithdrawalManager_init_args = {
    $$type: 'WithdrawalManager_init_args';
    jettonMaster: Address;
    gameJettonWallet: Address;
    owner: Address;
}

function initWithdrawalManager_init_args(src: WithdrawalManager_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jettonMaster);
        b_0.storeAddress(src.gameJettonWallet);
        b_0.storeAddress(src.owner);
    };
}

async function WithdrawalManager_init(jettonMaster: Address, gameJettonWallet: Address, owner: Address) {
    const __code = Cell.fromHex('b5ee9c72410209010002f50003feff008e88f4a413f4bcf2c80bed53208f6a30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e23fa40fa40fa40d401d0810101d700810101d700810101d700d200301047104610456c179ffa40fa40fa40552003d15870530070e208925f08e026d749c21f9137e30d05f90120e1ed43d90103070187a6659dbb51343480006388fe903e903e9035007420404075c020404075c020404075c034800c0411c41184115b05e7fe903e903e90154800f4561c14c01c38b6cf1b1d200200085473212303f206d31f218210d046ebb2ba8e4a31fa0030814d5028b3f2f48137c921821005f5e100bef2f402a402a010465513c87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54db31e02182107498dc0abae302218210483bf7aebae302018210946a98b6bae30237105604050600745b820084adf84224c705f2f410465513c87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54db3100745b82008a44f84224c705f2f410465513c87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54db3100ccd33f30c8018210aff90f5758cb1fcb3fc91057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54db3101bc82f0372d2cd103ef0b1ab133fb90b123d320b1e02cbb8aece55c08f4f1a778932736ba8e38308165def84223c705f2f4103555127fc87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54e00800c682f07d007a8451af3f033f0141ee07e1683a056ac1e060b1af864842294b1de8b57bba8e388200a02bf84223c705f2f41035551270c87f01ca0055605067ce14ce12ce01c8810101cf0012810101cf0012810101cf0012ca00cdc9ed54e05f06f2c082f8446e41');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initWithdrawalManager_init_args({ $$type: 'WithdrawalManager_init_args', jettonMaster, gameJettonWallet, owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const WithdrawalManager_errors = {
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
    14281: { message: "Minimum withdrawal amount is 1 CSPIN" },
    19792: { message: "Contract is paused" },
    26078: { message: "Only owner can pause" },
    33965: { message: "Only owner can approve" },
    35396: { message: "Only owner can reject" },
    41003: { message: "Only owner can resume" },
} as const

export const WithdrawalManager_errors_backward = {
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
    "Minimum withdrawal amount is 1 CSPIN": 14281,
    "Contract is paused": 19792,
    "Only owner can pause": 26078,
    "Only owner can approve": 33965,
    "Only owner can reject": 35396,
    "Only owner can resume": 41003,
} as const

const WithdrawalManager_types: ABIType[] = [
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
    {"name":"RequestWithdrawal","header":3494308786,"fields":[{"name":"jetton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"ton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"callback_addr","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ApproveWithdrawal","header":1956174858,"fields":[{"name":"request_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"RejectWithdrawal","header":1211889582,"fields":[{"name":"request_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"reason","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"WithdrawalStats","header":null,"fields":[{"name":"processedRequests","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalGasCollected","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"isPaused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"WithdrawalManager$Data","header":null,"fields":[{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gameJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"processedRequests","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawn","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalGasCollected","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"isPaused","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const WithdrawalManager_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "RequestWithdrawal": 3494308786,
    "ApproveWithdrawal": 1956174858,
    "RejectWithdrawal": 1211889582,
}

const WithdrawalManager_getters: ABIGetter[] = [
    {"name":"getStats","methodId":104054,"arguments":[],"returnType":{"kind":"simple","type":"WithdrawalStats","optional":false}},
]

export const WithdrawalManager_getterMapping: { [key: string]: string } = {
    'getStats': 'getGetStats',
}

const WithdrawalManager_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"RequestWithdrawal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ApproveWithdrawal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RejectWithdrawal"}},
    {"receiver":"internal","message":{"kind":"text","text":"pause"}},
    {"receiver":"internal","message":{"kind":"text","text":"resume"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class WithdrawalManager implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = WithdrawalManager_errors_backward;
    public static readonly opcodes = WithdrawalManager_opcodes;
    
    static async init(jettonMaster: Address, gameJettonWallet: Address, owner: Address) {
        return await WithdrawalManager_init(jettonMaster, gameJettonWallet, owner);
    }
    
    static async fromInit(jettonMaster: Address, gameJettonWallet: Address, owner: Address) {
        const __gen_init = await WithdrawalManager_init(jettonMaster, gameJettonWallet, owner);
        const address = contractAddress(0, __gen_init);
        return new WithdrawalManager(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new WithdrawalManager(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  WithdrawalManager_types,
        getters: WithdrawalManager_getters,
        receivers: WithdrawalManager_receivers,
        errors: WithdrawalManager_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: RequestWithdrawal | ApproveWithdrawal | RejectWithdrawal | "pause" | "resume" | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RequestWithdrawal') {
            body = beginCell().store(storeRequestWithdrawal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ApproveWithdrawal') {
            body = beginCell().store(storeApproveWithdrawal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RejectWithdrawal') {
            body = beginCell().store(storeRejectWithdrawal(message)).endCell();
        }
        if (message === "pause") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "resume") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('getStats', builder.build())).stack;
        const result = loadGetterTupleWithdrawalStats(source);
        return result;
    }
    
}