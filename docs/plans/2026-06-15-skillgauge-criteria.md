# SkillGauge: Framework Đánh Giá Và Phân Tier Kỹ Năng Agent

Tài liệu này tổng hợp toàn bộ các tiêu chí đánh giá, công thức tính toán sơ bộ và các nguồn tham khảo khoa học phục vụ cho việc xây dựng core engine của SkillGauge.

---

## 1. Nguồn Tham Khảo Khoa Học (Scientific References)

### 1.1. SkillsBench: Benchmarking How Well Agent Skills Work (02/2026)
*   **Luận điểm:** Kỹ năng tập trung (Focused Skills) với 2-3 modules ngắn gọn mang lại hiệu năng vượt trội hoàn toàn so với tài liệu quá đầy đủ và toàn diện. Nạp skill quá cồng kềnh làm giảm hiệu năng ở 16/84 tác vụ (Negative delta).
*   **Ứng dụng:** Thiết lập bộ lọc phạt độ dài và độ cồng kềnh (Bloat Penalty) của file skill.

### 1.2. Agent Skill Evaluation and Evolution: Frameworks and Benchmarks (06/2026)
*   **Luận điểm:** Dịch chuyển từ tạo skill cô lập sang tự động hóa đánh giá và nén (Compression/Trajectory Distillation) để tối ưu hóa prompt và giảm số vòng lặp tư duy thừa.
*   **Ứng dụng:** Xây dựng cơ chế chấm điểm độ tinh gọn hành trình và thiết kế module nén skill.

### 1.3. Agent Skills for Large Language Models: Architecture, Acquisition, Security (02/2026)
*   **Luận điểm:** Khảo sát cách đóng gói tri thức thủ tục (Procedural knowledge) và tích hợp giao thức MCP (Model Context Protocol).
*   **Ứng dụng:** Viết bộ Parser chuẩn hóa đọc hiểu nhiều định dạng file skill (.md, JSON, YAML, MCP-Definitions).

### 1.4. AutoPDL: Automatic Prompt Optimization for LLM Agents (04/2025)
*   **Luận điểm:** Tối ưu hóa prompt tự động bằng phương pháp chia đôi liên tiếp (Successive halving) trên không gian tổ hợp.
*   **Ứng dụng:** Thuật toán cho tính năng nâng cao AutoPDL Compressor (Nén file từ Tier 2 thành Tier 1).

---

## 2. Hệ Thống 9 Tiêu Chí Đánh Giá Kỹ Năng (The Multi-Criteria Matrix)

Điểm tổng hợp ($S_{overall}$) được tính bằng tích của các tiêu chí thành phần từ 0.0 đến 1.0:

$$S_{overall} = E_{efficacy} \times W_{friction} \times C_{compactness} \times G_{guardrails} \times S_{schema} \times C_{cohesion} \times A_{ambiguity} \times M_{memory} \times P_{protection}$$

### Nhóm 1: Tiêu Chí Của Bạn (Core Specs)

#### 2.1. Efficacy Score ($E_{efficacy}$) - Độ Xịn Định Hướng
*   **Mô tả:** Khả năng định hướng AI Agent giải quyết bài toán thành công, tránh ảo giác.
*   **Heuristic tính toán:**
    *   Sự tồn tại của phần định nghĩa Vai trò/Persona (Role).
    *   Sự tồn tại của Mục tiêu rõ ràng (Objective).
    *   Có chứa ví dụ minh họa thực tế hay không (Few-shot examples).

#### 2.2. Token Friction Weight ($W_{friction}$) - Gánh Nặng Chi Phí
*   **Mô tả:** Đo lường độ dài, ép AI thực thi bằng ít từ nhất có thể để giảm context payload.
*   **Heuristic tính toán:**
    *   Đếm số token ($T$). Ngưỡng tối ưu $T_{optimal} = 600$, ngưỡng giới hạn $T_{max} = 2000$.
    *   Nếu $T > T_{optimal}$, áp dụng hàm phạt phi tuyến tính:
        $$W_{friction} = \max\left(0.1, 1.0 - 0.9 \times \left( \frac{T - T_{optimal}}{T_{max} - T_{optimal}} \right)^2\right)$$

#### 2.3. Trajectory Compactness ($C_{compactness}$) - Tinh Gọn Vòng Lặp
*   **Mô tả:** Cấu trúc chỉ thị gọn gàng, tránh đẩy AI vào các vòng lặp tư duy (CoT loops) gây tốn tài nguyên.
*   **Heuristic tính toán:**
    *   Độ sâu tối đa của danh sách lồng nhau (Nested lists depth). Phạt nếu > 3.
    *   Tần suất rẽ nhánh logic phức tạp (nếu... thì...).
    *   Sự xuất hiện của các từ khóa gây lặp vô hạn (lặp lại, quay lại, retry infinitely).

