import { PrismaClient, ArticleStatus, NoteColor } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categoriesData = [
    { name: "Làm đẹp", slug: "lam-dep", description: "Sản phẩm chăm sóc da, mỹ phẩm và làm đẹp" },
    { name: "Thời trang", slug: "thoi-trang", description: "Xu hướng trang phục, phụ kiện thời trang" },
    { name: "Gia dụng", slug: "gia-dung", description: "Thiết bị và đồ dùng tiện ích gia đình" },
    { name: "Mẹ & bé", slug: "me-va-be", description: "Đồ dùng và sản phẩm an toàn cho mẹ và trẻ nhỏ" },
    { name: "Thực phẩm", slug: "thuc-pham", description: "Thực phẩm bổ dưỡng và ẩm thực" },
    { name: "Công nghệ", slug: "cong-nghe", description: "Thiết bị điện tử, điện thoại và phụ kiện số" },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, isActive: true },
        create: { name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
      })
    )
  );

  const tagsData = [
    { name: "review", slug: "review" },
    { name: "sale", slug: "sale" },
    { name: "hot", slug: "hot" },
    { name: "anessa", slug: "anessa" },
    { name: "lamdep", slug: "lamdep" },
    { name: "thoitrang", slug: "thoitrang" },
  ];

  const tags = await Promise.all(
    tagsData.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: { name: tag.name },
        create: { name: tag.name, slug: tag.slug },
      })
    )
  );

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const tagMap = new Map(tags.map((t) => [t.slug, t.id]));

  const now = new Date();
  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const articlesData = [
    {
      title: "Review kem chống nắng Anessa dưỡng ẩm kiềm dầu",
      slug: "review-kem-chong-nang-anessa-duong-am-kiem-dau",
      content: "<p>Đánh giá chi tiết dòng kem chống nắng quốc dân Anessa bảo vệ da toàn diện dưới ánh nắng hè.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("lam-dep"),
      publishedAt: pastDate,
      tagSlugs: ["review", "anessa", "lamdep"],
    },
    {
      title: "Top 5 serum phục hồi da mụn hiệu quả nhanh chóng",
      slug: "top-5-serum-phuc-hoi-da-mun-hieu-qua-nhanh-chong",
      content: "<p>Khám phá 5 loại tinh chất phục hồi màng ẩm và làm dịu nốt mụn viêm lành tính nhất hiện nay.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("lam-dep"),
      publishedAt: pastDate,
      tagSlugs: ["review", "hot", "lamdep"],
    },
    {
      title: "Bộ sưu tập thời trang công sở thanh lịch mùa thu",
      slug: "bo-suu-tap-thoi-trang-cong-so-thanh-lich-mua-thu",
      content: "<p>Gợi ý phối đồ công sở sang trọng, tôn dáng dành riêng cho các quý cô hiện đại.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("thoi-trang"),
      publishedAt: pastDate,
      tagSlugs: ["thoitrang", "hot"],
    },
    {
      title: "Săn deal giảm giá 50% áo khoác dạ ấm áp mùa đông",
      slug: "san-deal-giam-gia-50-ao-khoac-da-am-ap-mua-dong",
      content: "<p>Chương trình sale bùng nổ cuối tuần với hàng trăm mẫu áo dạ thiết kế cao cấp.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985",
      status: ArticleStatus.SCHEDULED,
      categoryId: categoryMap.get("thoi-trang"),
      publishedAt: futureDate,
      tagSlugs: ["sale", "thoitrang"],
    },
    {
      title: "Kinh nghiệm chọn máy hút bụi cầm tay cho căn hộ nhỏ",
      slug: "kinh-nghiem-chon-may-hut-bui-cam-tay-cho-can-ho-nho",
      content: "<p>Bí quyết tìm mua máy hút bụi nhỏ gọn, lực hút khỏe và độ ồn thấp cho gia đình.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("gia-dung"),
      publishedAt: pastDate,
      tagSlugs: ["review"],
    },
    {
      title: "Mẹo vệ sinh nồi chiên không dầu sạch bong không trầy xước",
      slug: "meo-ve-sinh-noi-chien-khong-dau-sach-bong-khong-tray-xuoc",
      content: "<p>Hướng dẫn làm sạch dầu mỡ bám dính trong khay chiên cực kỳ đơn giản bằng baking soda.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7",
      status: ArticleStatus.DRAFT,
      categoryId: categoryMap.get("gia-dung"),
      publishedAt: null,
      tagSlugs: ["review", "hot"],
    },
    {
      title: "Thực đơn ăn dặm tự chỉ huy cho bé từ 6 tháng tuổi",
      slug: "thuc-don-an-dam-tu-chi-huy-cho-be-tu-6-thang-tuoi",
      content: "<p>Cẩm nang dinh dưỡng và các món ăn dặm BLW hấp dẫn giúp bé hào hứng trong từng bữa ăn.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("me-va-be"),
      publishedAt: pastDate,
      tagSlugs: ["hot"],
    },
    {
      title: "Review xe đẩy gấp gọn du lịch cho bé dưới 3 tuổi",
      slug: "review-xe-day-gap-gon-du-lich-cho-be-duoi-3-tuoi",
      content: "<p>Chi tiết ưu nhược điểm của dòng xe đẩy gấp gọn một chạm siêu nhẹ mang lên máy bay.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1594824813589-98e6a2b8e39c",
      status: ArticleStatus.DRAFT,
      categoryId: categoryMap.get("me-va-be"),
      publishedAt: null,
      tagSlugs: ["review"],
    },
    {
      title: "Top 10 loại hạt dinh dưỡng tốt cho tim mạch và vóc dáng",
      slug: "top-10-loai-hat-dinh-duong-tot-cho-tim-mach-va-voc-dang",
      content: "<p>Bổ sung omega 3 và chất béo lành mạnh với các loại hạt macca, óc chó, hạnh nhân mỗi ngày.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed",
      status: ArticleStatus.ARCHIVED,
      categoryId: categoryMap.get("thuc-pham"),
      publishedAt: pastDate,
      tagSlugs: ["hot"],
    },
    {
      title: "Đánh giá tai nghe chống ồn không dây tốt nhất phân khúc 2 triệu",
      slug: "danh-gia-tai-nghe-chong-on-khong-day-tot-nhat-phan-khuc-2-trieu",
      content: "<p>Trải nghiệm chất âm chân thực và khả năng chống ồn chủ động ANC ấn tượng vượt mong đợi.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      status: ArticleStatus.PUBLISHED,
      categoryId: categoryMap.get("cong-nghe"),
      publishedAt: pastDate,
      tagSlugs: ["review", "hot"],
    },
    {
      title: "Lịch mở bán siêu phẩm công nghệ giảm giá mùa lễ hội",
      slug: "lich-mo-ban-sieu-pham-cong-nghe-giam-gia-mua-le-hoi",
      content: "<p>Thông tin độc quyền về các đợt flash sale thiết bị công nghệ lớn nhất năm.</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      status: ArticleStatus.SCHEDULED,
      categoryId: categoryMap.get("cong-nghe"),
      publishedAt: futureDate,
      tagSlugs: ["sale", "hot"],
    },
  ];

  for (const item of articlesData) {
    const article = await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        coverImageUrl: item.coverImageUrl,
        status: item.status,
        categoryId: item.categoryId,
        publishedAt: item.publishedAt,
        deletedAt: null,
      },
      create: {
        title: item.title,
        slug: item.slug,
        content: item.content,
        coverImageUrl: item.coverImageUrl,
        status: item.status,
        categoryId: item.categoryId,
        publishedAt: item.publishedAt,
      },
    });

    await prisma.articleTag.deleteMany({
      where: { articleId: article.id },
    });

    for (const tagSlug of item.tagSlugs) {
      const tagId = tagMap.get(tagSlug);
      if (tagId) {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: {
              articleId: article.id,
              tagId,
            },
          },
          update: {},
          create: {
            articleId: article.id,
            tagId,
          },
        });
      }
    }
  }

  const notesData = [
    {
      title: "Lên nội dung review sản phẩm Anessa tuần này",
      content: "Lên nội dung review sản phẩm Anessa tuần này",
      color: NoteColor.YELLOW,
    },
    {
      title: "Kiểm tra lại caption Facebook trước khi đăng",
      content: "Kiểm tra lại caption Facebook trước khi đăng",
      color: NoteColor.RED,
    },
    {
      title: "Chuẩn bị content chiến dịch tháng 9",
      content: "Chuẩn bị content chiến dịch tháng 9",
      color: NoteColor.TEAL,
    },
    {
      title: "Tổng hợp hình ảnh sản phẩm mới",
      content: "Tổng hợp hình ảnh sản phẩm mới",
      color: NoteColor.BLUE,
    },
    {
      title: "Trao đổi với Brand về nội dung",
      content: "Trao đổi với Brand về nội dung",
      color: NoteColor.BLACK,
    },
  ];

  for (const item of notesData) {
    const existing = await prisma.note.findFirst({
      where: { content: item.content, deletedAt: null },
    });
    if (!existing) {
      await prisma.note.create({
        data: item,
      });
    }
  }
}

main()
  .catch((error) => {
    process.stderr.write(String(error) + "\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
