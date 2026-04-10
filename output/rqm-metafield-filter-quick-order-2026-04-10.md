# RQM - Metafield Filter for Quick Order in BSS B2B Request a Quote, Quick

**Date:** 2026-04-10  
**App:** BSS B2B Request a Quote, Quick  
**Module:** Quick Order  
**Affected surfaces:** Admin filter setup, Quick Order storefront page  
**Document type:** Implementation-ready RQM  
**Status:** Draft for PM/Dev review

**Shopify references checked before drafting**

- [Metafield content types and values](https://help.shopify.com/en/manual/custom-data/metafields/metafield-definitions/metafield-types)
- [Adding values to metafields](https://help.shopify.com/en/manual/custom-data/metafields/adding-values-to-metafields)
- [Metafield Definition](https://shopify.dev/docs/api/admin-graphql/latest/objects/MetafieldDefinition)
- [Metafield limits](https://shopify.dev/docs/apps/build/metafields/metafield-limits)

## 1. Mục đích

Quick Order hiện đã có các filter cơ bản, nhưng chưa cho merchant tạo filter theo metafield riêng của store. Điều này làm Quick Order thiếu tính linh hoạt khi merchant muốn buyer lọc product hoặc variant theo dữ liệu catalog tùy biến.

Feature này cần làm vì:

- Merchant cần thêm nhiều loại filter hơn ngoài các filter cơ bản để buyer tìm sản phẩm nhanh hơn trên Quick Order page.
- Metafield là nguồn dữ liệu phù hợp để merchant tự cấu hình filter theo cách tổ chức catalog của store.
- Nếu không khóa scope từ đầu, task này rất dễ nở sang text parsing, range logic, list logic nhiều tầng, hoặc support toàn bộ metafield types gây rủi ro performance và UX.

## 2. Mục tiêu

`V1` của feature này chỉ làm các phần sau:

- Cho merchant chọn `Metafield` khi tạo filter mới cho Quick Order
- Cho merchant chọn source:
  - `Product metafield`
  - `Variant metafield`
- Chỉ hỗ trợ **single-value metafield definitions**
- Chỉ hỗ trợ 4 loại metafield sau:
  - `choice_list_single_line_text`
  - `single_line_text`
  - `integer`
  - `boolean`
- Dùng UI `checkbox-based selection` cho toàn bộ loại được support
- Buyer dùng các filter này ngay trên Quick Order page để lọc danh sách product hoặc variant
- Nếu item không có metafield, metafield `null`, empty, hoặc không đúng selected values thì item đó không được tính là matched result khi filter đang active

## 3. Triển khai

### Requirement 1. Support only single-value metafield definitions

Hệ thống chỉ support metafield definition dạng single value trong `v1`.

- Nếu Shopify definition bật `Accept list of values` thì definition đó không được hiển thị trong admin setup.
- Requirement này áp dụng cho tất cả loại support trong tài liệu này.
- Mục tiêu là giữ logic filter đơn giản: mỗi product hoặc variant chỉ có một actual value để compare.

### Requirement 2. Support only 4 metafield buckets

Hệ thống chỉ support 4 support buckets sau:

| Support bucket | Shopify basis | Storefront UI |
| --- | --- | --- |
| `choice_list_single_line_text` | `Single line text` có preset choices | Checkbox list |
| `single_line_text` | `Single line text` không có preset choices | Checkbox list |
| `integer` | `Integer` | Checkbox list |
| `boolean` | `True or false` | Single checkbox option |

Ghi chú:

- Các tên trên là support buckets của app, không phải raw type name hiển thị nguyên bản từ Shopify.
- `boolean` trong `v1` chỉ support behavior `is true`.

### Requirement 3. Add Metafield filter type in Quick Order filter setup

Hệ thống phải cho merchant chọn `Metafield` khi tạo filter mới trong phần quản lý filter của Quick Order page.

- Sau khi chọn `Metafield`, merchant phải chọn tiếp `Source`:
  - `Product metafield`
  - `Variant metafield`
- Danh sách metafield phải được load từ Shopify store hiện tại.
- Mỗi option nên hiển thị tối thiểu:
  - definition name
  - `namespace.key`
  - source
  - support bucket

### Requirement 4. Allow merchant to name the filter

Khi tạo hoặc sửa một metafield filter cho Quick Order, hệ thống phải cho merchant đặt tên filter.

- `Filter name` là field bắt buộc trong admin setup.
- Merchant có thể nhập tên riêng để buyer nhìn thấy trên storefront.
- Nếu merchant chưa chỉnh tay khi mới chọn metafield, app có thể prefill bằng `definition name`.
- Merchant vẫn có thể sửa lại tên này trước khi lưu.
- Tên filter được dùng làm label hiển thị trên Quick Order page.

Tên filter nên đáp ứng các rule cơ bản sau:

- Không được empty sau khi trim.
- Nên giữ ngắn gọn và dễ hiểu với buyer.
- Không phụ thuộc vào `namespace.key` để hiển thị trực tiếp cho buyer, trừ khi merchant chủ động dùng cách đặt tên đó.

### Requirement 5. Show only supported metafield definitions

Hệ thống chỉ hiển thị definition hợp lệ trong `v1`.

Rule xác định hợp lệ:

- owner type phải thuộc scope `product` hoặc `variant`
- definition phải là single value
- definition phải map được sang một trong 4 support buckets
- definition phải build được option list an toàn nếu bucket cần generate options
- definition không được xung đột với các filter đã có sẵn của app:
  - `Collection`
  - `Tags`
  - `Vendor`
  - `Product Type`

Definition không hợp lệ không được xuất hiện trong dropdown.

### Requirement 6. Use definition choices for choice_list_single_line_text

Với bucket `choice_list_single_line_text`, app phải lấy checkbox options trực tiếp từ preset choices của Shopify definition.

- Giữ raw value của từng choice để dùng cho storefront filtering.
- Merchant có thể publish filter này ra storefront dưới dạng checkbox list.
- Nếu definition không trả về preset choices hợp lệ thì definition đó không support trong `v1`.

### Requirement 7. Build distinct catalog values for single_line_text

Với bucket `single_line_text`, app phải build checkbox options từ distinct current values đang tồn tại trên product hoặc variant tương ứng.

- Chỉ lấy giá trị non-empty sau khi trim.
- Dedupe theo exact value sau khi trim.
- Sắp xếp alphabetical để buyer dễ scan trên storefront.
- Nếu không lấy được distinct values hợp lệ thì definition đó không support trong `v1`.

### Requirement 8. Build distinct catalog values for integer

Với bucket `integer`, app phải build checkbox options từ distinct current integer values đang tồn tại trên product hoặc variant tương ứng.

- Chỉ lấy giá trị parse được thành integer hợp lệ.
- Dedupe theo numeric value.
- Sắp xếp tăng dần.
- Nếu không lấy được distinct integer values hợp lệ thì definition đó không support trong `v1`.

### Requirement 9. Use a single checkbox option for boolean

Với bucket `boolean`, app phải render đúng một checkbox option duy nhất đại diện cho giá trị `true`.

- Checkbox này là cách buyer lọc các item có boolean metafield bằng `true`.
- Merchant không cần cấu hình nhiều option cho bucket này.
- `V1` không support behavior `is false`.
- Raw filter value của bucket này là `true`.

### Requirement 10. Cap option list for generated-value buckets

Hệ thống phải có guardrail cho các bucket cần generate option list từ catalog.

- Áp dụng cho:
  - `single_line_text`
  - `integer`
- Có thể áp dụng thêm cho `choice_list_single_line_text` nếu definition trả về quá nhiều choices.
- Đề xuất `v1` cap tối đa `128` options cho mỗi filter.
- Nếu số option vượt cap, definition đó không xuất hiện trong admin setup.

Mục tiêu là giữ UI scan được, predictable, và không kéo feature sang search/filter builder phức tạp.

### Requirement 11. Render checkbox-based filter on Quick Order page

Sau khi merchant publish một supported metafield filter, storefront Quick Order page phải render filter đó theo dạng checkbox.

- Với `choice_list_single_line_text`, `single_line_text`, và `integer`, buyer có thể chọn một hoặc nhiều checkbox values.
- Với `boolean`, buyer chỉ thấy một checkbox option duy nhất.
- Filter label trên storefront phải lấy từ `Filter name` mà merchant đã lưu.

### Requirement 12. Save filter configuration

Khi merchant lưu filter, hệ thống phải lưu tối thiểu:

- filter name
- source: `product` hoặc `variant`
- definition identifier
- `namespace.key`
- support bucket
- option list dùng để render storefront
- selected logic mode của filter

Ghi chú:

- `selected logic mode` trong `v1` là `match any selected value`.
- Với `boolean`, option list chỉ có một giá trị duy nhất là `true`.

### Requirement 13. Preserve saved options during edit

Khi merchant mở lại filter đã lưu, hệ thống phải render lại đúng option set đã được cấu hình trước đó.

- Với `choice_list_single_line_text`, nếu preset choices thay đổi, hệ thống không được tự động xoá option cũ đã được merchant publish.
- Với `single_line_text` và `integer`, nếu một option cũ không còn xuất hiện trong distinct-value snapshot hiện tại, hệ thống vẫn phải giữ được option cũ để tránh merchant mất cấu hình ngoài ý muốn.
- Filter name đã lưu cũng phải được giữ nguyên khi merchant mở lại filter để edit.

### Requirement 14. Filter Quick Order results by metafield value

Trên Quick Order page, hệ thống phải lọc danh sách product hoặc variant dựa trên metafield filter mà buyer đang chọn.

- Với `Product metafield`, filter áp dụng trên giá trị metafield của product.
- Với `Variant metafield`, filter áp dụng trên giá trị metafield của variant.
- Runtime phải dùng actual metafield value hiện tại của item đang được render hoặc search trong Quick Order dataset.

### Requirement 15. Match by any selected value

Storefront filtering phải dùng logic:

- Item được giữ lại trong kết quả nếu actual metafield value bằng **một trong các** selected checkbox values.
- Không có logic `must match all`.
- Với `boolean`, item được giữ lại khi actual value là `true` và buyer đã tick checkbox đó.

### Requirement 16. Apply strict no-match rules

Khi metafield filter đang active, hệ thống phải coi item là `no match` trong các trường hợp sau:

- Metafield không tồn tại
- Metafield có giá trị `null`
- Metafield là empty string sau khi normalize
- Actual value không nằm trong selected values
- Definition hiện tại không còn đọc được giá trị hợp lệ để compare

### Requirement 17. Keep filter behavior predictable

`V1` không support các behavior sau:

- Free-text search trong metafield filter
- Range filter cho integer
- `is false` cho boolean
- Filter logic nhiều tầng như `AND` trong cùng một metafield filter
- JSON, nested object, hoặc array parsing

Mục tiêu là giữ metafield filter đơn giản, scan được, và đủ rõ với buyer trên Quick Order page.

## 4. AC

### AC 1. Merchant can add Metafield filter in Quick Order setup

- Merchant có thể chọn `Metafield` khi tạo filter mới trong Quick Order.
- Merchant có thể chọn `Product metafield` hoặc `Variant metafield`.

### AC 2. Merchant can name the filter

- Merchant có field `Filter name` khi tạo hoặc sửa metafield filter.
- `Filter name` là bắt buộc.
- Tên đã lưu được dùng làm label hiển thị trên Quick Order page.

### AC 3. Only supported single-value definitions are shown

- Dropdown chỉ hiển thị definitions map được sang một trong 4 support buckets:
  - `choice_list_single_line_text`
  - `single_line_text`
  - `integer`
  - `boolean`
- Bất kỳ `list definition` nào đều không xuất hiện trong setup.

### AC 4. choice_list_single_line_text uses definition choices

- Với `Single line text` definition có preset choices, app render checkbox list options từ definition choices.
- Buyer có thể chọn một hoặc nhiều values trên Quick Order page.
- Product hoặc variant được giữ lại nếu actual value bằng một trong các values đã chọn.

### AC 5. single_line_text uses catalog distinct values

- Với `Single line text` definition không có preset choices, app chỉ support definition nếu build được distinct non-empty current values hợp lệ.
- Checkbox list hiển thị từ các distinct values đó.
- Product hoặc variant được giữ lại nếu actual trimmed value bằng một trong các values đã chọn.

### AC 6. integer uses catalog distinct values

- Với `Integer` definition, app chỉ support definition nếu build được distinct integer values hợp lệ.
- Checkbox list hiển thị từ các integer values đó.
- Product hoặc variant được giữ lại nếu actual integer value bằng một trong các values đã chọn.

### AC 7. boolean uses a single checkbox option

- Với `True or false` definition, app render đúng một checkbox option duy nhất đại diện cho `true`.
- Buyer tick checkbox này để lọc các item có metafield bằng `true`.
- `V1` không support filter `false`.

### AC 8. Missing or invalid value does not match

- Nếu metafield không tồn tại, `null`, empty, hoặc actual value không nằm trong selected values thì item đó không được giữ lại trong filtered result.

### AC 9. Unsupported or unsafe definitions are hidden

- Nếu definition không build được option list an toàn hoặc số option vượt guardrail thì definition đó không xuất hiện trong admin setup.

### AC 10. Quick Order page shows metafield filter to buyer

- Sau khi merchant cấu hình thành công, filter metafield được render trên Quick Order page theo đúng UI bucket tương ứng.
- Buyer có thể tương tác với filter này để lọc danh sách product hoặc variant.
- Label của filter hiển thị theo `Filter name` mà merchant đã lưu.
