---
sidebar_position: 2
title: 런타임 설정
description: EC2에서 실행되는 도메인, Caddy, Docker, 환경 변수, runner, Terraform 상태를 정리한다.
---

# 런타임 설정

이 문서는 운영 EC2에서 실제로 어떤 프로세스와 설정 파일이 서비스를 구성하는지 정리한다. 배포 흐름은 [배포 아키텍처](./deploy)를 참고하고, 이 문서는 인스턴스 교체나 장애 복구 시 확인해야 할 런타임 상태에 집중한다.

## 공개 도메인

| 도메인 | 역할 | 내부 연결 |
| --- | --- | --- |
| `olma-web.github.io/OLma-Docs` | Docusaurus 문서 사이트 | GitHub Pages |
| `api.olma.kro.kr` | Spring Boot API | `localhost:8080` |
| `grafana.olma.kro.kr` | Grafana dashboard | `localhost:3000` |

API와 Grafana 도메인은 Caddy가 HTTPS 인증서 발급과 reverse proxy를 처리한다. 문서 사이트는 GitHub Pages가 정적 파일을 서빙한다.

## Caddy 설정

Terraform 기준 Caddyfile:

```caddy
api.olma.kro.kr {
  reverse_proxy localhost:8080
}

grafana.olma.kro.kr {
  reverse_proxy localhost:3000
}
```

운영 서버에서 확인할 명령:

```bash
sudo cat /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl status caddy
```

## Docker 컨테이너

| 컨테이너 | 이미지 | 포트 | 역할 |
| --- | --- | --- | --- |
| `olma-backend` | `ghcr.io/olma-web/olma-backend:latest` | `127.0.0.1:8080:8080` | Spring Boot API |
| `grafana` | `grafana/grafana:11.0.0` | `127.0.0.1:3000:3000` | 대시보드 |
| `prometheus` | `prom/prometheus:v2.52.0` | `127.0.0.1:9090:9090` | 메트릭 수집 |
| `loki` | `grafana/loki:3.0.0` | `127.0.0.1:3100:3100` | 로그 저장 |
| `promtail` | `grafana/promtail:3.0.0` | 없음 | Docker 로그 수집 |
| `node-exporter` | `prom/node-exporter:v1.8.1` | 내부 | EC2 host metric |

백엔드, Grafana, Prometheus, Loki는 외부에 직접 포트를 열지 않고 loopback에 바인딩한다. 외부 접근은 Caddy를 통해서만 허용한다.

확인 명령:

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
docker network inspect monitoring
```

## 환경 변수 파일

### `/home/ubuntu/olma.env`

백엔드 컨테이너가 사용하는 런타임 환경 변수 파일이다. Terraform user_data가 초기 생성하고, GitHub Actions deploy job이 컨테이너 실행 시 `--env-file`로 주입한다.

| 변수 | 설명 |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | 운영 프로파일 (`prod`) |
| `SPRING_DATASOURCE_URL` | RDS PostgreSQL 연결 URL |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | JWT 서명 시크릿 |

### `/home/ubuntu/monitoring.env`

모니터링 stack이 사용하는 환경 변수 파일이다.

| 변수 | 설명 |
| --- | --- |
| `DISCORD_WEBHOOK_URL` | Grafana alert Discord webhook URL |
| `GRAFANA_ADMIN_PASSWORD` | Grafana admin 비밀번호 |

Grafana는 anonymous viewer 접근을 허용하고 로그인 폼/basic auth를 비활성화한다. admin 비밀번호는 비상 관리용으로 파일에 보관한다.

## GitHub Actions runner

배포는 EC2 내부의 self-hosted runner가 실행한다.

| 항목 | 값 |
| --- | --- |
| repo | `Olma-Web/OLma-BE` |
| runner label | `self-hosted`, `Linux`, `ARM64`, `olma` |
| 주요 job | `deploy`, `deploy-monitoring` |

확인 명령:

```bash
sudo systemctl status actions.runner.Olma-Web-OLma-BE.olma-backend-ec2.service
gh api repos/Olma-Web/OLma-BE/actions/runners
```

EC2가 교체되면 runner 등록은 새 인스턴스에 자동 복원되지 않는다. 새 인스턴스에 runner를 다시 등록하고, GitHub에 남은 오프라인 runner는 제거해야 한다.

## Terraform 변수와 출력

주요 변수:

| 변수 | 용도 | 기본값 |
| --- | --- | --- |
| `region` | AWS region | `ap-northeast-2` |
| `domain` | API 도메인 | `api.olma.kro.kr` |
| `grafana_domain` | Grafana 도메인 | `grafana.olma.kro.kr` |
| `ghcr_image` | 백엔드 이미지 | `olma-web/olma-backend` |
| `db_instance_class` | RDS 인스턴스 타입 | `db.t4g.micro` |

주요 output:

| output | 의미 |
| --- | --- |
| `api_url` | `https://api.olma.kro.kr` |
| `grafana_url` | `https://grafana.olma.kro.kr` |
| `public_ip` | EC2 Elastic IP |
| `db_endpoint` | RDS endpoint |
| `ssh_command` | EC2 SSH 접속 명령 |

## EC2 교체 시 복구 기준

Terraform이 관리하는 것:

| 항목 | 복구 방식 |
| --- | --- |
| EC2 인스턴스 | Terraform resource |
| Elastic IP 연결 | Terraform resource |
| 보안 그룹 | Terraform resource |
| RDS | Terraform resource |
| Caddy 설치 및 기본 Caddyfile | user_data |
| Docker 및 Compose v2 설치 | user_data |
| 백엔드 env 파일 | user_data |
| 모니터링 env 파일 초기값 | user_data |

EC2 교체 후 별도 확인이 필요한 것:

| 항목 | 이유 |
| --- | --- |
| GitHub Actions runner | GitHub 등록 토큰으로 새 인스턴스에 재등록 필요 |
| 모니터링 stack | `deploy-monitoring` workflow 또는 compose 재실행 필요 |
| Grafana 데이터 | Docker volume이 인스턴스 로컬에 있으므로 교체 시 초기화 가능 |
| SSH known_hosts | EIP는 같아도 host key가 바뀜 |

## 점검 명령 모음

```bash
curl -I https://olma-web.github.io/OLma-Docs/
curl -I https://api.olma.kro.kr/v3/api-docs
curl -I https://api.olma.kro.kr/swagger-ui.html
curl -I https://grafana.olma.kro.kr/

ssh ubuntu@13.124.31.106 'docker ps'
ssh ubuntu@13.124.31.106 'sudo systemctl is-active caddy'
ssh ubuntu@13.124.31.106 'sudo systemctl is-active actions.runner.Olma-Web-OLma-BE.olma-backend-ec2.service'
```

## 관련 문서

- [배포 아키텍처](./deploy)
- [로깅/모니터링](../observability/logging)
- [요청 처리 흐름](../development/request-flow)
