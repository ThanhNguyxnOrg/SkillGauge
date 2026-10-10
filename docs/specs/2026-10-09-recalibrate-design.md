# Spec: Recalibrate SkillGauge Static Linter (2026-10-09)

> Ponytail: smallest diff that fixes load-bearing lies. Deletion > addition. No new deps. No dynamic track (deferred, named at bottom).

## 0. Intent (đã duyệt)

- Giữ positioning A: community leaderboard + static linter tham khảo, bỏ nhãn “scientific”.
- Giữ 390 metrics theo code (không cắt về 100).
- H-Z để implementer quyết theo chuyên môn → quyết: **dedup triple, không viết lại toàn bộ 19 dims**.
- Thành công = skill xịn ≥ skill gaming, tier phân bố được (không 100% Tier 3), docs reproduce code.

## 1. Scope (mọi nơi change phải chạm)

- `packages/core/src/engine.ts:221,240-274,224-238,294-368` — overall, tier, failedDims, aliases, async.
- `packages/core/src/scorers/dimH.ts` (+ I-Z cùng template) — H1/H11, H3/H13, H5/H15.
- `packages/core/src/scorers/dimA.ts:83-87` (A5), `dimG.ts:149-155` (G11), defaults `dimA.ts:148,219,227`, `dimH.ts:14,28`.
- `packages/core/src/packageEngine.ts:69-77` — sum-vs-mean, redundancyPenalty, integrity.
- `packages/core/src/optimizer.ts:27-45,120` — blind replace, code-block guard.
- `packages/cli/src/index.ts:143,173,253,382-388` — verbose count, engine path, duplicate.
- Docs/web: `README.md:5,22`, `docs/scientific_metrics.md:1,3,77`, `CONTRIBUTING.md:13`, `packages/web/src/App.tsx:99`.
- Tests: `packages/core/src/__tests__/engine_100_scorers.test.ts`, `engine_all_scorers.test.ts`, `packageEngine.test.ts`, `optimizer.test.ts` — mọi đổi công thức phải update expectation, không để test cũ khóa hành vi sai.
- Data: `leaderboard.json` (411 entries) + `re-audit-all.yml` — re-audit sau đổi, giữ `author`/`submittedAt`.
- Không chạm: `dynamicEngine.ts`, `githubHelper.ts`, workflows submit/verify ngoài re-audit.

## 2. Quyết định

### 2.1 Tier theo percentile, không ngưỡng tuyệt đối chết
- Xóa 85/60 (`engine.ts:240-245`). Thay bằng percentile trên 411 skill hiện tại, tính 1 lần rồi hardcode + script tái tính trong `re-audit-all`:
  - Tier1 = ≥P90, Tier2 = ≥P50, còn lại Tier3. Với phân phối 31-38 hiện tại → Tier1 ≈ ≥36.5, Tier2 ≈ ≥33.5 (số cuối từ script, không đoán trong code).
- `overallScore` giữ `(Σ/390)·100` để tương thích, nhưng UI đổi nhãn “Static signal 0-100 (không phải task success)”.
- `failedDims` (`engine.ts:249-274`): một bar duy nhất <70% max (10.5/15), xóa 2 bar đặc biệt C<7.5/E<9.0. Xóa aliases gây hiểu lầm `friction/compactness/memory` (`engine.ts:224-238`) hoặc đổi tên thành `b1_raw/b4_raw/b11_raw`.

### 2.2 Dedup H-triple, neutralize defaults (không rewrite 19 dims)
- Xóa bản trùng, giữ bản đầu: xóa H11/H12/H13/H14/H15 (giữ H1-H10)? Không — ponytail hơn: giữ đủ 15 key để không vỡ `engine.ts` loop H-Z, nhưng cho 5 key trùng **delegate về bản gốc**: `scoreH11=scoreH1`, `scoreH12=scoreH2` (dùng /24, xóa /44), `scoreH13=scoreH3` (x13, xóa x23), `scoreH14=scoreH4` (/19, xóa /29), `scoreH15=scoreH5` (/4, xóa /2). Áp dụng cùng pattern cho I-Z (script kiểm tra bằng diff literal, không sửa tay 285 hàm).
- Defaults: missing-pair từ 0.2 → 0.5 trung tính (`dimH.ts:14,46,76` và tương đương I-Z); single-block 0.5 giữ; empty-set 0 giữ (thật sự rỗng). Không thưởng/không phạt khi skill ngoài chủ đề dim.
- Không đụng TTR-vs-density mâu thuẫn ở vòng này (ghi `shortcut:` trong code, nâng khi có execution track).

