---
sidebar_position: 1
title: 단가 제출 API 가이드
description: 단가 제보(RateSubmission) 도메인의 비즈니스 정책, 연동 흐름, 예외 처리 규칙
---

# 단가 제출(RateSubmission) API 가이드 & 비즈니스 정책

> 💡 **Swagger vs 본 문서의 차이점**
> - **Swagger (`/swagger-ui.html`, `/v3/api-docs`):** 요청/응답 DTO 스펙, HTTP 메서드 등 기술적 입출력 규격 확인용.
> - **본 문서:** Swagger 필드 설명만으로는 안 보이는 비즈니스 규칙(Rule), 도메인 간 연동 흐름(Flow), 예외 처리 정책 확인용.

기준 코드: `RateSubmissionController.java`, `RateSubmissionService.java`, `RateSubmission.java` (2026-07 기준)

---

## 1. 도메인 핵심 비즈니스 규칙 (Business Policies)

### 인증 정책
`RateSubmissionController`의 `/v1/submissions` 경로는 `JwtFilter`의 인증 제외 경로에 포함되지 않는다. 따라서 **조회(GET)를 포함한 4개 엔드포인트 전부** `Authorization: Bearer <JWT>`가 필요하다. 컨트롤러의 `@SecurityRequirement(name = "BearerAuth")`는 이 동작을 Swagger UI에 표시하기 위한 문서화 어노테이션이다.

### userId 폴백 규칙
`RateSubmissionController.create()`:

```java
if (request.getUserId() == null) {
    request.setUserId((Long) httpRequest.getAttribute("userId"));
}
```

생성 요청 바디에 `userId`를 명시하면 그 값을 그대로 쓴다. 비워두면 인증 필터가 JWT에서 추출해 `HttpServletRequest`에 심어둔 `userId` 속성으로 채운다. 비로그인 상태(속성 자체가 없음)라면 최종적으로 `null`로 저장된다.

### 단가 검증 및 정규화 규칙
- Bean Validation: `amount`는 `@Min(10)` — 10 미만이면 400.
- 서비스 레이어(`RateSubmissionService.create()`): 환산 월 단가(`normalizedMonthly`)가 계산되면 10~9,999 범위를 벗어날 때 400.
- `normalizedMonthly` 계산 로직 (`RateSubmission.calculateNormalizedMonthly()`) — Swagger 스키마로는 드러나지 않는 의미론적 규칙:
  - `amountUnit = MONTHLY`: `normalizedMonthly = amount`
  - `amountUnit = TOTAL`: `normalizedMonthly = amount / 환산개월수` (HALF_UP 반올림)
  - `duration` 문자열이 아래 표에 없거나 파싱 실패 시: `normalizedMonthly = null` (범위 검사 자체를 건너뜀)

| `duration` 값 | 환산 개월 수 |
|----|-------------|
| `1주일 이하` | 0.25개월 |
| `2~3주` | 0.625개월 |
| `1개월` | 1개월 |
| `2~3개월` | 2.5개월 |
| `3개월 이상` | 3개월 |
| 숫자 문자열 | 해당 숫자를 개월 수로 파싱 |

```mermaid
flowchart TD
  start["RateSubmission 생성"] --> unit{"amountUnit"}
  unit -- "MONTHLY" --> monthly["normalizedMonthly = amount"]
  unit -- "TOTAL" --> parse["duration을 개월 수로 환산"]
  parse --> parsed{"환산 가능?"}
  parsed -- "Yes" --> divide["amount / months 반올림"]
  parsed -- "No" --> nullValue["normalizedMonthly = null"]
  monthly --> range{"10~9,999 범위?"}
  divide --> range
  range -- "Yes" --> save["저장"]
  range -- "No" --> badRequest["400 Bad Request"]
  nullValue --> save
```

### 소유권 정책 — PATCH와 DELETE가 다르다

