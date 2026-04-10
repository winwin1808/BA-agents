# RQM - BOGO Expansion for BSS B2B Wholesale Solution

**Date:** 2026-04-08  
**App:** BSS B2B Wholesale Solution  
**Module:** Buy One Get One  
**Document type:** Implementation-ready RQM  
**Status:** Draft for PM/UX/Dev review

## Kết luận / đề xuất chính

Đề xuất gộp toàn bộ yêu cầu thành một initiative `Improve: Expand BOGO rule engine and admin setup for wholesale operations` thay vì tách 8-9 ticket rời. Lý do là các hạng mục này dùng chung 4 lớp phụ thuộc:

1. Data model của rule BOGO
2. Rule evaluation engine
3. Admin editor UX
4. Manual Order / Import Export / Public API parity

Định hướng sản phẩm nên là:

- Giữ BOGO là một phần của `wholesale operating system`, không phải promo widget đơn lẻ.
- Reuse pattern Solution đã có ở Price List, Volume Pricing và Manual Orders: step-by-step setup, clearer wording, background import/export, Public API governance, và parity giữa storefront với admin operations.
- Tách rõ `qualification`, `reward behavior`, `order caps`, `fallback`, `manual order`, `preview`, `bulk management` để giảm lỗi setup gây thất thoát doanh thu.
- Với `alternative reward item`, nên thiết kế data model ngay từ đầu nhưng phát hành theo pha:
  - Phase 1: `Do not apply reward and show message`, `Keep rule matched but skip reward`
  - Phase 2/Beta: `Use alternative reward item`

## 1. Purpose

### Business problem

BOGO hiện đã tồn tại trong Solution nhưng editor và engine còn thiếu nhiều capability cần thiết cho wholesale merchants:

- Buyer nhiều khi không biết phải tự thêm reward item nên rule match nhưng conversion không xảy ra.
- Merchant dễ nhầm giữa số lần rule được apply và tổng số reward unit được discount, dẫn tới setup sai và mất tiền.
- BOGO chưa có parity đủ tốt với Manual Orders trong khi đây là workflow vận hành cốt lõi của Solution.
- Buy/Get scope còn thiếu variant-level và exclusion logic nên chưa đủ chính xác cho catalog B2B phức tạp.
- Wholesale merchants có nhu cầu mix-and-match theo nhóm SKU rất phổ biến.
- Reward item invalid hoặc out of stock tạo trải nghiệm fail không rõ ràng.
- Thiếu Import/Export và Public API khiến BOGO khó scale với merchant có catalog lớn hoặc automation needs.

### Why now

BOGO hiện là một module đã ship trong Solution, nhưng changelog và app context cho thấy Solution đang đi theo hướng:

- Rebuilt rule editors với wording rõ hơn
- Manual Orders ngày càng parity tốt hơn với các pricing modules
- Import/Export background processing là pattern chuẩn
- Variant scope / exclusions / Public API đang mở rộng ở nhiều module khác

Vì vậy, mở rộng BOGO lúc này phù hợp với quỹ đạo của sản phẩm hơn là giữ nó như module “legacy”.

## 2. Goals

### Primary goals

1. Giảm tỷ lệ rule BOGO được setup sai hoặc apply sai.
2. Tăng tỷ lệ reward actually redeemed khi merchant dùng BOGO trong wholesale flow.
3. Đưa BOGO lên cùng mức operational maturity với các pricing modules khác trong Solution.

### Success metrics

- Giảm ít nhất `30%` ticket liên quan đến BOGO setup ambiguity trong `90 ngày` sau launch.
- Tăng ít nhất `20%` tỷ lệ order đủ điều kiện BOGO nhưng cũng nhận được reward hợp lệ trong `90 ngày`.
- Đạt `>= 80%` parity của BOGO giữa storefront và Manual Orders trong release đầu.
- Đạt `>= 95%` import job completion success cho file hợp lệ.
- Đạt `>= 99%` API validation success cho payload hợp lệ theo schema mới.

## 3. Delivery

### 3.1 Scope

#### In scope

