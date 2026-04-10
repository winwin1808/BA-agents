# RQM - Metafield-Based Filter for Quote Rule v1 in BSS B2B Request a Quote, Quick

**Date:** 2026-04-09  
**App:** BSS B2B Request a Quote, Quick  
**Module:** Quote Rule  
**Affected surfaces:** Admin rule setup, storefront quote submission flows, Quick Order -> RFQ handoff  
**Document type:** Implementation-ready RQM  
**Status:** Draft for PM/Dev review  
**Delivery guardrail:** Max 30 dev hours

## Kết luận / đề xuất chính

Đề xuất làm một `v1` rất hẹp cho `Metafield-based filter` trong `Quote Rule` để giữ delivery trong `30 giờ dev`:

- Chỉ thêm một filter type mới là `Metafield`
- Chỉ hỗ trợ `Product metafield` và `Variant metafield`
- Chỉ hỗ trợ 3 nhóm data:
  - `Number`
  - `Boolean`
  - `Single select`
- Chỉ hỗ trợ một operator là `equals`
- Chỉ load và hiển thị các metafield hợp lệ từ Shopify store
- Không thêm buyer-facing filter control mới trên storefront
- Không mở rộng sang `Customer metafield`, `text`, `list`, `reference`, hoặc operator nâng cao

`V1` này giải quyết đúng bài toán merchant cần: lọc product hoặc variant theo cấu hình metafield riêng của store, nhưng không biến task thành một rule engine mở rộng vượt effort.

## 1. Purpose

### Business problem

Quote Rule hiện chưa cho merchant dùng metafield của store để quyết định rule nào sẽ match cho product hoặc variant. Vì vậy, merchant thiếu một cách cấu hình linh hoạt để kiểm soát RFQ theo dữ liệu riêng của catalog.

Tài liệu hiện tại cũng đang thiếu 3 phần khiến dev khó estimate chính xác:

1. `V1` sẽ phục vụ những loại metafield filter nào
2. Filter này tác động trên storefront ra sao
3. Sau `v1` có thể mở tiếp phần nào mà không làm nhiễu scope hiện tại

### Why now

- App đã public update ngày `Nov 28, 2025` cho phép hiển thị thêm `product metafields` trong Request for Quote form.
- Bước tiếp theo hợp lý là dùng metafield làm điều kiện match cho `Quote Rule`.
- Nếu không khóa scope từ đầu, task này rất dễ nở sang text parsing, advanced operators, buyer-facing UI, và vượt khỏi `30 giờ dev`.

## 2. Goals

### Primary goals

1. Cho merchant chọn `Metafield` khi tạo hoặc sửa `Quote Rule` filter.
2. Cho phép rule match theo `Product metafield` hoặc `Variant metafield`.
3. Chỉ hỗ trợ một tập metafield type nhỏ, predictable, và an toàn cho performance.
4. Giữ storefront hiện tại, không thêm filter UI mới cho buyer trong `v1`.

### Success conditions

- Merchant nhìn thấy và chọn được metafield hợp lệ trong setup.
- Chỉ các metafield thuộc type được hỗ trợ mới xuất hiện trong dropdown.
- Rule evaluate theo giá trị metafield hiện tại tại thời điểm customer gửi quote.
- Nếu metafield không tồn tại, `null`, hoặc empty thì rule `không match`.
- Tổng effort không vượt `30 giờ dev`.

## 3. Delivery

### 3.1 Scope

#### In scope

- Thêm filter type `Metafield` trong `Quote Rule`
- Cho merchant chọn `Source`:
  - `Product metafield`
  - `Variant metafield`
- Load metafield definitions từ Shopify store hiện tại
- Chỉ hiển thị các metafield thuộc type được hỗ trợ trong `v1`
- Dùng `equals` là operator duy nhất
- Evaluate rule theo giá trị metafield hiện tại khi customer gửi quote
- Reuse storefront behavior hiện có của rule engine, không thêm surface mới cho buyer

#### Out of scope

- `Customer metafield`
- Text metafield, rich text, JSON, date/time, money, measurement, color, reference, metaobject, file, list, multi-select
- Các operator khác như `contains`, `not equals`, `greater than`, `less than`, `between`, `in list`
- Storefront chips, dropdown, badge, tooltip, helper text, hoặc explanation message mới cho buyer
- Rule preview, debug console, hay detailed logging riêng cho metafield filter
- Analytics riêng cho metafield filter
- API, import/export, hoặc migration cho metafield filter

### 3.2 Supported metafield set

| Metafield type | Supported in v1 | Admin input | Operator |
| --- | --- | --- | --- |
| `Number` | Yes | Numeric input | `equals` |
| `Boolean` | Yes | `True / False` select | `equals` |
| `Single select` | Yes | Single-option dropdown | `equals` |
| `Text` | No | N/A | N/A |
| `List / Multi-select` | No | N/A | N/A |
| `Complex types` | No | N/A | N/A |

Ghi chú:

- `Number` bao gồm integer và decimal.
- `Single select` chỉ áp dụng cho metafield có tập option xác định sẵn.
- Với `Boolean`, UI có thể hiển thị `True / False`, nhưng logic lưu và evaluate vẫn là `equals`.

