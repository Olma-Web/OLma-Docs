---
title: 팀원별 기여 내역
description: OLma 프로젝트 팀원별 담당 영역과 주요 기여 내역
---

# 팀원별 기여 내역

이 문서는 OLma 프로젝트 완료 시점의 팀원별 담당 영역을 정리한다. 개발 기여는 FE/BE 레포지토리의 커밋 기록을 기준으로 분류했으며, GitHub 계정 없이 참여한 디자인 기여는 별도로 표시한다.

## 요약

| 이름 | 담당 |
| --- | --- |
| 류지민 (`ziminlyu`) | 서비스 기획, 사용자 플로우 설계, 화면 구성 기획 |
| 김민솔 | UI/UX 디자인, 화면 디자인 |
| 김민조 (`Mayne0213`) | 프론트엔드 기능 보수, 백엔드 Estimate/Community API 개발, 인프라/배포/모니터링 구축 |
| 김서윤 | 프론트엔드 화면 개발, 대시보드/커리어/설정 UI 구현 |
| 손수지 | 프론트엔드 기능 개발, 견적 계산기/온보딩/커뮤니티 구현 |
| 정휘준 | 백엔드 인증/보안 개발, 로깅/모니터링 및 문서 배포 파이프라인 기여, PR 관리 |

## 상세 기여

### 류지민 (`ziminlyu`)

- 서비스 기획
- 사용자 플로우 설계
- 핵심 기능 정의 및 화면 구성 기획

### 김민솔

- UI/UX 디자인
- 주요 화면 디자인
- 서비스 화면 구성 및 시각 방향 정리
- GitHub 계정 없이 디자인 산출물 중심으로 참여

### 김민조 (`Mayne0213`)

#### FE

- 견적 및 온보딩 진행 상태 복원 오류 보수
- 커뮤니티 게시글 목록 필터 기능 개발
- 견적 협상 시뮬레이터 및 시장 분석 도구 화면 연동
- 프론트엔드-백엔드 재연동 과정에서 견적 화면 동작 보수

#### BE

- Spring Boot 기반 백엔드 초기 프로젝트 구성
- 스마트 견적 계산기 및 마이페이지 API 개발
- 견적 저장 중복 방지, 단가 제출 소유권 검증, 월 단가 정규화 등 견적 도메인 보수
- 커뮤니티 게시글/댓글 API, 게시글 필터, 작성자 스냅샷, 내 글/댓글 조회 API 개발
- 사용자 드래프트 진행 상태 및 프로필 스펙 진행 상태 API 개발
- 공통 에러 응답, KST 날짜 직렬화, CORS/JWT 필터 등 API 운영 연동 보수

#### Infra

- Terraform을 통한 EC2 기반 all-in-one 인프라 구축
- Docker, GHCR, GitHub Actions 기반 백엔드 CI/CD 구성
- self-hosted runner 기반 배포 파이프라인 전환 및 운영 보수
- Caddy 리버스 프록시, HTTPS, access log 수집 구성
- Prometheus, Loki, Promtail, Grafana 기반 모니터링 및 로그 시스템 구축
- Grafana 대시보드, Discord alert provisioning, host runtime metrics 구성

### 김서윤 (`seoyoon04`)

- Next.js 기반 프론트엔드 화면 개발
- 랜딩 페이지 UI 개발
- 시장 단가 분석 대시보드 개발
- 커리어 관리 페이지 개발
- 마이페이지 및 계정 설정 화면 개발
- 프로젝트명 수정 및 스펙 업데이트 UI 개발
- QA 기반 화면 오류 보수

### 손수지 (`su278210`, `SujiSon`)

- Next.js 기반 프론트엔드 기능 개발
- 로그인/회원가입 화면 및 유효성 검사 개발
- 온보딩 플로우 및 질문 카드 UI 개발
- 스마트 견적 계산기 UI 및 저장 기능 개발
- 이전 견적서 불러오기 및 새로고침 상태 유지 기능 개발
- 협상 시뮬레이터 프론트엔드 연동
- 커뮤니티 게시글/댓글 CRUD 및 좋아요 기능 개발

### 정휘준 (`ralph-Jung`, `Ralph`)

#### BE

- Spring Boot 기반 백엔드 API 개발
- 회원가입/로그인 API 개발
- JWT 및 Spring Security 기반 인증 구조 개선
- 로그인/회원가입 트랜잭션 범위 최적화
- 커뮤니티 댓글 좋아요 API 개발
- 단가 제출 소유권 검증 및 활성 제출 데이터 기준 보수

#### Infra / Observability

- Docusaurus 문서 사이트 초기 구성 및 GitHub Actions 배포 파이프라인 구축
- HTTP percentile histogram 메트릭 추가 및 Grafana 대시보드 패널 구성
- DB Connection Pool 대시보드 패널 정리
- Grafana latency alert NaN 방어 로직 보수
- metric alert의 Discord 라우팅 정리
- request tracing 기반 구조화 로깅 및 ERROR-level Discord webhook 연동

#### Docs / Management

- Docusaurus 기반 API/개발 문서 작성
- 백엔드 PR 병합 관리
