#!/usr/bin/env node
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, beginCell, toNano } from '@ton/core';

/**
 * WithdrawalManager 배포 스크립트 (Blueprint)
 * 
 * 사용:
 *   npx blueprint run deployWithdrawalManager --testnet
 *   npx blueprint run deployWithdrawalManager --mainnet
 */

export const run = async (provider: NetworkProvider) => {
    const ui = provider.ui();
    const network = provider.network();
    const isTestnet = network === 'testnet';

    console.log('\n🚀 WithdrawalManager 배포 시작');
    console.log(`📍 네트워크: ${isTestnet ? 'Testnet' : 'Mainnet'}\n`);

    try {
        // 환경 변수 확인
        const cspin = process.env.CSPIN_JETTON;
        const gameWallet = process.env.GAME_JETTON_WALLET;

        if (!cspin || !gameWallet) {
            throw new Error('필수 환경 변수 누락: CSPIN_JETTON, GAME_JETTON_WALLET');
        }

        // 배포자 정보
        const deployer = provider.sender();
        const deployerAddr = deployer.address;
        if (!deployerAddr) {
            throw new Error('배포자 주소를 얻을 수 없습니다');
        }

        console.log(`배포자: ${deployerAddr.toString()}`);
        console.log(`CSPIN: ${cspin}`);
        console.log(`Game Wallet: ${gameWallet}\n`);

        // 컴파일
        console.log('컴파일 중...');
        const code = await compile('WithdrawalManager');
        console.log(`✅ 완료: ${code.toBoc().length} bytes\n`);

        // 초기 데이터
        const initData = beginCell()
            .storeAddress(Address.parse(gameWallet))
            .storeAddress(Address.parse(cspin))
            .storeBit(false)
            .endCell();

        // 배포
        console.log('배포 중...');
        await deployer.send({
            to: deployerAddr,
            init: { code, data: initData },
            value: toNano('0.05'),
        });

        console.log('✅ 배포 완료!\n');

    } catch (error) {
        console.error('\n❌ 실패:', error instanceof Error ? error.message : error);
        throw error;
    }
};
