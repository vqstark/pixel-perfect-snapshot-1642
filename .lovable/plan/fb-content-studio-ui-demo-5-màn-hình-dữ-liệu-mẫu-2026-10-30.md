# FB Content Studio — UI demo (5 màn hình, dữ liệu mẫu)

## Phạm vi

- App demo UI theo đúng tài liệu mô tả: 5 màn hình, dữ liệu mẫu cứng trong module mock (không database, không đăng nhập, một người dùng).
- Chữ UI tiếng Anh; nội dung video mẫu có cả EN và VI.
- Toàn bộ nút bấm đều phản hồi được ở mức UI: mở màn, đổi trạng thái, hiện trạng thái đang render, thêm chủ đề, sửa caption (state cục bộ). Không có tự động hóa thật (AI, giọng đọc, đăng Facebook) — chỉ hiển thị trạng thái.

## Cấu trúc route (TanStack Start)

```
src/routes/
  __root.tsx            -> sửa head metadata, thêm font <link>
  index.tsx             -> Màn 1 · Dashboard
  domains.$domainId.tsx -> Màn 2 · Domain workspace
  review.$videoId.tsx   -> Màn 3 · Duyệt trước khi đăng
  new-video.tsx         -> Màn 4 · Tạo video mới
  settings.tsx          -> Màn 5 · Pages & cài đặt
  review.tsx            -> Review queue (danh sách chờ duyệt)
```

Component dùng chung: `TopBar` (logo · Dashboard · Domains · Review queue + badge · Pages & settings · nút "+ New video"), `StatusBadge`, `LangLabel` (EN/VI), `StyleLabel` (A/B), `VideoCard` 9:16.

## Dữ liệu mẫu (src/lib/mock-data.ts)

- 4 domain: Finance & Investing (Active, pipeline "Explainer video v1"), Real Estate / Technology / Business (Not set up — thẻ mờ, viền nét đứt, nút "Set up domain").
- Pipeline Finance 8 bước lấy từ cấu hình: Topic → Research → Script → Voice EN+VI → Visuals (A/B) → Render → Review → Publish; số bước đọc từ config, không cố định.
- 8 page (4 domain × EN/VI): 2 page Finance "Connected", còn lại "Not linked"; token Facebook của 1 page sắp hết hạn (cảnh báo hiện cả ở Dashboard).
- 6–8 video trải đều trạng thái: Đang sản xuất (kèm bước hiện tại), Chờ duyệt, Đã duyệt, Đã lên lịch, Đã đăng, Cần xử lý (lỗi "chỉ tìm được 2 ảnh có giấy phép cho kiểu A"), Yêu cầu sửa, Bị từ chối.
- 3 video "Chờ duyệt" có nội dung thật đầy đủ: kịch bản 5 đoạn (Hook, Câu hỏi, Giải thích, Kết luận, Footer) bằng EN + VI, mốc thời gian, bảng nguồn & giấy phép (Public domain, CC BY-SA…), 2 caption, chủ đề mẫu "Khủng hoảng 2008".

## Màn 1 · Dashboard (/)

1. Tiêu đề + dòng "Mọi thứ chạy tự động, bạn chỉ duyệt trước khi đăng".
2. **Chờ bạn duyệt**: lưới thẻ video 9:16 (thumbnail + "Text post"), tiêu đề, domain · độ dài, nhãn EN/VI, A/B, trạng thái; bấm vào mở màn Duyệt. Rỗng thì hiện "Không có gì cần duyệt" + thời điểm dự kiến.
3. **Domains**: thẻ Finance Active (trạng thái 2 page, 3 số: hàng đợi · đang sản xuất · chờ duyệt, link workspace); 3 thẻ Not set up.
4. **Giới hạn đăng 24h**: thanh tiến độ "đã đăng / 30" cho từng page + ghi chú giới hạn của Meta; cảnh báo token sắp hết hạn đặt lên trên cùng.

## Màn 2 · Domain workspace (/domains/finance)