- Rule editor refresh cho BOGO
- BOGO Preview
- Auto-Add Reward Item
- Separate `Rule uses per order` và `Reward units per order`
- Manual Order parity
- Variant scope và exclusions cho `Customer buys` và `Customer gets`
- Mix-and-match buy condition
- Inventory fallback policy
- Import/Export
- Public API

#### Out of scope

- Buyer-facing marketing widgets mới ngoài những message cần thiết để explain reward state
- Analytics dashboard chuyên biệt cho BOGO campaign ROI
- AI/automatic recommendation cho alternative reward item
- Shopify-native discount engine replacement
- Cross-module conflict resolver tổng quát cho toàn app

### 3.2 Product principles

1. `Safety first`: ưu tiên tránh setup sai gây discount quá mức hoặc reward apply không mong muốn.
2. `Operational parity`: logic storefront và Manual Orders phải dùng cùng một evaluation model.
3. `Progressive disclosure`: merchant cơ bản nhìn thấy flow đơn giản; logic nâng cao nằm trong Advanced cards có helper text rõ ràng.
4. `Preview before publish`: merchant phải nhìn thấy rule sẽ apply thế nào trước khi save.
5. `Bulk-ready`: mọi field mới phải được cân nhắc cho Import/Export và Public API ngay từ đầu.

### 3.3 Core UX decision

Giữ layout card-based embedded admin như UI hiện tại, nhưng tổ chức lại thành 3 vùng lớn:

1. `General`
2. `Qualification and Reward`
3. `Safeguards and Operations`

Trong đó:

- `General` chứa Name, Priority, Status, Customers, Schedule.
- `Qualification and Reward` chứa Customer buys, Mix-and-match, Customer gets, Auto-add, Preview.
- `Safeguards and Operations` chứa Order caps, Manual Order behavior, Inventory fallback, Import/Export entry point, API mapping note.

Thay đổi lớn nhất về UX là không để `Advanced Settings` chỉ còn một checkbox như hiện tại; thay vào đó phải có các card rõ nghĩa:

- `Order caps`
- `Reward application`
- `Manual orders`
- `Reward availability fallback`

## 4. Functional requirements

### Requirement 1. BOGO Preview

Hệ thống phải cung cấp một khối `BOGO Preview` ngay trên trang create/edit rule để merchant mô phỏng kết quả apply rule trước khi lưu hoặc publish.

#### Detail

- Preview chỉ active khi các trường bắt buộc đã hợp lệ tối thiểu.
- Merchant có thể chọn context preview:
  - `Storefront`
  - `Manual Order`
- Merchant có thể nhập sample cart:
  - Customer identity / segment
  - Buy items và quantity
  - Reward item đã có sẵn trong cart hay chưa
- Preview trả về:
  - Rule matched hay không
  - Số qualifying sets
  - Reward units được cấp
  - Reward item nào được apply
  - Fallback policy nào được kích hoạt nếu reward invalid
  - Lý do không apply nếu fail

#### UI notes

- Dùng card riêng với summary box ở trên và mini line-item simulator ở dưới.
- Summary phải có formula-style text, ví dụ: `3 qualifying sets -> 2 reward units applied`.
- Nếu preview đang bị chặn vì rule chưa hoàn chỉnh, hiển thị checklist trường còn thiếu thay vì chỉ disable.

### Requirement 2. Auto-Add Reward Item

Hệ thống phải cho merchant chọn cách reward được nhận: buyer tự thêm reward item hoặc hệ thống tự động add reward item khi rule đủ điều kiện.

#### Detail

- Thêm field `Reward application mode`:
  - `Customer adds reward manually`
  - `Auto-add reward item`
- Nếu chọn `Auto-add reward item`, hệ thống phải:
  - Tự thêm reward line vào cart hoặc manual order khi rule match
  - Tôn trọng inventory fallback policy
  - Không add vượt `Reward units per order`
- Nếu reward scope có nhiều candidate, merchant phải xác định `Reward priority order`.
- Nếu merchant chưa xác định được reward priority khi có nhiều reward candidates, rule không được save ở trạng thái `Enable`.

#### UI notes

- Đặt block này ngay dưới `Customer gets`.
- Khi bật auto-add, hiển thị sub-settings:
  - `Reward priority`
  - `If reward already exists in cart`
    - `Increase quantity`
    - `Keep current line and add discount only`
