# 관상어용 스마트 어항 시스템(서버 영역)
어항에 설치된 IoT와 모바일 앱을 활용해서 어항 내 상태를 모니터링하고 원격으로 어항을 관리하는 시스템의 서버 영역입니다.
|개발 기간|2026.01~2026.11|
|---|---|
## 팀 구성 및 담당 역할
|개발자|기능 담당|
|---|---|
|김서원(팀장)|IoT기능 개발,프론트엔드 UI개발|
|이다경|IoT기능 개발, 물고기 행동 분석 AI개발 및 AI서버 담당, 프론트엔드 UI개발 보조|
|유승엽|백엔드 서버 개발,프론트엔드 UI개발 보조|


### 개요
---
1. 기술 스택
2. 데이터베이스 설계 관계도
3. API 명세
4. 담당 역할 및 기여 내용
5. 트러블슈팅
6. 프로젝트 구조
7. 실행 방법


### 기술 스택
---
|구분|기술 스택|
|---|---|
|백엔드(서버)|javascript,node.js,express.js|
|DataBase/ORM|MySQL 8.0, sequelize|
|인증|JWT,kakao Oauth 2.0,google Oauth 2.0|
|실시간 통신|Websocket(ws)|
|인프라|AWS EC2,Docker,Docker Compose|
|버전 관리|git,github|


### 데이터 베이스 설계
---
+추후 올릴 예정


### API 명세서
---
  + [SwaggerApi명세서](http://localhost:3000/api-docs) 
    + (백엔드 서버 실행 후 확인 가능)
  + pdf파일은 추후에 올릴 예정

### 담당 역할 및 기여 내용
---
  + 회원관리 기능 개발
  + 데이터베이스 설계 및 관
  + RESTAPI 기능 개발
  + IoT실시간 통신 기능 개발


### 트러블 슈팅
---
  + UTC와 KST 시간 문제
  + SSE를 활용한 IoT 통신의 한계


### 프로젝트 구조
---
```text
fishTankServer/
├── bin/
│   └── www                     # HTTP 서버 실행 및 WebSocket 연결
│
├── config/
│   └── config.js               # Sequelize 데이터베이스 연결 설정
│
├── models/                     # Sequelize 모델 및 테이블 관계 정의
│   ├── index.js                # 모델 초기화 및 연관 관계 설정
│   ├── user.js                 # 사용자
│   ├── userimage.js            # 프로필 이미지
│   ├── tank.js                 # 어항 및 관리 기준값
│   ├── sensor.js               # 수온 기록
│   ├── waterquality.js         # 수질 기록
│   ├── daily.js                # 일일 요약
│   ├── FeederLog.js            # 먹이 지급 기록
│   ├── waterchange.js          # 환수 기록
│   ├── alert.js                # 경고 알림
│   ├── Fishinfo.js             # 사육 중인 물고기 정보
│   ├── post.js                 # 커뮤니티 게시글
│   ├── image.js                # 게시글 이미지
│   ├── comment.js              # 댓글 및 답글
│   ├── commentLike.js          # 댓글 좋아요
│   ├── chatbotRoom.js          # 챗봇 대화방
│   ├── chatbotmessage.js       # 챗봇 대화 기록
│   └── aiAnalyze.js            # AI 분석 모델
│
├── migrations/                 # 데이터베이스 스키마 변경 이력
│
├── routes/                     # HTTP API 라우터
│   ├── index.js                # 기능별 라우터 연결
│   ├── auth/
│   │   ├── index.js            # 소셜 로그인, 토큰 재발급, 프로필 관리
│   │   └── authMiddleware.js   # JWT 액세스 토큰 검증
│   ├── tank/
│   │   ├── index.js            # 어항 설정, 센서 수신, 알림 조회
│   │   ├── tanksse.js          # 센서 캐시, 최고·최저 수온, SSE 및 경고 처리
│   │   └── schedual.js         # 센서·수질 주기 저장 및 일일 요약
│   ├── daily/
│   │   └── index.js            # 날짜별 일지 조회
│   ├── fishinfo/
│   │   └── index.js            # 물고기 정보 조회 및 저장
│   ├── communty/
│   │   └── index.js            # 게시글, 댓글, 좋아요 관리
│   ├── chatbot/
│   │   ├── index.js            # 대화방 및 메시지 API
│   │   └── chatbotSetting.js   # AI 답변 생성
│   └── uploaded/
│       ├── userupload.js       # 프로필 이미지 업로드 설정
│       └── profileupload.js    # 게시글 이미지 업로드 설정
│
├── socket/                     # WebSocket 통신 및 명령 처리
│   ├── index.js                # 사용자·IoT·AI 연결 등록 및 메시지 분기
│   ├── feed.js                 # 먹이 지급 명령 및 결과 처리
│   ├── waterChange.js          # 환수 명령 및 결과 처리
│   └── Ai/
│       ├── userCommand.js      # AI 서버에 어종 분석 요청
│       └── AiResult.js         # 어종·활동 분석 결과를 사용자에게 전달
│
├──uploads/                     #업로드 이미지 저장소
│  ├──post                      #게시판에 올릴 사진 저장소
│  └──user                      #유저 프로필 올릴 사진 저장소
│
├── app.js                      # Express 앱, 미들웨어 및 라우터 설정
├── Dockerfile                  # 서버 컨테이너 이미지 빌드 설정
├── package.json                # 의존성 및 실행 스크립트
├── package-lock.json           # 의존성 버전 고정
└── README.md                   # 프로젝트 소개 및 실행 안내
```

### 실행 방법
---
#### 1. 프로젝트 다운로드 하기
git clone https://github.com/ysy03/fishTankServer.git  
cd fishTankServer

#### 2. 환경변수 설정
.env파일 만든 다음 해당 내용 입력

```
DB_USERNAME = <DB_USERNAME>  
DB_PASSWORD = <DB_PASSWORD>  
DB_DATABSENAME = <DB_DATABASENAME>  
DB_HOST = <DB_HOST>

chatbot_apiKey = <GEMINI_API_KEY>

JWT_SECRET = <JWT_SECRET>
JWT_REFRESH = <JWT_REFRESH>
```
#### 3.실행 방법
서버는 크게 Node.js환경와 Docker환경으로 실행할 수 있습니다.(주의 mysql 먼저 실행 한 이후에 실행해주셔야 합니다.)

##### 3-1.Node.js 환경
```
npm install  
npm run start
```
##### 3-2.Docker 환경
```docker build -t <Project-Name> .```    
  build:프로젝트가 돌아가는 환경을 이미지형태로 제작합니다.  
  -t:프로젝트 이름을 지정해줍니다.  
  '.':이미지에 들어갈 재료를 표시해줍니다.


```docker run -d --name <Project-Name> --env-file .env -p <로컬환경 포트번호>:3000 <Project-Name>```  
  run:제작한 이미지를 바탕으로 실행하는 환경인 컨테이너를 제작한 후 실행하게 합니다.  
  -p:포트번호를 지정해줍니다.  
  -d:백그라운드 환경에서 돌아가게 합니다.  
  --env-file:환경설정 파일을 가져와줍니다.









