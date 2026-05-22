import { Mail, ShieldCheck, Trash2 } from "lucide-react";

const contactEmail = "phathacker@hotmail.com";

export default function DataDeletionPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <section className="theme-glass rounded-[32px] p-5 sm:p-7 lg:p-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-200">
            <Trash2 aria-hidden className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Chính sách dữ liệu
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Yêu cầu xóa dữ liệu người dùng
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              Trang này hướng dẫn người dùng Facebook Login gửi yêu cầu xóa dữ liệu tài khoản khỏi
              hệ thống Vietnam Disaster Rescue / Weather GIS SOS.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <InfoCard
            icon={<ShieldCheck aria-hidden className="h-5 w-5" />}
            title="Dữ liệu có thể được lưu"
          >
            Website Vietnam Disaster Rescue / Weather GIS SOS có thể lưu thông tin đăng nhập cơ bản
            như tên, email và ảnh đại diện khi người dùng đăng nhập bằng Facebook.
          </InfoCard>

          <InfoCard icon={<Trash2 aria-hidden className="h-5 w-5" />} title="Quyền yêu cầu xóa">
            Người dùng có thể yêu cầu xóa dữ liệu tài khoản khỏi hệ thống. Sau khi nhận yêu cầu,
            hệ thống sẽ xóa hoặc ẩn danh dữ liệu liên quan trong thời gian hợp lý.
          </InfoCard>
        </div>

        <section className="mt-8 rounded-[28px] border border-blue-100 bg-blue-50/70 p-5">
          <h2 className="text-xl font-black text-slate-950">Cách gửi yêu cầu</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl bg-white/85 p-4 shadow-sm backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-black text-blue-700">
                <Mail aria-hidden className="h-5 w-5" />
                Cách 1: Gửi email
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Gửi email yêu cầu xóa dữ liệu tài khoản đến địa chỉ liên hệ:
              </p>
              <a
                className="mt-3 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-200"
                href={`mailto:${contactEmail}?subject=Yêu cầu xóa dữ liệu người dùng`}
              >
                {contactEmail}
              </a>
            </article>

            <article className="rounded-3xl bg-white/85 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-black text-blue-700">Cách 2: Gỡ ứng dụng trên Facebook</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Vào Facebook → Settings & Privacy → Settings → Apps and Websites → chọn ứng dụng
                Weather → Remove.
              </p>
            </article>
          </div>
        </section>

        <footer className="mt-8 rounded-3xl border border-white/70 bg-white/80 px-4 py-4 text-center shadow-sm backdrop-blur">
          <p className="text-sm font-black text-slate-950">
            © Thiết kế bởi nhóm DongVan - 2026
          </p>
        </footer>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
        <div>
          <h2 className="font-black text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{children}</p>
        </div>
      </div>
    </article>
  );
}