- Thêm helper text nhấn mạnh đây là tính năng giúp buyer không bỏ lỡ reward.

### Requirement 3. BOGO Max Rewards Per Order

Hệ thống phải tách riêng hai khái niệm giới hạn order để merchant không nhầm logic discount.

#### Detail

- Thay field hiện tại bằng 2 field độc lập:
  - `Rule uses per order`
  - `Reward units per order`
- Engine tính reward cuối cùng theo công thức:
  - `qualified reward quantity`
  - giới hạn bởi `Rule uses per order`
  - giới hạn bởi `Reward units per order`
  - lấy giá trị nhỏ nhất làm kết quả cuối
- Nếu merchant chỉ nhập một field:
  - field còn lại mặc định là `Unlimited`
- Nếu merchant nhập cả hai field, preview phải hiển thị rõ rule bị cap bởi field nào.

#### UI notes

- Đưa 2 field này vào card `Order caps`.
- Mỗi field cần helper text và example:
  - `Rule uses per order`: số lần rule được kích hoạt
  - `Reward units per order`: tổng số unit reward được discount
- Hiển thị inline explanation nếu merchant nhập cấu hình dễ gây hiểu nhầm, ví dụ reward units nhỏ hơn reward quantity mỗi lần apply.

### Requirement 4. BOGO Parity for Manual Order

Hệ thống phải cho phép Manual Orders evaluate và apply BOGO theo cùng logic lõi với storefront.

#### Detail

- Khi merchant tạo hoặc sửa Manual Order trong Solution, BOGO engine phải:
  - evaluate eligibility theo customer, products, variants, exclusions, dates, status
  - apply reward theo reward mode và caps
  - áp dụng fallback nếu reward invalid
- Manual Order UI phải hiển thị:
  - rule matched banner
  - applied reward line
  - skipped reward reason nếu fallback chọn skip
  - link để xem detail rule
- Merchant không được phép manually force một reward trái với rule config, trừ khi họ tắt BOGO application cho order đó bằng override có audit log.

#### UI notes

- Trong Manual Order builder, thêm panel `Applied BOGO`.
- Nếu có conflict với Price List / Custom Pricing / tax / shipping logic, system phải show resolution summary thay vì im lặng.

### Requirement 5. BOGO Add Variant Scope and Exclusions

Hệ thống phải hỗ trợ variant-level scope và exclusion cho cả phần `Customer buys` và `Customer gets`.

#### Detail

- `Customer buys` phải hỗ trợ scope type:
  - All products
  - Specific products
  - Specific variants
  - Collections
  - Product tags
- `Customer buys` phải hỗ trợ exclusions:
  - Exclude products
  - Exclude variants
- `Customer gets` phải hỗ trợ scope type và exclusions tương tự.
- Nếu một variant thuộc cả include và exclude, `exclude` phải thắng.
- Search selector phải hỗ trợ title, SKU, barcode, variant ID.

#### UI notes

- Mỗi khối `Customer buys` và `Customer gets` có thêm tab phụ:
  - `Include`
  - `Exclude`
- Nếu merchant chọn `Specific products`, UI nên cho expand để chọn cụ thể variant bên dưới nếu muốn refine.
- Badge nhỏ hiển thị số include và exclude items đã chọn để tránh bỏ sót.

### Requirement 6. BOGO Support Mix-and-Match Buy Condition

Hệ thống phải hỗ trợ hai kiểu tính threshold cho buy condition khi merchant chọn nhiều SKU trong cùng một nhóm.

#### Detail

- Thêm field `Buy quantity aggregation` hoặc `Buy threshold aggregation`:
  - `Any selected item must meet the threshold individually`
  - `Combine all selected items to meet the threshold`
- Logic này áp dụng cho:
  - minimum quantity
  - minimum purchase amount
- Với `individually`, mỗi SKU hoặc variant phải tự đạt threshold để tạo qualifying set.
- Với `combine all`, hệ thống cộng quantity hoặc amount của toàn bộ buy scope hợp lệ để xét threshold.

#### UI notes

- Đặt field này ngay dưới phần chọn buy scope.
- Thêm example text động theo cấu hình hiện tại, ví dụ:
  - `Combine quantities of all selected items`
  - `Each selected variant must reach the quantity on its own`

