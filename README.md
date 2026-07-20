# OLma Docs

OLma의 기술 문서를 관리하는 Docusaurus 기반 문서 사이트입니다.

이 레포지토리는 서비스 코드가 아니라 문서 사이트의 원본, 빌드 설정, 배포 구성을 관리합니다.

## 문서 범위

- 프로젝트 개요
- 로컬 개발 환경
- 프론트엔드 구조 및 화면 흐름
- 백엔드 아키텍처 및 요청 처리 흐름
- API 공통 규격 및 도메인별 API 요약
- 데이터 모델 및 도메인 지식
- 배포 및 런타임 설정
- 로깅/모니터링 구성

## 로컬 실행

```bash
npm ci
npm run start
```

기본 실행 주소는 `http://localhost:3000`입니다.

## 빌드 검증

```bash
npm run build
```

## 배포

`main` 브랜치에 push되면 GitHub Actions의 문서 배포 작업이 실행되고, GitHub Pages로 정적 사이트가 배포됩니다.

배포 흐름은 다음과 같습니다.

1. 의존성 설치
2. Docusaurus 정적 빌드
3. GitHub Pages artifact 업로드
4. GitHub Pages 배포

배포 URL: https://olma-web.github.io/OLma-Docs/

## 관련 레포

- Frontend: https://github.com/Olma-Web/OLma-FE
- Backend: https://github.com/Olma-Web/OLma-BE

## 참고

운영 도메인 종료 후에는 GitHub Pages 배포 URL 또는 이 레포지토리의 로컬 실행으로 문서를 확인할 수 있습니다.
