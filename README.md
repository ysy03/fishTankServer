# 관상어용 스마트 어항 시스템(서버 영역)
어항에 설치된 IoT와 모바일 앱을 활용해서 어항 내 상태를 모니터링하고 원격으로 어항을 관리하는 시스템의 서버 영역입니다.
|개발 기간|2026.01~2026.11|
|---|---|
## 팀 구성
|개발자|기능 담당|
|---|---|
|김서원(팀장)|IoT기능 개발,프론트엔드 UI개발|
|이다경|IoT기능 개발, 물고기 행동 분석 AI개발 및 AI서버 담당, 프론트엔드 UI개발 보조|
|유승엽|백엔드 서버 개발,프론트엔드 UI개발 보조|


### 개요
---
1. 개발 배경 및 목적
2. 기술 스택
3. 시스템 아키텍처
4. 주요 기능
5. 데이터베이스 설계
6. API 명세
7. 담당 역할 및 기여 내용
8. 트러블슈팅
9. 실행 및 배포 방법
10. 개선 사항 및 향후 계획


### 개발 배경 및 목적
---
이 시스템은 잦은 출장으로 어항 내 상태를 관리하고, 먹이를 주거나, 환수 등 어항 관리를 꾸준하게 수행하기 힘들어 관상어 키우기 꺼려하는 사람들을 위해 개발하였다. 
사용자들은 핸드폰 앱으로 어항에 설치한 IoT를 조작할 수 있게 해줌으로서 어항 관리에 부담을 줄여주고 좀 더 편리하게 관리할 수 있게 해준다

### 기술 스택
---
|구분|기술 스택|
|---|---|
|프론트 엔드(모바일)|Dart,flutter|
|백엔드(서버)|javascript,node.js,express.js|
|DataBase/ORM|MySQL 8.0, sequelize|
|인증|JWT,kakao Oauth 2.0,google Oauth 2.0|
|실시간 통신|Websocket(ws)|
|실시간 스트리밍|MediaMTX,RTSP,WebRTC|
|AI서버|파이썬,FastAPI|
|인프라|AWS EC2,Docker,Docker Compose|
|버전 관리|git,github|

### 시스템 아키텍처
----

### 주요 기능
|기능|설명|
|---|---|
|로그인|해당 시스템을 이용하려는 사람들|

### 데이터 베이스 설계

### API 명세서

### 담당 역할 및 기여 내용

### 트러블 슈팅

### 실행 방법
---
#### 1. 프로젝트 다운로드 하기
git clone <repository-url>
cd <project-directory>

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
서버는 크게 Node.js환경와 Docker환경으로 실행할 수 있습니다.

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


```docker run -d <Project-Name> --env-file .env -p <로컬환경 포트번호>:<설정한 포트번호> ```  
  run:제작한 이미지를 바탕으로 실행하는 환경인 컨테이너를 제작한 후 실행하게 합니다.  
  -p:포트번호를 지정해줍니다.  
  -d:백그라운드 환경에서 돌아가게 합니다.  
  --env-file:환경설정 파일을 가져와줍니다.




### 개선 사항 및 향후 계획