### Requirement 7. BOGO Inventory Fallback for Reward Item

Hệ thống phải định nghĩa rõ hành vi khi reward item không thể cấp hợp lệ tại thời điểm apply.

#### Detail

- Reward được xem là invalid nếu:
  - variant không còn tồn tại
  - product hoặc variant không published trong context cần thiết
  - variant out of stock và không cho oversell
  - reward không còn hợp lệ với customer context / market / segment
- Thêm field `Reward availability fallback`:
  - `Do not apply reward and show message`
  - `Keep rule matched but skip reward`
  - `Use alternative reward item`
- Với `Do not apply reward and show message`:
  - storefront hiển thị message rõ lý do
  - manual order hiển thị warning banner
- Với `Keep rule matched but skip reward`:
  - rule vẫn được tính là matched trong preview/log
  - không tạo reward line
- Với `Use alternative reward item`:
  - merchant định nghĩa danh sách reward fallback theo thứ tự ưu tiên
  - system chọn item đầu tiên hợp lệ

#### Release recommendation

- GA ở release đầu cho 2 mode đầu tiên
- `Use alternative reward item` phát hành dưới `Beta` hoặc phase sau, nhưng schema và UI placeholder nên được chuẩn bị từ đầu

#### UI notes

- Dùng card `Reward availability fallback`.
- Nếu chọn alternative reward, show nested selector list + drag reorder.
- Hiển thị warning màu vàng nếu fallback policy có thể tạo khác biệt giữa merchant expectation và buyer expectation.

### Requirement 8. BOGO Import and Export

Hệ thống phải hỗ trợ Import/Export cho BOGO rules theo pattern bulk management của Solution.

#### Detail

- Thêm `Import` và `Export` trong BOGO module configuration hoặc rule list page.
- Import phải chạy background job.
- Hệ thống phải:
  - validate schema trước khi queue
  - thông báo khi job hoàn tất
  - cung cấp error file rõ dòng lỗi và lý do
- Export phải cho phép:
  - export selected rules
  - export all filtered rules
- Template phải cover toàn bộ field mới quan trọng:
  - general info
  - customer target
  - buy scope / exclusions / aggregation
  - get scope / exclusions
  - reward mode
  - auto-add
  - order caps
  - manual order
  - fallback policy
  - schedule

#### Recommended data rule

- V1 có thể dùng file import theo format CSV chuẩn hóa.
- Các list ID nhiều phần tử được phân tách bằng delimiter thống nhất.
- Nếu dev đánh giá CSV không đủ an toàn cho nested fallback rewards, cần tách thành:
  - `rules.csv`
  - `rule_items.csv`

#### UI notes

- Không đặt full import form trong editor page.
- Editor chỉ nên có link `Manage import and export`.
- Rule list page cần có trạng thái `Last import`, `Last export`, `Job status`.

### Requirement 9. BOGO Public API

Hệ thống phải mở Public API cho BOGO để merchant và đối tác có thể quản trị rule ở quy mô lớn.

#### Detail

- API V1 cần hỗ trợ tối thiểu:
  - List rules
  - Get rule detail
  - Create rule
  - Update rule
  - Delete rule
  - Enable or disable rule
- Payload phải support các field mới:
  - buy and get scope ở product và variant level
  - exclusions
  - mix-and-match aggregation
  - reward application mode
  - rule uses per order
  - reward units per order
  - manual order flag
  - reward fallback mode
  - alternative reward list nếu bật beta
- API phải reuse Public API governance hiện có:
  - authenticated key
  - request history
  - rate limit
  - validation error detail

#### UI notes

- Trong BOGO editor không cần cấu hình API.
- Chỉ cần note `This rule can be managed via Public API after save`.
- App Integration / Public API section cần update docs và payload examples cho BOGO.

## 5. Non-functional requirements

### Requirement 10. Rule evaluation consistency

Engine BOGO phải dùng chung evaluation model cho storefront preview, actual storefront apply, Manual Orders, Import validation preview và Public API validation để tránh lệch logic giữa các surfaces.

### Requirement 11. Performance and resilience

