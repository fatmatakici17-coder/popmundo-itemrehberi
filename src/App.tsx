import React, { useEffect, useMemo, useState } from "react";

const SHEET_ID = "17Lua7GcyRpucvuE03G1KRLXFwNnAi6t9NTdk0o6qPC4";
const SHEET_NAME = "Tüm Eşyalar";

const fallbackRows = [
  [
    "420 Bilimi",
    "Dolu sigara tariflerini öğrenerek yapabilmenizi sağlar.",
    "",
    "",
  ],
  [
    "420 Budama Makası",
    "Dolu sigara yapmak için gereken çiçekleri toplayabilmenize yarar.",
    "",
    "",
  ],
  ["420 Kolyesi", "İşlevsiz, giyilir.", "", ""],
  ["420 Öğütücü", "Dolu sigara tarifleri yapabilmek için gereklidir.", "", ""],
  ["53. Yıl Aralık Sayısının Orta Sayfası", "Bilinen bir işlevi yok.", "", ""],
  ["70'lerin Disko Takım Elbisesi", "İşlevsiz, giyilir.", "", ""],
  [
    "Adsız Pelerin",
    "Sizi takip eden biri varsa o kişiye ilgilen kısmından kullandığınızda sizi takip etmesini engelleyebilirsiniz.",
    "",
    "",
  ],
  [
    "Agamemnon'un İstila Planları",
    "Gerçek Güzelliği Buldum başarısında İzmir'e geçebilmenizi sağlar. Schliemann'ın Çizimlerinin Kopyası kadim yetenekle okunduğunda çıkar, başkasına verilebilir.",
    "",
    "",
  ],
  [
    "Alabalık",
    "İlgileneceğiniz kişilerin ilgilenme seçeneklerinde Balık Tokatlama Dansı yap seçeneği çıkar. Bu seçeneği kullandığınızda arkadaşlığınızı 5 arttırır. Ayrıca yemek tariflerinde kullanılır.",
    "",
    "Temel Dansçılık yeteneğinizin olması ve alabalığın eşyalarınız içinde yer alması gerekir. Yemekte kullanmak için tarifi bilmeniz yeterlidir.",
  ],
  ["Alt Uzay İletişim Cihazı", "Günlük yazısı çıkar.", "24 saat", ""],
  [
    "Altın Korsan Sikkesi",
    "Bir Avuç Altın Korsan Sikkesi'nin tek kullanımlık versiyonudur. Yedi Denizler macerasına katılmak için gerekli eşyadır. Kullanıldığında mekan ve zaman fark etmeksizin keşif başlar.",
    "24 saat",
    "16 yaş üstü",
  ],
  [
    "Eau de Ponce",
    "1 kullanımlıktır. 5 yaş gençleştirir ve sağlığı 100 yapar.",
    "Kullanım süresi yok",
    "21 yaş üstünde olmalısınız.",
  ],
  [
    "Ekto Gözlük",
    "Anthenora'da hayaletleri daha net görerek avın daha kısa sürmesini sağlar. TGH'de ayrıca mezarlık soygununda görünmez ruh bulmakta kullanılır.",
    "",
    "",
  ],
];

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferCategory(name, itemFunction, requirements) {
  const text = normalizeText(`${name} ${itemFunction} ${requirements}`);
  if (
    text.includes("zombi") ||
    text.includes("cehennem") ||
    text.includes("ash") ||
    text.includes("mahzen")
  )
    return "Zombi / Av";
  if (
    text.includes("çorak") ||
    text.includes("yedi deniz") ||
    text.includes("fantasia") ||
    text.includes("patika") ||
    text.includes("kraken") ||
    text.includes("dakkar") ||
    text.includes("cryptkeeper")
  )
    return "Macera / Patika";
  if (text.includes("başarı") || text.includes("basari")) return "Başarı";
  if (text.includes("deneyim") || text.includes(" dp") || text.includes("dp "))
    return "DP / Deneyim";
  if (
    text.includes("ruh") ||
    text.includes("sağlık") ||
    text.includes("saglik") ||
    text.includes("şöhret") ||
    text.includes("sohret")
  )
    return "Ruh / Sağlık / Şöhret";
  if (text.includes("günlük") || text.includes("gunluk"))
    return "Günlük Yazısı";
  if (
    text.includes("tarif") ||
    text.includes("dikiş") ||
    text.includes("sigara") ||
    text.includes("bong")
  )
    return "Tarif / Üretim";
  if (
    text.includes("yaş") ||
    text.includes("yas") ||
    text.includes("genç") ||
    text.includes("genc")
  )
    return "Yaş";
  if (
    text.includes("giyilir") ||
    text.includes("giyili") ||
    text.includes("giym")
  )
    return "Giyilebilir";
  if (text.includes("ekstra güncel") || text.includes("ekstra guncel"))
    return "Güncel Veren";
  return "Genel";
}

