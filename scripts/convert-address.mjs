import { Address } from '@ton/core';

function convertAddress(addressString) {
  try {
    console.log('🔄 주소 변환 테스트\n');

    // 입력된 주소 파싱
    const address = Address.parse(addressString);
    console.log('입력 주소:', addressString);
    console.log('');

    // Raw 형식 (0:...)
    const rawAddress = address.toRawString();
    console.log('Raw 주소:', rawAddress);

    // User-friendly bounceable 형식 (EQ...)
    const bounceableAddress = address.toString({ urlSafe: true, bounceable: true });
    console.log('Bounceable 주소:', bounceableAddress);

    // User-friendly non-bounceable 형식 (UQ...)
    const nonBounceableAddress = address.toString({ urlSafe: true, bounceable: false });
    console.log('Non-bounceable 주소:', nonBounceableAddress);

    console.log('');
    console.log('✅ 주소 변환 완료');

  } catch (error) {
    console.log('❌ 주소 변환 실패:', error.message);
  }
}

// 명령줄 인수 처리
const addressString = process.argv[2];
if (addressString) {
  convertAddress(addressString);
} else {
  console.log('사용법: node scripts/convert-address.mjs "주소"');
  console.log('예시: node scripts/convert-address.mjs "UQBFPDdSlPgqPrn2XwhpVq0KQExN2kv83_batQ-dptaR8Mtd"');
}