### 2.3 Một engine, disclose multiplier
- CLI file và dir cùng dùng `auditSkill` sync. `auditSkillAsync` chỉ dùng khi user truyền `--llm`显式 (thêm flag, default off); khi bật, log dòng `LLM multiplier=x.xx` vào report + `explanation`, không rescale lặng lẽ (`engine.ts:346-347`).
- `packages/cli/src/index.ts:143` verbose đổi nhãn “390 raw signals” thay “scientific metrics”.

### 2.4 Package + optimizer + duplicate (tối thiểu)
- `packageEngine.ts`: tier dùng mean (giữ), `packageScore` đổi thành mean (thay vì sum) để headline và tier cùng chiều; `redundancyPenalty` đổi tên `retentionFactor`, giữ công thức (tránh vỡ downstream) nhưng fix docs; `integrityScore` chỉ đếm link markdown `[]()` + frontmatter `references:`/`scripts:`, không regex mọi `*.json|*.md` trong prose (`packageEngine.ts:36`).
- `optimizer.ts`: skip mọi nội dung trong ``` fences và frontmatter trước khi replace; xóa map `usually→required`, `mostly/likely/probably→strictly` (đổi ngữ nghĩa); giữ filler-removal + collapse newline. LLM path giữ nguyên guard “chỉ nhận khi score không giảm” nhưng log rõ.
- `check-duplicate`: flag khi `hash==` bất kể repo (xóa `&& s.repository!==repoName`); thêm near-dupe cảnh báo (không fail) bằng Jaccard dòng >0.9 — 20 dòng, không thêm dep.

### 2.5 Docs/web honesty
- README/CONTRIBUTING/web hero: “390 static signals (26×15), community linter — không phải benchmark execution”. Sửa `scientific_metrics.md`: title/body thống nhất 390; A5 đổi nhãn Reading Ease + constants theo code (67.5/17.5/0.02/0.2); C1/C2/E10/F1/F11/B6/B7/B10 ghi đúng code tiered/3-nhánh; floors `max(0.1/0.2/…)` liệt kê explicit; xóa cites `(arXiv:2502)`, `(arXiv:2501)`, bare `(ACL)/(NeurIPS)` hoặc thay full ID; G11 xóa schema `tests` (spec chỉ cần name+description); Dim G header 10→15 metrics.
- Migration: chạy `re-audit-all`, giữ author/submittedAt, commit leaderboard + research files này.

## 3. Data flow / error handling / testing

- Flow: audit sync → overall/percentile-tier → explanation 1 bar → CLI/JSON → web bundle (`scripts/sync-skills.js` giữ nguyên).
- Lỗi: file không frontmatter → skip + warn (giữ); centroids percentile thiếu data → fallback Tier3 + log.
- Test: update 4 suite trên theo expectation mới; thêm 2 test nhỏ: (a) gaming-stuffed < skill xịn sau dedup+defaults, (b) file-vs-dir cùng điểm khi `--llm` off. Không thêm framework.

## 4. Không làm (đã cắt)

Dynamic paired-execution track, MATTR rewrite, dependency-parser thật, marketplace dispute flow, LLM-rewrite toàn bộ skills.

## 5. Self-review

- Placeholder: không (mọi số percentile từ script, không TBD).
- Consistency: tier percentile + package mean cùng chiều; H-delegate giữ 15 key nên loop engine không vỡ.
- Scope: một plan duy nhất, không cần tách.
- Ambiguity: “giữ bản đầu” nghĩa là H1-H10 canonical, H11-15 delegate — đã explicit.