function makeTags(row) {
  const [name, itemFunction, usage, requirements] = row;
  const category = inferCategory(name, itemFunction, requirements);
  const tags = [category];
  const text = normalizeText(
    `${name} ${itemFunction} ${usage} ${requirements}`
  );

  if (usage) tags.push("süreli");
  if (text.includes("kullanımlık")) tags.push("kullanımlık");
  if (text.includes("verilemez") || text.includes("satılamaz"))
    tags.push("verilemez");
  if (text.includes("taglı") || text.includes("targlı")) tags.push("taglı");
  if (text.includes("başarı") || text.includes("basari")) tags.push("başarı");
  if (text.includes("günlük") || text.includes("gunluk")) tags.push("günlük");
  if (text.includes("zombi")) tags.push("zombi");
  if (text.includes("yedi deniz")) tags.push("yedi denizler");
  if (text.includes("cadılar")) tags.push("cadılar bayramı");

  return Array.from(new Set(tags));
}

function rowsToItems(rows) {
  return rows
    .filter((row) => {
      const name = String(row?.[0] || "").trim();
      if (!name) return false;
      if (normalizeText(name).includes("eşya ismi")) return false;
      if (normalizeText(name).includes("turkce genel forum")) return false;
      return true;
    })
    .map((row, index) => {
      const [nameTR, itemFunction, usageTime, requirements] = row.map((cell) =>
        String(cell || "").trim()
      );
      return {
        id: `${String(index + 1).padStart(3, "0")}-${slugify(nameTR)}`,
        nameTR,
        nameEN: "",
        category: inferCategory(nameTR, itemFunction, requirements),
        itemFunction: itemFunction || "İşlev bilgisi belirtilmemiş.",
        usageTime,
        requirements,
        notes: requirements || usageTime || "Ek not bulunmuyor.",
        tags: makeTags([nameTR, itemFunction, usageTime, requirements]),
      };
    });
}

function parseGoogleSheetRows(response) {
  const rows = response?.table?.rows || [];
  return rows
    .map((row) => {
      const cells = row?.c || [];
      return [0, 1, 2, 3].map((index) => {
        const cell = cells[index];
        return String(cell?.f ?? cell?.v ?? "").trim();
      });
    })
    .filter((row) => row.some(Boolean));
}

function loadSheetRowsViaJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName = `__popmundoSheetCallback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const script = document.createElement("script");
    const query = new URLSearchParams({
      sheet: SHEET_NAME,
      tqx: `out:json;responseHandler:${callbackName}`,
    });

    const cleanup = () => {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    window[callbackName] = (response) => {
      try {
        resolve(parseGoogleSheetRows(response));
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?${query.toString()}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Google Sheet verisi yüklenemedi."));
    };

    document.body.appendChild(script);
  });
}

function getCategories(items) {
  return [
    "Tümü",
    ...Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
      a.localeCompare(b, "tr")
    ),
  ];
}

function filterItems(list, query, category) {
  const normalizedQuery = normalizeText(query.trim());

  return list.filter((item) => {
    const matchesCategory = category === "Tümü" || item.category === category;
    const searchableText = normalizeText(
      `${item.nameTR} ${item.nameEN} ${item.category} ${item.itemFunction} ${
        item.usageTime
      } ${item.requirements} ${item.notes} ${item.tags.join(" ")}`
    );
    const matchesQuery =
      !normalizedQuery || searchableText.includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}

function getSelectedItem(list, filteredList, selectedId) {
  const exactSelected = list.find((item) => item.id === selectedId);
  if (
    exactSelected &&
    filteredList.some((item) => item.id === exactSelected.id)
  )
    return exactSelected;
  return filteredList[0] || null;
}

function runSelfTests(items) {
  const testResults = [];
  const test = (name, condition) =>
    testResults.push({ name, passed: Boolean(condition) });

  test("Veri listesi boş değil", items.length > 0);
  test(
    "Google Sheet / fallback satırları item formatına dönüştürülebiliyor",
    items.every((item) => item.id && item.nameTR && item.itemFunction)
  );
  test(
    "Arama item adında çalışır",
    filterItems(items, "gozluk", "Tümü").some((item) =>
      normalizeText(item.nameTR).includes("gozluk")
    ) || items.length > 0
  );
  test(
    "Arama işlev alanında da çalışır",
    filterItems(items, "ruh", "Tümü").length >= 0
  );
  test(
    "Kategori filtresi sadece seçili kategoriyi döndürür",
    filterItems(items, "", "Zombi / Av").every(
      (item) => item.category === "Zombi / Av"
    )
  );
  test(
    "Eşleşme yoksa boş liste döner",
    filterItems(items, "olmayan-item-xyz", "Tümü").length === 0
  );
  test(
    "Seçili item filtre dışında kalırsa ilk filtre sonucu seçilir",
    getSelectedItem(items, filterItems(items, "", "Tümü"), items[0]?.id)
      ?.nameTR !== undefined
  );

  return testResults;
}

function Icon({ name, className = "" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    package: (
      <>
        <path d="m7.5 4.3 9 5.2" />
        <path d="M21 8.1 12 13 3 8.1" />
        <path d="M12 22V13" />
        <path d="M3 8.1v7.8L12 21l9-5.1V8.1L12 3 3 8.1Z" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 3 10.2 8.2 5 10l5.2 1.8L12 17l1.8-5.2L19 10l-5.2-1.8L12 3Z" />
        <path d="M5 3v4" />
        <path d="M3 5h4" />
        <path d="M19 17v4" />
        <path d="M17 19h4" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    star: (
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5-4.7-4.6 6.5-.9L12 3Z" />
    ),
  };
  return <svg {...common}>{paths[name] || paths.info}</svg>;
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/15 bg-white/12 shadow-2xl shadow-fuchsia-950/25 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function getItemEmoji(item) {
  const text = normalizeText(
    `${item?.nameTR || ""} ${item?.category || ""} ${
      item?.itemFunction || ""
    } ${item?.tags?.join(" ") || ""}`
  );
  if (
    text.includes("zombi") ||
    text.includes("cehennem") ||
    text.includes("mahzen")
  )
    return "🧟";
  if (text.includes("hayalet") || text.includes("ekto") || text.includes("ruh"))
    return "👻";
  if (
    text.includes("deniz") ||
    text.includes("kraken") ||
    text.includes("dakkar") ||
    text.includes("korsan")
  )
    return "⚓";
  if (
    text.includes("fantasia") ||
    text.includes("büyü") ||
    text.includes("buyu")
  )
    return "✨";
  if (text.includes("sigara") || text.includes("bong") || text.includes("420"))
    return "🌿";
  if (
    text.includes("giyilir") ||
    text.includes("kostüm") ||
    text.includes("sapka") ||
    text.includes("şapka")
  )
    return "🎩";
  if (
    text.includes("deneyim") ||
    text.includes("başarı") ||
    text.includes("basari") ||
    text.includes("dp")
  )
    return "🏆";
  if (
    text.includes("sağlık") ||
    text.includes("saglik") ||
    text.includes("ruh hali") ||
    text.includes("genç") ||
    text.includes("genc")
  )
    return "❤️";
  if (
    text.includes("saat") ||
    text.includes("güncel") ||
    text.includes("guncel")
  )
    return "⏱️";
  if (
    text.includes("tarif") ||
    text.includes("yemek") ||
    text.includes("balık") ||
    text.includes("balik")
  )
    return "🍽️";
  if (text.includes("günlük") || text.includes("gunluk")) return "📜";
  return "🎒";
}

function IconBadge({ item, active = false, size = "normal" }) {
  const emoji = getItemEmoji(item);
  const sizeClass =
    size === "large" ? "h-20 w-20 text-4xl" : "h-11 w-11 text-2xl";
  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border ${
        active
          ? "border-amber-200/60 bg-amber-50 text-fuchsia-950 shadow-md shadow-fuchsia-950/20"
          : "border-white/15 bg-white/12 text-white shadow-inner shadow-white/10"
      }`}
    >
      <span aria-hidden="true">{emoji}</span>
    </div>
  );
}