- Preview response nên hoàn thành trong dưới `2 giây` với rule cấu hình phổ biến.
- Rule evaluation không được làm chậm đáng kể cart processing khi merchant có nhiều rule active.
- Import jobs phải retry an toàn khi queue lỗi tạm thời.

### Requirement 12. Auditability

Hệ thống phải log tối thiểu:

- ai tạo/sửa rule
- khi nào rule enable/disable
- preview errors phổ biến
- reward skipped do fallback
- manual order override nếu có
- import/export job result
- Public API request history cho BOGO endpoints

## 6. Data and reporting requirements

### Data model additions

- `reward_application_mode`
- `reward_priority`
- `rule_uses_per_order`
- `reward_units_per_order`
- `manual_order_enabled`
- `buy_aggregation_mode`
- `buy_scope_variant_ids`
- `buy_excluded_product_ids`
- `buy_excluded_variant_ids`
- `get_scope_variant_ids`
- `get_excluded_product_ids`
- `get_excluded_variant_ids`
- `reward_fallback_mode`
- `alternative_reward_ids`

### Suggested operational reports

- Number of matched rules vs successfully rewarded orders
- Number of skipped rewards by fallback reason
- Number of manual orders with BOGO applied
- Import failure reasons by field
- API validation failures by field

## 7. Dependencies and rollout sequence

### Recommended delivery order

1. Data model + rule engine refactor
2. Rule editor refresh + Preview + split caps
3. Variant scope/exclusions + Mix-and-match
4. Manual Order parity
5. Auto-add reward + basic fallback modes
6. Import/Export
7. Public API
8. Alternative reward item beta

### Key dependencies

- Shared product and variant selector
- Manual Order apply pipeline
- Public API schema versioning
- Background job framework for Import/Export
- Rule conflict handling with Price List / Custom Pricing

## 8. Acceptance criteria

### Acceptance Criteria 1. Preview accuracy

- Với một rule hợp lệ, merchant có thể preview ở cả `Storefront` và `Manual Order`.
- Preview phải hiển thị đúng matched state, reward count, cap applied và fallback reason.
- Nếu thiếu field bắt buộc, preview phải chỉ rõ field nào thiếu.

### Acceptance Criteria 2. Auto-add reward

- Khi `Auto-add reward item` bật và rule đủ điều kiện, reward line được thêm tự động.
- Reward line không vượt `Reward units per order`.
- Nếu reward invalid, hành vi phải theo fallback policy đã chọn.

### Acceptance Criteria 3. Split caps

- Merchant có thể set riêng `Rule uses per order` và `Reward units per order`.
- Preview và actual apply phải trả cùng kết quả khi cùng input.
- Không còn dùng chung một field gây mơ hồ như hiện tại.

### Acceptance Criteria 4. Manual Order parity

- Manual Order evaluate BOGO theo đúng customer scope, buy/get scope, exclusions, schedule và caps.
- Merchant nhìn thấy applied reward hoặc skipped reason ngay trong order builder.

### Acceptance Criteria 5. Variant scope and exclusions

- Merchant có thể include và exclude variant ở cả `Customer buys` và `Customer gets`.
- Nếu cùng một item nằm ở include và exclude, exclude luôn thắng.

### Acceptance Criteria 6. Mix-and-match

- Merchant có thể chọn `individually` hoặc `combine all`.
- Rule engine phải phản ánh đúng mode đã chọn cho cả quantity và amount threshold.

### Acceptance Criteria 7. Fallback behavior

- Reward invalid phải không tạo trạng thái fail mơ hồ.
- Message hoặc skipped state phải rõ ràng ở storefront preview và Manual Order.

### Acceptance Criteria 8. Import/Export

- Merchant có thể import và export BOGO rules với background processing.
- Hệ thống trả error file rõ ràng cho file sai schema hoặc item invalid.

### Acceptance Criteria 9. Public API

- API có thể CRUD BOGO rules với schema hợp lệ.
- Validation errors trả về field-level detail.
- API history ghi nhận request tương tự các Public API khác.

## 9. UX/UI notes

### Editor information architecture

#### Section A. General

- Name
- Priority
- Status
- Apply to customers
- Start/End date

#### Section B. Qualification and Reward

