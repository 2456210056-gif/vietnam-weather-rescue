import { Ambulance, Flame, MapPin, PhoneCall, ShieldAlert, Waves } from "lucide-react";

const GUIDES = [
  {
    title: "Khi có bão",
    icon: ShieldAlert,
    items: [
      "Theo dõi cảnh báo chính thức, hạn chế ra ngoài.",
      "Sạc đầy điện thoại, chuẩn bị đèn pin, nước uống và thuốc cơ bản.",
      "Tránh trú dưới cây lớn, cột điện hoặc công trình tạm."
    ]
  },
  {
    title: "Khi ngập lụt",
    icon: Waves,
    items: [
      "Di chuyển lên vị trí cao, ngắt điện khi nước vào nhà.",
      "Không đi qua dòng nước chảy xiết hoặc khu vực không rõ độ sâu.",
      "Chia sẻ vị trí GPS khi cần hỗ trợ."
    ]
  },
  {
    title: "Khi cháy nổ",
    icon: Flame,
    items: [
      "Gọi 114 ngay khi phát hiện cháy.",
      "Dùng khăn ướt che mũi miệng, di chuyển thấp theo lối thoát hiểm.",
      "Không dùng thang máy trong tình huống cháy."
    ]
  },
  {
    title: "Sạt lở",
    icon: MapPin,
    items: [
      "Rời khỏi chân đồi, bờ sông, taluy có dấu hiệu nứt trượt.",
      "Không quay lại khu vực nguy hiểm để lấy tài sản.",
      "Báo chính quyền địa phương và chia sẻ mốc vị trí rõ ràng."
    ]
  },
  {
    title: "Sơ cứu cơ bản",
    icon: Ambulance,
    items: [
      "Gọi 115 khi có chấn thương nặng hoặc khó thở.",
      "Cầm máu bằng gạc sạch, cố định vùng nghi gãy xương.",
      "Không tự ý di chuyển nạn nhân nghi chấn thương cột sống."
    ]
  },
  {
    title: "Gọi cứu hộ hiệu quả",
    icon: PhoneCall,
    items: [
      "112: cứu nạn, thiên tai, thảm họa.",
      "113: công an. 114: PCCC/cứu nạn. 115: cấp cứu y tế.",
      "Nói ngắn gọn: vị trí, số người, tình trạng, nguy cơ xung quanh."
    ]
  }
];

export default function SafetyPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">
          Hướng dẫn an toàn
        </p>
        <h2 className="mt-2 text-3xl font-black">Ứng phó thiên tai & cứu hộ</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Nội dung ngắn gọn để đọc nhanh trên điện thoại. Khi nguy hiểm thật, ưu tiên gọi
          số khẩn cấp phù hợp.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;

          return (
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" key={guide.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <Icon aria-hidden className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">{guide.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {guide.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}