```mermaid
flowchart TD
  request["인증된 사용자 요청"] --> action{"요청 종류"}
  action -- "PATCH /project-name" --> patchLoad["id + userId로 조회"]
  patchLoad --> patchOwner{"소유자 일치?"}
  patchOwner -- "Yes" --> patchUpdate["프로젝트명 수정"]
  patchOwner -- "No" --> patch404["404 Not Found"]
  action -- "DELETE /{id}" --> deleteLoad["id로만 조회"]
  deleteLoad --> deleteHide["status = HIDDEN"]
  deleteHide --> delete204["204 No Content"]
```

| 작업 | 소유권 확인 기준 | 실패 시 응답 | 현재 동작 |
|------|------------------|--------------|-----------|
| 프로젝트명 수정 | `submission.id` + `request.userId` | 404 | 본인 소유가 아니면 존재하지 않는 것처럼 처리 |
| 삭제 | `submission.id`만 확인 | 없음 | 인증된 사용자가 id를 알면 숨김 처리 가능 |
| 단건 조회 | `submission.id`만 확인 | 404 | 소유자와 status를 확인하지 않고 응답 |

:::warning[PATCH는 404로 소유권을 위장한다]
**PATCH**(`project-name` 수정)는 요청자의 `userId`와 제보의 소유자가 다르거나 소유자가 없으면 **404**를 반환한다 — 403이 아니라 "존재 자체를 숨기는" 방식이다. `RateSubmissionService.updateProjectName()` 참고.
:::

:::danger[현재 구현 한계 — DELETE 소유권 검사 누락]
`RateSubmissionService.delete()`는 `id`만으로 조회해 바로 `hide()` 처리하며, 요청자와 소유자를 비교하는 코드가 없다. 현재 구현에서는 **인증된 사용자가 다른 사용자의 제보도 삭제(숨김) 처리할 수 있다.**

개선 방향은 `HttpServletRequest`에서 추출한 `userId`를 서비스에 전달하고, 제보 소유자와 다르면 404 또는 403을 반환하도록 변경하는 것이다. 이때 "타 사용자의 제보 삭제 요청은 실패한다"는 통합 테스트를 함께 추가해야 한다.
:::

---

## 2. API 연동 시나리오

:::note
아래 흐름은 클라이언트가 단가 제보 화면을 구현할 때 자연스럽게 따르게 되는 권장 호출 순서다. 백엔드는 이 순서를 강제하지 않으며, 세 컨트롤러 모두 서로 독립적으로 호출 가능하다.
:::

```text
[ReferenceData 조회] → [RateSubmission 생성] → [Benchmark 조회] (선택)
```

```mermaid
sequenceDiagram
  participant Client
  participant ReferenceDataController
  participant RateSubmissionController
  participant RateSubmissionService
  participant BenchmarkController

  Client->>ReferenceDataController: 직무/경력 기준 데이터 조회
  ReferenceDataController-->>Client: jobCategoryId, experienceLevelId
  Client->>RateSubmissionController: POST /v1/submissions
  RateSubmissionController->>RateSubmissionService: create(request)
  RateSubmissionService-->>RateSubmissionController: RateSubmissionResponse
  RateSubmissionController-->>Client: 201 Created
  Client->>BenchmarkController: GET /v1/benchmark (선택)
  BenchmarkController-->>Client: BenchmarkResult
```

1. 클라이언트는 `ReferenceDataController`(`/v1/reference/job-categories`, `/v1/reference/experience-levels`)에서 유효한 `jobCategoryId`/`experienceLevelId`를 얻는다. `RateSubmissionRequest`의 두 필드는 `@NotNull`이며, 존재하지 않는 ID를 넣으면 400(`Invalid job category`/`Invalid experience level`)이 반환된다.
2. 위 ID로 `POST /v1/submissions`를 호출해 단가를 제보한다.
3. 같은 `jobCategoryId` 등으로 `BenchmarkController`(`GET /v1/benchmark`)를 호출하면 시장 통계를 조회할 수 있다. 다만 이 호출은 방금 만든 제보와 서버 측에서 연결되지 않는다 — 단순히 같은 참조 데이터를 공유할 뿐이다.

