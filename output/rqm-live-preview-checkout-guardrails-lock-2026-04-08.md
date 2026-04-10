# RQM - Live Preview for Checkout Guardrails in BSS B2B Lock, Login & Password

**Date:** 2026-04-08  
**App:** BSS B2B Lock, Login & Password  
**Module:** Checkout Guardrails  
**Document type:** Implementation-ready RQM  
**Status:** Draft for PM/UX/Dev review

## 1. Mục đích

Thêm `live preview` cho 2 tính năng hiện có của Lock:

1. `Hide payment methods`
2. `Hide accelerated checkout buttons`

để merchant thấy ngay kết quả của rule trong app admin, không cần test trên storefront thật hoặc checkout thật.

### Vấn đề cần giải quyết

- Merchant hiện phải tự test ngoài storefront để biết rule có hoạt động đúng hay không.
- `Hide payment methods` là flow có rủi ro cao vì merchant có thể vô tình ẩn hết phương thức thanh toán hợp lệ.
- `Hide accelerated checkout buttons` khó hình dung nếu chỉ đọc điều kiện rule, đặc biệt khi áp dụng cho `Product page`, `Cart page`, hoặc `Cart drawer`.
- Thiếu preview làm tăng vòng lặp thử sai, giảm niềm tin vào rule engine, và dễ phát sinh ticket kiểu “rule có vẻ đúng nhưng không chắc outcome thực tế”.

### Lý do nên làm lúc này

- Lock đã public `Hide payment methods` từ `v1.13.0` ngày `February 13, 2026`.
- Lock đã public `Hide accelerated checkout buttons` từ `v1.14.0` ngày `March 11, 2026`.
- Hướng đi của suite đang ưu tiên `merchant setup clarity`, `fast time-to-value`, và các editor có preview trực quan hơn.

## 2. Mục tiêu

### Mục tiêu chính

1. Giảm thời gian merchant cần để xác nhận outcome của rule.
2. Tăng độ tự tin khi save hoặc publish rule checkout guardrail.
3. Giảm support ticket liên quan đến việc khó kiểm chứng hoặc hiểu sai hành vi của 2 tính năng này.

### Chỉ số kỳ vọng

- Tăng `first-publish success rate` của nhóm rule này sau launch.
- Giảm nhóm ticket `rule not working as expected`.
- Tăng tỷ lệ merchant thực sự dùng preview trước khi publish.
- Giữ preview response đủ nhanh để merchant xem đây là một phần tự nhiên của flow cấu hình.

## 3. Triển khai

### 3.1 Phạm vi

#### In scope

- Một `shared live preview framework` cho checkout guardrails trong Lock
- `Preview Checkout` cho `Hide payment methods`
- `Preview Storefront` cho `Hide accelerated checkout buttons`
- `Preview context controls` để thay đổi sample context
- Hidden-state bằng `opacity: 0.35`
- Warning state và publish blocker cho case không còn payment method hợp lệ

#### Out of scope

- Theme preview pixel-perfect theo từng theme/store cụ thể
- Mô phỏng payment provider runtime thật
- Cross-rule validator toàn app
- Help doc hoàn chỉnh cho merchant

### 3.2 Định hướng UX/UI

- Giữ form rule builder ở bên trái và preview panel sticky ở bên phải trên desktop.
- Ở màn hình nhỏ hơn, preview chuyển xuống dưới nhưng vẫn nằm trong cùng page.
- Dùng 2 canvas riêng:
  - `Preview Checkout` cho payment methods
  - `Preview Storefront` cho accelerated buttons
- Mỗi preview panel gồm:
  - header
  - counter `Visible` và `Hidden`
  - context chips
  - preview canvas
  - warning hoặc checklist area

### 3.3 Logic chung