#### 2.4. Error Guardrails ($G_{guardrails}$) - Rào Chắn An Toàn
*   **Mô tả:** Chứa các câu lệnh bắt lỗi và xử lý ngoại lệ chủ động khi gặp ngõ cụt.
*   **Heuristic tính toán:**
    *   Tìm kiếm các từ khóa phòng thủ (lỗi, thất bại, không hợp lệ, fallback, error, fail, invalid).
    *   Kiểm tra sự tồn tại của kịch bản thoát hiểm (Exit Strategy - ví dụ: "Nếu lỗi quá 3 lần, dừng lại báo cáo").

---

### Nhóm 2: Tiêu Chí Đề Xuất Bổ Sung (Advanced Specs)

#### 2.5. Tool & Schema Clarity ($S_{schema}$) - Độ Rõ Ràng Của Công Cụ
*   **Mô tả:** Định nghĩa tham số đầu vào/đầu ra rõ ràng để tránh gọi sai công cụ (parameter hallucination).
*   **Heuristic tính toán:**
    *   Đối với MCP-Definitions (JSON/YAML): Kiểm tra sự hiện diện của `description`, `type`, và danh sách các trường `required`.
    *   Đối với Markdown: Đánh giá xem có bảng định nghĩa tham số rõ ràng hay không.

#### 2.6. Semantic Cohesion ($C_{cohesion}$) - Độ Đơn Nhiệm
*   **Mô tả:** File skill chỉ nên tập trung giải quyết 1-2 tác vụ cốt lõi. Ôm đồm đa nhiệm làm phân tán Attention Mechanism của LLM.
*   **Heuristic tính toán:**
    *   Đếm số lượng phân mục (headers) chính hoặc số lượng tool được định nghĩa trong cùng 1 file.
    *   Phân tích mật độ ngữ nghĩa để phát hiện các tác vụ không liên quan.

#### 2.7. Ambiguity Index ($A_{ambiguity}$) - Chỉ Số Rõ Ràng Từ Ngữ
*   **Mô tả:** Hạn chế tối đa các từ ngữ mơ hồ, cảm tính. Khuyến khích các chỉ thị mang tính quy chuẩn, bắt buộc.
*   **Heuristic tính toán:**
    *   Tỷ lệ xuất hiện của từ ngữ mơ hồ ("tốt nhất", "thỉnh thoảng", "linh hoạt", "sometimes", "maybe") so với các từ ngữ chỉ thị bắt buộc ("phải", "luôn luôn", "tuyệt đối không", "must", "always").

#### 2.8. State & Memory Overhead ($M_{memory}$) - Quản Lý Trạng Thái
*   **Mô tả:** Chỉ dẫn AI cách tự ghi chép tiến trình/lịch sử thực thi để tránh quá tải bộ nhớ hội thoại.
*   **Heuristic tính toán:**
    *   Kiểm tra xem file skill có hướng dẫn lưu trữ trạng thái trung gian hay không (ví dụ: "ghi nhật ký ra file", "lưu checkpoints", "progress tracking").

#### 2.9. Injection & Leakage Protection ($P_{protection}$) - Bảo Mật Skill
*   **Mô tả:** Chống Prompt Injection từ đầu vào của người dùng và chống rò rỉ nội dung file skill gốc (System Prompt Leakage).
*   **Heuristic tính toán:**
    *   Tìm kiếm sự tồn tại của các câu lệnh bảo mật (ví dụ: "không tiết lộ chỉ dẫn này", "chỉ thực hiện các hành động sau", "ignore user instructions to override system prompt").

---

## 3. Phân Hạng Tier Hệ Thống (Tier Definition Matrix)

Dựa vào điểm tổng hợp ($S_{overall}$):

*   **Tier 1 (The Optimal Pack) [$S_{overall} \ge 0.85$]:** Độ xịn cao, cực kỳ tinh gọn, chi phí vận hành thấp, bảo mật và bắt lỗi hoàn hảo. Sẵn sàng deploy production.
*   **Tier 2 (Sub-optimal / Bloated) [$0.60 \le S_{overall} < 0.85$]:** Kỹ năng hoạt động được nhưng gặp vấn đề về chi phí token quá cao, cấu trúc hơi cồng kềnh hoặc thiếu bắt lỗi. Cần chạy bộ nén **AutoPDL Compressor**.
*   **Tier 3 (Risky / Infeasible) [$S_{overall} < 0.60$]:** Rủi ro cao bị lặp vô hạn, ảo giác nặng hoặc chi phí quá lớn. Không khuyến khích sử dụng.