- Customer buys
- Buy aggregation
- Customer gets
- Reward application mode
- BOGO Preview

#### Section C. Safeguards and Operations

- Order caps
- Manual orders
- Reward availability fallback
- Links to Import/Export and API docs

### Specific UI changes against current screen

1. Đổi `Advanced Settings` từ một checkbox thành một section riêng có nhiều sub-cards.
2. Thêm `Preview` card trước phần Save để merchant tự kiểm tra.
3. `Customer buys` và `Customer gets` phải có `Include` và `Exclude`.
4. Thêm inline warning khi cấu hình có thể gây mất tiền:
   - reward units quá cao
   - auto-add bật nhưng reward priority chưa rõ
   - fallback policy có thể skip reward
5. Dùng summary panel hoặc sticky footer để hiển thị:
   - rule status
   - number of selected items
   - cap summary
   - manual order enabled

### Reference UI

- Demo preview: https://demo-kzmjvosupjmk1icv6ibo.vusercontent.net?__v0_token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..l79kfvslH1XFFLTo.Unxwp6YtpVTWWWyMpJ2pjjUiXMjuXAD-K8tKSdSgf5RZy8aabMdB6jYAiooarf9rLlrdBXJyL5UNRnDSLHxPcLObeiYLMlfSoaiF0Z0RVD9BC74NPzVPWP1vPNf67F9Yzrp95J7Dp1kuJZa7Y-eVcXj0aF_97rg-XkGBTCL94jqMa7aikV37PohIN3dDWYtUzK8OD_lREhK7A9hL3ZrYS7mt9yP9dPSx60dlYS8eQ4kOQlZlbU3e0ufNfZ2xKFmszIXbLEbfCijCVw.nnaw-xZ8JDXFdlgNf8cHUw
- Editable chat: https://v0.app/chat/rLiSFzVj1BQ

## 10. Risks, mitigations, open questions

### Risks

1. BOGO có thể conflict ngầm với Price List hoặc Custom Pricing nếu reward item cũng chịu pricing rules khác.
2. Auto-add reward với nhiều reward candidates dễ gây merchant surprise nếu priority không rõ.
3. Alternative reward item có rủi ro công bằng giá và khó debug.
4. Import schema có thể quá phức tạp nếu cố nhồi toàn bộ nested scope vào một CSV row.

### Mitigations

1. Reuse shared evaluation order và show conflict summary trong preview.
2. Bắt buộc reward priority khi bật auto-add.
3. Ship alternative reward dưới beta sau khi có log từ 2 fallback mode cơ bản.
4. Cho phép tech spike để chốt CSV một file hay multi-file.

### Open questions

1. Khi auto-add reward và cart đã có reward item với price khác, hệ thống nên merge line hay chỉ apply discount vào line sẵn có?
2. `Keep rule matched but skip reward` có nên ghi nhận vào merchant-facing analytics không?
3. Với `combine all`, engine có cho phép mixed product + mixed variant scope trong cùng rule hay không?
4. Public API V1 có cần endpoint preview/validate riêng trước khi create/update không?

## 11. PRD Review Summary

### Dev lens findings

- Nên làm data model và engine trước, nếu làm UI trước sẽ dẫn tới patch logic nhiều lần.
- Import/Export và API chỉ nên bắt đầu sau khi schema field mới đã ổn định.
- Alternative reward item có complexity cao hơn 2 fallback mode còn lại.

### UX lens findings

- UI hiện tại chưa đủ để merchant hiểu các guardrail quan trọng.
- Preview là bắt buộc để giảm lỗi setup và tăng discoverability.
- Split `Order caps` khỏi `Advanced Settings` sẽ giảm ambiguity rõ rệt.

### Executive lens findings

- Đây là expansion hợp lý vì tận dụng pattern sẵn có của Solution và tăng maturity cho module cũ.
- Tác động doanh thu gián tiếp đến từ tăng attach rate và giảm revenue leakage do setup sai.
- Nên release theo pha để tránh scope quá nặng.

### Consolidated recommendation

Approve initiative theo `2 phases`:

- `Phase 1`: Preview, split caps, variant scope/exclusions, mix-and-match, manual order parity, basic fallback modes
- `Phase 2`: auto-add optimization improvements, import/export, Public API, alternative reward beta