1. Merchant mở create/edit rule page.
2. Merchant cấu hình condition và target như hiện tại.
3. Khi rule đủ tối thiểu để evaluate, preview tự cập nhật.
4. Merchant có thể đổi sample context mà không làm thay đổi rule thật.
5. Preview phải dùng cùng evaluation logic hoặc cùng rule order với runtime thật.
6. Item bị ẩn phải vẫn còn hiện trong preview nhưng được làm mờ để merchant thấy rõ tác động của rule.

### 3.4 Yêu cầu triển khai

#### Requirement 1. Shared Live Preview Framework

Hệ thống phải cung cấp `live preview panel` ngay trong trang create/edit rule cho cả hai tính năng.

- Preview hiển thị mà không yêu cầu save rule trước.
- Preview tự cập nhật khi merchant đổi field liên quan đến điều kiện hoặc target.
- Nếu rule chưa đủ dữ liệu để evaluate, preview hiển thị checklist field còn thiếu thay vì blank.
- Preview shell, state model, loading state, warning state và layout phải được dùng chung giữa hai tính năng.

#### Requirement 2. Preview Context Controls

Hệ thống phải cho merchant chỉnh sample context để kiểm tra nhiều tình huống mà không ảnh hưởng tới rule config thật.

- Context tối thiểu gồm:
  - `Customer state`
  - `Country`
  - `Cart total`
  - `Products in cart`
  - `Page type`
- Với accelerated preview, `Page type` phải hỗ trợ:
  - `Product page`
  - `Cart page`
  - `Cart drawer`
- Nên có preset nhanh như:
  - `Guest`
  - `Logged in`
  - `B2B approved`
- Nếu preview đang dùng sample data thay vì data thật từ store, phải có banner rõ ràng.

#### Requirement 3. Payment Method Visibility Preview

Hệ thống phải cung cấp `Preview Checkout` để merchant thấy payment method nào đang `Visible`, payment method nào đang `Hidden`.

- Preview render payment methods theo group, ví dụ:
  - `Credit card / ATM`
  - `Other payment methods`
- Mỗi row phải có:
  - tên phương thức
  - icon hoặc ký hiệu
  - trạng thái `Visible` hoặc `Hidden`
- Nếu method bị ẩn bởi rule, row đó phải được làm mờ và có badge `Hidden`.
- Nếu dữ liệu method thật chưa lấy được, system có thể hiển thị sample preview nhưng phải gắn nhãn rõ đây là sample data.
- Nếu kết quả preview cho thấy còn `0` payment methods hợp lệ, system phải block publish.

#### Requirement 4. Accelerated Checkout Button Visibility Preview

Hệ thống phải cung cấp `Preview Storefront` để merchant thấy button accelerated checkout nào sẽ bị ẩn theo rule.

- Preview phải cho đổi `Page type` giữa `Product page`, `Cart page`, và `Cart drawer`.
- Canvas phải mô phỏng một product/cart card đơn giản với vùng accelerated buttons xếp dọc.
- Có thể dùng các button mẫu như:
  - `Shop Pay`
  - `PayPal`
  - `G Pay`
  - `Apple Pay`
  - `Meta Pay`
- Button bị ẩn phải được làm mờ và có trạng thái dễ đọc.
- Preview này chỉ mô phỏng outcome logic, không cam kết giống hoàn toàn giao diện theme thật.

#### Requirement 5. Hidden-state Visual Treatment

Hệ thống phải dùng một pattern thống nhất cho item bị ẩn trong preview.

- Dùng `opacity: 0.35` cho item bị ẩn.
- Item bị ẩn phải ở trạng thái non-interactive trong preview.
- Item bị ẩn không được biến mất hoàn toàn khỏi canvas.
- Không chỉ dùng opacity; luôn cần badge hoặc label `Hidden`.
- Counter `Visible` và `Hidden` phải luôn hiển thị ở đầu panel.

#### Requirement 6. Warning States and Guardrails

Hệ thống phải dùng preview như một lớp guardrail trước khi publish.