### 3.3 Admin setup flow

#### Requirement 1. Add Metafield filter type

Hệ thống phải cho merchant chọn `Metafield` khi tạo một filter mới trong `Quote Rule`.

- Sau khi chọn `Metafield`, merchant phải chọn tiếp `Source`:
  - `Product metafield`
  - `Variant metafield`
- Danh sách metafield phải được load từ store hiện tại.
- Mỗi option nên hiển thị tối thiểu:
  - label hoặc name
  - `namespace.key`
  - owner type
  - data type

#### Requirement 2. Show only supported metafields

Hệ thống chỉ được hiển thị metafield definition hợp lệ trong `v1`.

- Chỉ hiển thị metafield thuộc 3 nhóm:
  - `Number`
  - `Boolean`
  - `Single select`
- Metafield không được hỗ trợ không được xuất hiện trong dropdown.
- Nếu store không có metafield hợp lệ, hiển thị một empty state ngắn gọn, đủ để merchant hiểu vì sao chưa chọn được.

#### Requirement 3. Render value input by type

Hệ thống phải render input value theo loại metafield mà merchant đã chọn.

- `Number`: numeric input
- `Boolean`: dropdown `True / False`
- `Single select`: dropdown option hợp lệ của metafield đó

### 3.4 Runtime logic

#### Requirement 4. Evaluate metafield on quote submission

Hệ thống phải evaluate filter theo giá trị metafield hiện tại tại thời điểm customer gửi quote.

- `Product metafield` được đọc từ product context của item đang được rule engine evaluate.
- `Variant metafield` được đọc từ variant context của item đang được rule engine evaluate.
- `V1` phải reuse granularity và item context hiện có của Quote Rule engine.
- `V1` không thêm logic aggregation mới chỉ dành riêng cho metafield filter.

#### Requirement 5. Apply strict no-match rules

Hệ thống phải trả kết quả `no match` trong các trường hợp sau:

- Metafield không tồn tại
- Metafield có giá trị `null`
- Metafield có giá trị empty
- Giá trị thực tế khác với giá trị merchant đã cấu hình

#### Requirement 6. Keep comparison logic minimal

Hệ thống chỉ hỗ trợ một logic so sánh là `equals`.

- `Number` match khi giá trị bằng đúng giá trị đã cấu hình
- `Boolean` match khi giá trị bằng đúng `true` hoặc `false`
- `Single select` match khi option hiện tại bằng đúng option merchant đã chọn

### 3.5 Storefront behavior

#### Requirement 7. Do not add new storefront filter UI

`V1` không thêm buyer-facing filter UI mới trên storefront.

- Buyer không nhìn thấy dropdown filter, chip, badge, hay selector mới liên quan đến metafield.
- Layout và wording hiện có của `Request for Quote` và `Quick Order -> RFQ` không đổi chỉ vì feature này.
- Buyer không phải chọn giá trị metafield trên storefront.

#### Requirement 8. Reuse existing Quote Rule outcome

Metafield filter chỉ là điều kiện nội bộ để quyết định `Quote Rule` có match hay không.

- Nếu rule match, app tiếp tục áp dụng outcome storefront hiện có của rule đó.
- Nếu rule không match, app tiếp tục dùng fallback hiện có của rule engine hoặc rule khác nếu có.
- `V1` không cần giải thích buyer-facing về lý do match hoặc không match theo metafield.

### 3.6 Delivery cut line for 30 hours

Nếu estimate chi tiết vượt `30 giờ`, phải cắt các phần dưới đây trước:

- Search hoặc sort nâng cao trong metafield dropdown
- Empty state quá chi tiết ngoài message cơ bản
- UI polish ngoài mức cần thiết để setup được
- Extra logging ngoài mức tối thiểu phục vụ debug cơ bản

Không được cắt các phần cốt lõi sau:

- `Product metafield`
- `Variant metafield`
- Chỉ hiển thị supported metafields
- Runtime evaluate theo `equals`
- Quy tắc `missing/null/empty => no match`
- Không thêm storefront UI mới

### 3.7 Assumptions and clarification

- Dòng AC gốc `Filter theo metafield của Customer` được xem là chưa đúng scope.
- Scope chính xác của task này là `Product metafield` và `Variant metafield`.
- Tài liệu này dùng cụm `BSS B2B Request a Quote, Quick` ở level app, nhưng feature đang nằm ở `Quote Rule`, không phải một buyer-facing Quick Order filter mới.

### 3.8 What can be done next

Sau khi `v1` ổn định, phase tiếp theo có thể mở theo thứ tự:

1. Thêm operator cho `Number`:
   - `greater than`
   - `less than`
   - `between`
2. Hỗ trợ thêm các type đơn giản:
   - `text`
   - `date`
3. Mở rộng sang `Customer metafield`
4. Thêm admin preview hoặc debug summary cho rule matching
5. Cân nhắc buyer-facing explanation hoặc logging chi tiết hơn nếu support volume tăng

## 4. Acceptance Criteria

### Acceptance Criteria 1. Metafield filter is available in Quote Rule setup

