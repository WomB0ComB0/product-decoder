import ImageUploader from "../../components/ImageUploader";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#fff7ea]">
      {/* Top bar matching Figma */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-[34px] leading-none font-extrabold text-[#5d63e6]">
          <div>Product</div>
          <div>Decoder</div>
        </div>

        <nav className="flex items-center gap-10 text-[20px]">
          <Link href="/dashboard" className="text-[#e27d55] font-semibold">Image upload</Link>
          <Link href="/saved" className="font-semibold text-black">Saved searches</Link>
          <Link href="/" className="font-semibold text-black">Home</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="px-5 py-2 rounded-xl bg-[#f8c83b] shadow text-black font-semibold">Log Out</button>
          <div className="w-12 h-12 rounded-full bg-[#f1e7ff] flex items-center justify-center">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Big blue panel with dashed drop zone */}
      <section className="mt-4">
        <ImageUploader />
      </section>
    </main>
  );
}