- Với `Hide payment methods`, nếu preview còn `0` method hợp lệ thì phải block publish.
- Blocker phải nêu rõ nguyên nhân để merchant chỉnh lại rule.
- Với `Hide accelerated checkout buttons`, không cần block publish chỉ vì tất cả accelerated buttons bị ẩn.
- Nếu preview chưa đủ dữ liệu hoặc đang dùng sample data, phải có warning rõ ràng.
- Nếu preview evaluate lỗi, phải có trạng thái lỗi và cho phép retry.

#### Requirement 7. Performance and Consistency

Preview phải đủ nhanh và đủ ổn định để merchant tin dùng trong flow cấu hình.

- Preview nên cập nhật gần realtime sau khi merchant thay đổi input hợp lệ.
- Rule order của preview phải khớp với runtime.
- Preview phải hoạt động tốt ở desktop và mobile admin layout.
- Khi merchant quay lại edit rule, system phải rebuild preview từ cấu hình hiện tại.

#### Requirement 8. Analytics and Logging

Hệ thống phải ghi nhận usage và lỗi của preview để Product và Dev theo dõi hiệu quả.

- Track tối thiểu:
  - preview opened
  - preview context changed
  - preview error shown
  - publish blocked by no valid payment method
  - publish completed after preview interaction
- Log kỹ thuật phải tách được:
  - evaluate error
  - thiếu source data
  - mismatch giữa sample data và runtime

### 3.5 Reference UI

- Demo preview: https://demo-kzmg7jmnu8nz6khs8ne5.vusercontent.net?__v0_token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..4srhuO_rPA6kktaM.f7oYDfGh7vobWY9Npw65DrPN65UgUJtozWVbQ7kOs4ScfU0_a6xxx6rR37G6dVVB1JpSCC3SXFfNgytLd_zcE54Tetj5gdY2Sjv4L7MFBixPhpSRAEEvf3QEngA8hlQjvJFsABTLccwSjkSG_tbdQLlXY2iUDS__6qWCN2J1VnGoF3xqZ-iGjCCBy4-uvs1CssfqLIgiaFZp20wApj-WWxCpGJADmyoB0jHxbDd22nrfaTUMnorhDm2qW8jyUkmc8L72zUbNE7zIQg.jWcLOwBToGJlYJB0EQgwfg
- Editable chat: https://v0.app/chat/dSv8x2VIL6K

### 3.6 Rủi ro cần lưu ý

- Preview có thể lệch runtime nếu không dùng cùng evaluation flow.
- Nguồn dữ liệu payment methods và accelerated buttons có thể chưa đủ chuẩn cho preview v1.
- Nếu context controls quá nhiều, preview sẽ trở thành một form phụ rối.
- Nếu chỉ dùng opacity mà không có badge, merchant dễ hiểu nhầm giữa `Hidden by rule` và `Unavailable`.

## 4. AC

- Merchant có thể xem preview ngay trên create/edit page của `Hide payment methods` mà không cần save rule trước.
- Merchant có thể xem preview ngay trên create/edit page của `Hide accelerated checkout buttons` mà không cần mở storefront thật.
- Khi merchant đổi condition hoặc preview context, preview cập nhật lại đúng outcome.
- Payment method bị ẩn hiển thị với `opacity: 0.35` và badge `Hidden`.
- Accelerated checkout button bị ẩn hiển thị với `opacity: 0.35` và trạng thái `Hidden` dễ đọc.
- Item bị ẩn vẫn còn hiện trong preview, không biến mất hoàn toàn khỏi canvas.
- Nếu rule chưa đủ field bắt buộc, preview hiển thị checklist field thiếu thay vì panel trống.
- Nếu preview đang dùng sample data, merchant nhìn thấy warning hoặc banner tương ứng.
- Nếu preview payment methods cho thấy không còn phương thức thanh toán hợp lệ nào, merchant không thể publish rule.
- Preview không yêu cầu merchant test thủ công trên storefront thật để xem outcome cơ bản của rule.