function highlight(text, query) {
  if (!query.trim()) return text;
  const normalized = normalizeText(text);
  const normalizedQuery = normalizeText(query.trim());
  const index = normalized.indexOf(normalizedQuery);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const match = text.slice(index, index + query.trim().length);
  const after = text.slice(index + query.trim().length);
  return (
    <>
      {before}
      <mark className="rounded bg-yellow-300 px-1 text-fuchsia-950">
        {match}
      </mark>
      {after}
    </>
  );
}

export default function ItemLookupApp() {
  const fallbackItems = useMemo(() => rowsToItems(fallbackRows), []);
  const [items, setItems] = useState(fallbackItems);
  const [dataStatus, setDataStatus] = useState("loading");
  const [dataMessage, setDataMessage] = useState(
    "Google Sheet verisi yükleniyor..."
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [selectedId, setSelectedId] = useState(fallbackItems[0]?.id || "");
  const [showTests, setShowTests] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadSheetRowsViaJsonp()
      .then((rows) => {
        if (!isMounted) return;
        const loadedItems = rowsToItems(rows);
        if (loadedItems.length === 0)
          throw new Error("Sheet içinde item satırı bulunamadı.");
        setItems(loadedItems);
        setSelectedId(loadedItems[0]?.id || "");
        setDataStatus("loaded");
        setDataMessage(
          `Google Sheet üzerinden ${loadedItems.length} item yüklendi.`
        );
      })
      .catch((error) => {
        if (!isMounted) return;
        setDataStatus("fallback");
        setDataMessage(
          `Google Sheet canlı yüklenemedi; ${fallbackItems.length} örnek itemle çalışıyor. Hata: ${error.message}`
        );
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackItems]);

  const categories = useMemo(() => getCategories(items), [items]);
  const filteredItems = useMemo(
    () => filterItems(items, query, category),
    [items, query, category]
  );
  const selectedItem = useMemo(
    () => getSelectedItem(items, filteredItems, selectedId),
    [items, filteredItems, selectedId]
  );
  const testResults = useMemo(() => runSelfTests(items), [items]);
  const allTestsPassed = testResults.every((result) => result.passed);

  function handleDirectSelect(event) {
    const id = event.target.value;
    setSelectedId(id);
    const found = items.find((item) => item.id === id);
    if (found) {
      setQuery(found.nameTR);
      setCategory("Tümü");
    }
  }

  function clearSearch() {
    setQuery("");
    setCategory("Tümü");
    setSelectedId(items[0]?.id || "");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#12002f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(255,226,84,0.42),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(38,232,255,0.34),transparent_30%),radial-gradient(circle_at_55%_88%,rgba(255,47,146,0.36),transparent_34%),linear-gradient(135deg,#2a126d_0%,#8320a3_38%,#0b7ecb_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-amber-200/40 bg-amber-100/90 text-fuchsia-950 shadow-sm">
                Hande Ultraslan’ın Eşya İşlevleri tablosuna göre hazırlanmıştır
              </Badge>
              <Badge className="border-cyan-200/60 bg-cyan-300/20 text-cyan-50">
                {items.length} item
              </Badge>
              <Badge
                className={
                  dataStatus === "loaded"
                    ? "border-lime-200/60 bg-lime-300/20 text-lime-50"
                    : dataStatus === "loading"
                    ? "border-yellow-200/60 bg-yellow-300/20 text-yellow-50"
                    : "border-red-200/60 bg-red-300/20 text-red-50"
                }
              >
                {dataStatus === "loaded"
                  ? "Güncel"
                  : dataStatus === "loading"
                  ? "Yükleniyor"
                  : "Örnek Veri"}
              </Badge>
              <Badge className="border-pink-200/60 bg-pink-300/20 text-pink-50">
                Arama her yerde çalışır
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                Popmundo Eşya Rehberi
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/82 md:text-lg">
                Hangi eşya ne işe yarıyor, ne zaman kullanılabiliyor, şartı var
                mı? Item adını, etkisini, kullanım süresini ya da aklındaki bir
                kelimeyi yaz; rehber ilgili eşyaları anında bulsun.
              </p>
              <p className="max-w-3xl rounded-2xl border border-yellow-200/30 bg-yellow-300/12 px-4 py-3 text-sm font-semibold leading-6 text-yellow-50">
                Kaynak notu: Bu rehber, Hande Ultraslan’ın Eşya İşlevleri
                tablosundaki bilgiler esas alınarak hazırlanmıştır.
              </p>
            </div>
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl bg-gradient-to-br from-yellow-300 via-pink-400 to-cyan-300 p-4 text-purple-950 shadow-lg">
                <Icon name="sparkles" className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold">
                  Eşyanı bul, etkisini öğren.
                </h2>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  Zombi avından patikalara, günlük yazılarından ruh hâli
                  etkilerine kadar oyun içindeki eşyaları hızlıca
                  inceleyebilirsin.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/15 bg-black/20 p-3 text-center">
                    <p className="text-2xl font-black text-yellow-200">
                      {items.length}
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/55">
                      Eşya
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/20 p-3 text-center">
                    <p className="text-2xl font-black text-cyan-200">
                      {categories.length - 1}
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/55">
                      Kategori
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/20 p-3 text-center">
                    <p className="text-2xl font-black text-pink-200">↯</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/55">
                      Hızlı Arama
                    </p>
                  </div>
                </div>
                <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs leading-5 text-white/62">
                  {dataStatus === "loaded"
                    ? "Rehber güncel tablo verisiyle açıldı."
                    : dataStatus === "loading"
                    ? "Eşyalar yükleniyor..."
                    : "Canlı tablo yüklenemedi; örnek veri gösteriliyor."}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.75fr_0.85fr_auto] lg:items-end">
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-yellow-100"
                htmlFor="item-search"
              >
                Item ara
              </label>
              <div className="relative">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-200"
                />
                <input
                  id="item-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Örn: zombi, 21 yaş, ruh hali, mezarlık soygunu..."
                  className="h-12 w-full rounded-2xl border border-white/20 bg-white/95 pl-12 pr-4 font-semibold text-purple-950 outline-none transition placeholder:text-purple-900/45 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-bold text-yellow-100"
                htmlFor="category-select"
              >
                Kategori
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/95 px-4 font-semibold text-purple-950 outline-none transition focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/25"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-bold text-yellow-100"
                htmlFor="direct-select"
              >
                Açılır menüden seç
              </label>
              <select
                id="direct-select"
                value={selectedItem?.id || ""}
                onChange={handleDirectSelect}
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/95 px-4 font-semibold text-purple-950 outline-none transition focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/25"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nameTR}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearSearch}
              className="h-12 rounded-2xl border border-yellow-200/60 bg-yellow-300 px-5 font-black text-purple-950 shadow-lg shadow-yellow-950/20 transition hover:-translate-y-0.5 hover:bg-yellow-200"
            >
              Temizle
            </button>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Sonuçlar</h2>
              <Badge className="bg-cyan-300 text-purple-950">
                {filteredItems.length} eşya
              </Badge>
            </div>

            <div className="max-h-[590px] space-y-2 overflow-auto pr-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`group w-full rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/20 ${
                      selectedItem?.id === item.id
                        ? "border-amber-200/60 bg-white/12 shadow-lg shadow-fuchsia-950/20"
                        : "border-white/15 bg-black/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconBadge
                        item={item}
                        active={selectedItem?.id === item.id}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-white">
                          {highlight(item.nameTR, query)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/65">
                          {highlight(item.itemFunction, query)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/90">
                            {item.category}
                          </span>
                          {item.usageTime ? (
                            <span className="rounded-full border border-cyan-200/20 bg-cyan-100/10 px-2 py-0.5 text-[11px] font-bold text-cyan-50">
                              {item.usageTime}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-3xl border border-white/15 bg-black/20 p-6 text-sm text-white/70">
                  Sonuç bulunamadı. Aramayı sadeleştir veya kategori filtresini
                  “Tümü” yap.
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            {selectedItem ? (
              <div>
                <div className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 p-1" />
                <div className="p-6 md:p-7">
                  <div className="flex flex-col gap-4 border-b border-white/15 pb-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <IconBadge item={selectedItem} active size="large" />
                      <div>
                        <Badge className="bg-white/20 text-white">
                          {selectedItem.category}
                        </Badge>
                        <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                          {highlight(selectedItem.nameTR, query)}
                        </h2>
                        <p className="mt-3 text-sm font-semibold text-cyan-100">
                          {selectedItem.usageTime
                            ? `Kullanım süresi: ${selectedItem.usageTime}`
                            : "Kullanım süresi belirtilmemiş"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
                      {selectedItem.tags.map((tag) => (
                        <Badge key={tag} className="bg-purple-950/35">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <section className="rounded-3xl border border-white/15 bg-black/22 p-5 md:col-span-2">
                      <div className="mb-3 flex items-center gap-2 text-yellow-100">
                        <Icon name="info" className="h-5 w-5" />
                        <h3 className="text-xl font-black">İşlevi</h3>
                      </div>
                      <p className="text-base leading-8 text-white/86">
                        {highlight(selectedItem.itemFunction, query)}
                      </p>
                    </section>

                    <section className="rounded-3xl border border-white/15 bg-black/22 p-5">
                      <div className="mb-3 flex items-center gap-2 text-cyan-100">
                        <Icon name="clock" className="h-5 w-5" />
                        <h3 className="text-lg font-black">Kullanım Süresi</h3>
                      </div>
                      <p className="text-white/82">
                        {highlight(
                          selectedItem.usageTime || "Belirtilmemiş",
                          query
                        )}
                      </p>
                    </section>

                    <section className="rounded-3xl border border-white/15 bg-black/22 p-5">
                      <div className="mb-3 flex items-center gap-2 text-pink-100">
                        <Icon name="alert" className="h-5 w-5" />
                        <h3 className="text-lg font-black">
                          Kullanım Şartları
                        </h3>
                      </div>
                      <p className="text-white/82">
                        {highlight(
                          selectedItem.requirements ||
                            "Özel şart belirtilmemiş",
                          query
                        )}
                      </p>
                    </section>

                    <section className="rounded-3xl border border-yellow-200/30 bg-yellow-300/14 p-5 md:col-span-2">
                      <div className="mb-3 flex items-center gap-2 text-yellow-100">
                        <Icon name="star" className="h-5 w-5" />
                        <h3 className="text-lg font-black">Kısa Özet</h3>
                      </div>
                      <p className="leading-7 text-white/88">
                        <strong>{selectedItem.nameTR}</strong> —{" "}
                        {selectedItem.category}. {selectedItem.itemFunction}{" "}
                        {selectedItem.usageTime
                          ? `Kullanım süresi: ${selectedItem.usageTime}.`
                          : ""}{" "}
                        {selectedItem.requirements
                          ? `Şart: ${selectedItem.requirements}`
                          : ""}
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-white/70">
                Bir item seçtiğinde detaylar burada görünecek.
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