---

## 3. 엔드포인트 요약

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `POST` | `/v1/submissions` | 필요 | 단가 제보 생성 |
| `GET` | `/v1/submissions/{id}` | 필요 | 단가 제보 단건 조회 (status 무관) |
| `PATCH` | `/v1/submissions/{id}/project-name` | 필요 | 프로젝트명 수정 (본인 소유만) |
| `DELETE` | `/v1/submissions/{id}` | 필요 | 소프트 삭제 (현재 구현은 소유권 검사 없음) |

요청/응답 필드의 전체 스키마는 Swagger UI(`/swagger-ui.html`, 백엔드 서버 경로)에서 확인한다. `RateSubmissionRequest`/`RateSubmissionResponse`에는 `projectName`(선택, 최대 100자) 필드도 포함된다.

**참고 — 소프트 삭제의 실제 동작:** `delete`는 물리 삭제가 아니라 `RateSubmission.hide()`를 통해 `status`를 `HIDDEN`으로 바꾸는 소프트 삭제다. 다만 `RateSubmissionService.getById()`는 `status`와 무관하게 조회 결과를 그대로 반환한다 — 즉 삭제(숨김) 처리된 제보도 ID를 알면 GET으로 그대로 조회된다. 목록 조회 API가 없어 현재 코드 기준으로는 "숨김" 처리의 효과가 실질적으로 나타나는 지점이 없다.

---

## 4. 오류/예외 처리

| HTTP 상태 | 발생 조건 |
|-----------|-----------|
| 400 | `amount < 10`, 필수 필드 누락(Bean Validation), 존재하지 않는 `jobCategoryId`/`experienceLevelId`, 또는 `normalizedMonthly`가 10~9,999 범위를 벗어남 |
| 401 | JWT 미제공 또는 유효하지 않은 JWT |
| 404 | 해당 `id`의 제보가 없음, **또는** PATCH 요청자가 소유자가 아님 (403 아님 — 위 소유권 정책 참고) |

### 제한 사항 및 후속 테스트

| 항목 | 현재 동작 | 위험 | 후속 개선 |
|------|-----------|------|-----------|
| DELETE 소유권 검사 | `id`만으로 조회 후 `HIDDEN` 처리 | 타 사용자 제보 숨김 가능 | `userId`를 서비스에 전달하고 소유자 불일치 시 404 또는 403 반환 |
| HIDDEN 제보 단건 조회 | `getById`가 status를 확인하지 않음 | 숨김 처리 후에도 id를 알면 조회 가능 | 조회 시 `ACTIVE` 조건 적용 또는 HIDDEN 응답 정책 명시 |
| `SubmissionType` 의미 | `TRACK_A`, `TRACK_B` 이름만 존재 | 클라이언트/문서에서 의미 해석 어려움 | 도메인 용어로 리네임하거나 Swagger 설명 보강 |

권한 관련 개선 시에는 아래 테스트를 함께 추가한다.

| 테스트 | 기대 결과 |
|--------|-----------|
| 다른 사용자의 제보를 DELETE 요청 | 404 또는 403 |
| HIDDEN 제보를 GET 요청 | 정책 결정 후 404 또는 현재 동작 유지 |
| 본인 제보 프로젝트명 수정 | 200 및 변경된 `projectName` 반환 |

---

## 관련 문서

- [프로젝트 개요](/) — 전체 도메인 지도에서 단가 제출이 차지하는 위치
- [데이터 모델](/development/data-model) — RateSubmission과 기준 데이터/사용자 관계
- Swagger UI (`/swagger-ui.html`) — 요청/응답 스키마 전체 명세
