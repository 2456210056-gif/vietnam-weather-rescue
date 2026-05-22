export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">
        Điều khoản sử dụng
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">Phạm vi hệ thống</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
        <p>Đây là web app phục vụ đồ án và hỗ trợ mô phỏng quy trình báo sự cố, cứu hộ.</p>
        <p>Khi có nguy hiểm thật, người dùng cần gọi ngay 112, 113, 114 hoặc 115.</p>
        <p>Dữ liệu thời tiết có thể là dữ liệu demo khi thiếu API key hoặc nhà cung cấp bị giới hạn lượt gọi.</p>
        <p>Người dùng không gửi thông tin sai lệch, spam SOS hoặc lạm dụng chức năng cứu hộ.</p>
      </div>
    </article>
  );
}