## 12. Jira Breakdown

### Epic

**Improve: Expand BOGO rule management for wholesale operations**

Mở rộng module Buy One Get One để đạt mức vận hành tương đương các pricing modules khác trong Solution, bao gồm editor rõ ràng hơn, preview, manual order parity, guardrails chống setup sai, cùng khả năng bulk management và API cho merchant quy mô lớn.

### Stories

**Improve: Rebuild BOGO rule editor with safer setup structure**

Thiết kế lại trang create/edit rule theo các nhóm thông tin rõ ràng hơn, tách qualification, reward, guardrails và operations để merchant dễ cấu hình và ít nhầm lẫn hơn.

**New: Add BOGO preview and reward guardrails**

Bổ sung preview mô phỏng hành vi rule, tách cap theo rule uses và reward units, đồng thời thêm warning cho các cấu hình có nguy cơ gây discount sai.

**New: Support variant scope, exclusions, and mix-and-match for BOGO**

Mở rộng khả năng áp rule theo variant và exclusion logic cho cả buy/get, đồng thời hỗ trợ gộp nhiều SKU để xét threshold theo nhu cầu wholesale phổ biến.

**Improve: Apply BOGO consistently in Manual Orders**

Đảm bảo Manual Orders dùng cùng logic evaluate và apply BOGO như storefront, có hiển thị trạng thái apply hoặc skipped reason rõ ràng.

**New: Add BOGO bulk management with Import and Export**

Cho phép merchant import/export BOGO rules theo background job, có template, validation và error file để scale cấu hình số lượng lớn.

**New: Expose BOGO configuration through Public API**

Mở schema và endpoints Public API cho BOGO để merchant và đối tác có thể quản lý rule theo automation hoặc hệ thống ngoài.

### Tasks

**Tech: Refactor BOGO rule schema for reward caps and fallback modes**

Chuẩn hóa schema cho `rule_uses_per_order`, `reward_units_per_order`, `reward_application_mode`, `buy_aggregation_mode`, `reward_fallback_mode` và các field variant/exclusion mới.

**Tech: Unify BOGO evaluation across storefront preview and Manual Orders**

Trích xuất logic lõi để các surface dùng chung một evaluation service, giảm risk lệch logic giữa preview, storefront và Manual Orders.

**New: Build BOGO preview panel in rule editor**

Tạo UI preview cùng input giả lập order context và summary matched result để merchant kiểm tra rule trước khi save.

**New: Add auto-add reward configuration and priority handling**

Bổ sung setting auto-add reward, logic priority khi có nhiều reward candidates và validation trước khi enable rule.

**New: Add include and exclude selectors for buy and get scopes**

Mở rộng selector theo product, variant, collection, tag; đồng thời thêm exclude tabs và badge đếm item đã chọn.

**New: Add mix-and-match aggregation mode**

Cho phép merchant chọn giữa threshold theo từng item riêng lẻ hoặc gộp toàn bộ item hợp lệ.

**Improve: Show BOGO apply summary in Manual Order builder**

Hiển thị applied reward, skipped reason, rule link và conflict summary ngay trong giao diện Manual Order.

**Tech: Build BOGO import and export job pipeline**

Tạo template, validator, background job, notification và error file cho BOGO bulk management.

**Tech: Add BOGO Public API endpoints and schema validation**

Mở CRUD endpoints, request validation, history logging và tài liệu payload cho BOGO.

**Doc: Update BOGO help and API documentation**

Cập nhật merchant-facing docs, internal CS notes và Public API examples theo wording mới.

## 13. Source notes

Các quyết định trong RQM này bám vào direction và wording hiện có của Solution:

- Solution app context nhấn mạnh pricing governance, manual orders, import/export và Public API là capability cốt lõi.
- Changelog xác nhận BOGO đã tồn tại từ `v7.0.0`.
- Changelog xác nhận Manual Orders đã lần lượt parity với `Custom Pricing`, `Price List`, `Volume Pricing`.
- Changelog xác nhận `Price List`, `Volume Pricing` đã có pattern `rebuild editor`, `background import/export`, `specific variants`, `exclude variants/products`, `Public API`.