1. Header: back link, tên domain, pipeline, 2 page, nút "Pipeline settings" và "Pause automation".
2. Sơ đồ pipeline: hàng 8 bước từ config, bước Review nổi bật.
3. Cột Đang sản xuất: thẻ video có thanh tiến độ 8 đoạn, dòng "Đang làm: <bước> · <chi tiết>", thẻ lỗi có nút "Chuyển sang kiểu B" / "Tải ảnh lên".
4. Cột hẹp Hàng đợi chủ đề: nguồn (suggested · trending / evergreen / you added), nút "Make now", "+ Add topic" (thêm được dòng mới).
5. Lịch đăng: bảng theo page — khung giờ/ngày, giờ theo múi giờ page (EN = US Eastern, VI = GMT+7), bài kế tiếp.

## Màn 3 · Duyệt (/review/$videoId) — làm kỹ nhất

- Bố cục 2 cột desktop, xếp dọc mobile; dính đáy màn trên điện thoại cho hàng nút hành động.
- Preview: công tắc ngôn ngữ (đổi cả kịch bản, phụ đề, caption hiển thị), khung 9:16 có play + thanh thời gian + nhãn đoạn đang phát (HOOK…), công tắc A/B khi đổi hiện trạng thái "Re-rendering…" vài giây.
- Kịch bản 5 thẻ theo cấu trúc, Regenerate từng đoạn, bấm thẻ → preview nhảy tới đoạn, thẻ đang phát tô sáng.
- Bảng Nguồn & giấy phép.
- Chi tiết bài đăng: 2 ô caption sửa được, checkbox Đăng page EN / VI / Gắn nhãn AI, 3 lựa chọn thời điểm (next slot / ngay / chọn giờ).
- Nút Reject · Request changes (mở ô ghi chú) · **Approve & schedule** → chuyển sang video kế tiếp trong hàng duyệt.
- Header có "Review queue (n/m)" với nút trước/sau.

## Màn 4 · Tạo video mới (/new-video)

Form hẹp một cột: dropdown Domain (domain chưa có pipeline hiện mờ không chọn được), ô chủ đề, ghi chú; thẻ chọn định dạng (Reel / Post chữ + ảnh), phong cách (Auto / A / B), độ dài (30–60s / 60–90s), ngôn ngữ (EN + VI mặc định chọn cả hai); dòng "Bạn sẽ được báo khi video sẵn sàng để duyệt"; nút "Start production" quay về Domain workspace, video mới đứng đầu danh sách đang sản xuất.

## Màn 5 · Pages & cài đặt (/settings)

1. Nút "Connect with Facebook" + bảng domain × ngôn ngữ: Domain · Ngôn ngữ · Tên page · Trạng thái (kết nối / token hết hạn / chưa liên kết + trạng thái kiếm tiền) · Giọng đọc · Múi giờ · Hành động (Brand kit / Link pages); dòng gộp "Not linked" cho domain chưa có page.
2. Brand kit theo page: logo, màu chính, màu phụ đề, chữ footer, preview nhỏ footer.
3. Dịch vụ: Claude API, ElevenLabs, nguồn ảnh (Wikimedia Commons, Library of Congress), kênh báo — mỗi dòng một trạng thái kết nối.
4. Trạng thái token sắp hết hạn / hết hạn: cảnh báo + nút kết nối lại.

## Hình minh hoạ

Tạo 3–4 ảnh 9:16 làm thumbnail/preview mẫu (phong cách tư liệu lưu trữ cho kiểu A, motion graphics cho kiểu B), dùng imagegen và lưu vào src/assets.

## Hướng hình ảnh

Không dùng tông tím/indigo mặc định. Chọn hướng "control room trên giấy kem": nền giấy kem ấm (#f6f2ea-ish), mực gần đen, một màu nhấn cam hổ phách cho "Chờ duyệt" (bước duyệt là bước duy nhất làm tay nên nổi nhất), xanh lá cho "Đã kết nối/Đang chạy", đỏ cho lỗi; thẻ trạng thái dùng pill chữ mảnh, đường kẻ mảnh kiểu editorial. Font: Space Grotesk cho tiêu đề + DM Sans cho nội dung (load bằng <link> trong __root.tsx). Token màu định nghĩa trong src/styles.css bằng oklch, không hardcode màu trong component.

## Kiểm thử

- Build preview không lỗi (theo /tmp/observability/build-errors.log).
- Playwright đi thử luồng chính: Dashboard → thẻ chờ duyệt → màn Duyệt (đổi EN/VI, đổi A/B, Approve → nhảy video kế) → Domain workspace → New video → Settings; chụp ảnh từng màn.
- Kiểm tra responsive màn Duyệt ở khổ điện thoại.