- Merchant có thể chọn `Metafield` khi tạo hoặc chỉnh sửa `Quote Rule` filter.
- Merchant có thể chọn `Product metafield` hoặc `Variant metafield`.

### Acceptance Criteria 2. Only supported metafields are selectable

- Dropdown chỉ hiển thị metafield thuộc type được hỗ trợ trong `v1`.
- Metafield không thuộc type được hỗ trợ không xuất hiện trong setup.

### Acceptance Criteria 3. Operator behavior is constrained to equals

- `Number`, `Boolean`, và `Single select` đều dùng operator `equals`.
- Với `Boolean`, UI có thể hiển thị `True / False`, nhưng logic lưu và evaluate vẫn là `equals`.

### Acceptance Criteria 4. Runtime matching follows current metafield value

- Rule evaluate theo giá trị metafield hiện tại tại thời điểm customer gửi quote.
- Nếu metafield không tồn tại, `null`, hoặc empty thì rule không match.

### Acceptance Criteria 5. Storefront UI does not expand in v1

- Storefront không có filter UI mới dành cho buyer.
- Buyer chỉ thấy outcome hiện có của Quote Rule match hoặc không match.

## 5. Delivery estimate

| Work item | Estimate |
| --- | --- |
| Load supported metafields + admin setup UI | 10h |
| Runtime evaluation for product and variant metafields | 10h |
| Validation, empty state, and regression testing | 6h |
| Buffer for bug fixing and review feedback | 4h |
| **Total** | **30h** |

## 6. PRD review summary

### Dev lens findings

- Scope này khả thi trong `30 giờ` nếu reuse rule builder và rule runtime hiện có.
- Rủi ro kỹ thuật lớn nhất là map đúng `Single select` về một tập option xác định sẵn; không nên suy diễn từ text tự do.
- Không nên thêm operator khác trong cùng task vì sẽ kéo theo validation, UI, và test matrix lớn hơn.

### UX lens findings

- Merchant dễ nhầm nếu dropdown chỉ hiện tên metafield mà không có `namespace.key` và `type`.
- Không thêm storefront UI mới là hợp lý vì buyer không cần hiểu metafield filter để hoàn tất RFQ.
- Empty state chỉ cần đủ rõ để merchant hiểu store hiện chưa có metafield phù hợp.

### Executive lens findings

- Feature này có giá trị thực dụng vì tăng tính linh hoạt cho Quote Rule mà chưa kéo app sang một wholesale rules platform lớn hơn.
- ROI vẫn hợp lý nếu khóa chặt `v1` như tài liệu này và không nhận thêm scope ngoài `Product/Variant metafield + equals`.

### Consolidated recommendation

Go với `v1` nếu team chốt 4 nguyên tắc:

1. Không có `Customer metafield`
2. Không có storefront filter UI mới
3. Chỉ có `equals`
4. Chỉ support `Number`, `Boolean`, `Single select`

## 7. Jira breakdown

### Epic

**Improve: Add metafield-based matching to Quote Rules**

Mở rộng Quote Rule để merchant có thể match rule theo `Product metafield` hoặc `Variant metafield` của store. Epic này chỉ bao gồm một `v1` hẹp, không mở rộng sang customer metafield, operator nâng cao, hoặc buyer-facing storefront filter mới.

### Stories

**New: Add Metafield filter type to Quote Rule setup**

Cho merchant chọn `Metafield` như một filter type mới trong Quote Rule, đồng thời chỉ hiển thị các metafield definition hợp lệ theo scope `v1`. Story này bao gồm source selector, operator `equals`, input theo type, và empty state cơ bản.

**New: Evaluate Quote Rules by product and variant metafields**

Bổ sung runtime logic để Quote Rule match theo giá trị `Product metafield` hoặc `Variant metafield` tại thời điểm customer gửi quote. Story này phải áp dụng quy tắc `missing/null/empty => no match` và reuse item context hiện có.

**Test: Test metafield filter behavior for Quote Rule v1**

Kiểm thử luồng setup và runtime matching của metafield filter trên các type được hỗ trợ, đồng thời xác nhận storefront không phát sinh UI mới ngoài hành vi match hiện tại của rule engine.

### Tasks

**New: Load supported metafield definitions in rule builder**

Load danh sách metafield definitions từ store, lọc theo owner type và supported type của `v1`, rồi hiển thị thành option trong Quote Rule setup.

**New: Render value input by metafield type**

Render input phù hợp cho `Number`, `Boolean`, và `Single select`, đồng thời khóa operator ở mức `equals`.

**New: Evaluate metafield filter in Quote Rule runtime**

Thêm logic đọc giá trị metafield từ product hoặc variant context tại thời điểm submit quote, sau đó so sánh theo `equals` và trả về `no match` cho các trường hợp thiếu dữ liệu.

**Test: Verify supported and unsupported metafield scenarios**

Test các case chính gồm:

- supported vs unsupported type
- product vs variant source
- `true` vs `false`
- number exact match vs not match
- single select exact match vs not match
- missing / null / empty
- storefront giữ nguyên UI hiện tại
