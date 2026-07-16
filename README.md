# OLma Docs

OLma의 기술 문서 사이트입니다. 프로젝트의 목적, 프론트엔드 화면 흐름, 백엔드 도메인 구조, API 정책, 운영 구성을 일관된 형식으로 관리하기 위해 Docusaurus를 사용합니다.

## 문서 구성

- 프로젝트 개요: 서비스 목적, 시스템 경계, 도메인별 역할
- 프론트엔드: Next.js App Router 구조, 라우팅, API 연동, 인증 흐름
- API 레퍼런스: 도메인별 API 요약, Swagger만으로 드러나지 않는 비즈니스 규칙과 예외 정책
- 개발 및 아키텍처 가이드: 레이어 구조, 요청 처리 흐름, 인증 필터, 전역 예외 처리, 도메인 지식
- 운영/배포: GitHub Actions, Docker, EC2/RDS, Caddy 배포 흐름, 런타임 설정
- 로깅/모니터링: requestId, MDC, Promtail, Loki, Grafana 구성

## 로컬 실행

```bash
npm ci
npm run start
```

## 정적 빌드 검증

```bash
npm run build
```

## 배포

`main` 브랜치에 push되면 GitHub Actions의 `deploy-docs` job이 실행됩니다.

1. 레포 루트에서 `npm ci`
2. `npm run build`
3. 빌드 결과물을 EC2의 `/var/www/docs`로 동기화
4. Caddy가 `https://docs.olma.kro.kr/`에서 정적 파일 서빙
