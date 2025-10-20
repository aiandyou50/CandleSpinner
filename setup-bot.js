const https = require('https');

// 봇 토큰과 설정
const BOT_TOKEN = '8312991368:AAF5csKvKGhVC_67Teb2Yb8Su37JQMbjfw4';
const WEB_APP_URL = 'https://aiandyou.me';

// 봇 메뉴 버튼을 Web App으로 설정하는 함수
function setWebAppMenuButton() {
  const postData = JSON.stringify({
    menu_button: {
      type: 'web_app',
      text: '🎮 게임 시작',
      web_app: {
        url: WEB_APP_URL
      }
    }
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/setChatMenuButton`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const response = JSON.parse(data);
      if (response.ok) {
        console.log('✅ 봇 메뉴 버튼이 Web App으로 설정되었습니다!');
        console.log('📱 Telegram에서 봇을 열고 메뉴 버튼을 클릭해보세요.');
      } else {
        console.error('❌ 설정 실패:', response.description);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 요청 오류:', error.message);
  });

  req.write(postData);
  req.end();
}

// 봇 정보 확인
function getBotInfo() {
  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/getMe`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const response = JSON.parse(data);
      if (response.ok) {
        console.log('🤖 봇 정보:');
        console.log(`이름: ${response.result.first_name}`);
        console.log(`사용자명: @${response.result.username}`);
        console.log(`ID: ${response.result.id}`);

        // 메뉴 버튼 설정
        setWebAppMenuButton();
      } else {
        console.error('❌ 봇 정보 조회 실패:', response.description);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 요청 오류:', error.message);
  });

  req.end();
}

console.log('🚀 Telegram 봇 설정을 시작합니다...');
getBotInfo();