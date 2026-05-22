export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">
        Chính sách dữ liệu
      </p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">Quyền riêng tư</h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
        <p>Ứng dụng có thể lưu email, số điện thoại, địa điểm yêu thích và lịch sử SOS.</p>
        <p>Vị trí chỉ được lấy khi người dùng chủ động cấp quyền qua trình duyệt.</p>
        <p>Trong phạm vi đồ án, dữ liệu không được chia sẻ cho bên thứ ba ngoài các API hạ tầng đã cấu hình.</p>
        <p>Hệ thống không lưu mật khẩu thật. Mật khẩu được hash bằng bcrypt trước khi lưu MongoDB.</p>
        <p>Người dùng có thể cập nhật thông tin cá nhân trong Dashboard/Profile.</p>
      </div>
    </article>
  );
}
