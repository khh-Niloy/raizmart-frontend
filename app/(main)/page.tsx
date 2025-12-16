import dynamic from "next/dynamic";
import React from "react";
import ExploreCollectionsButton from "@/components/main/landing/ExploreCollectionsButton";
import WhyChooseUs from "@/components/main/landing/whyChooseUs/WhyChooseUs";

const Slider = dynamic(() => import("@/components/main/landing/Slider/Slider"), {
  loading: () => (
    <div className="relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[520px] w-full rounded-3xl bg-gray-200 animate-pulse" />
  ),
});

const OtherImages = dynamic(
  () => import("@/components/main/landing/OtherImages/OtherImages"),
  {
    loading: () => (
      <div className="h-[260px] w-full rounded-2xl bg-gray-100 animate-pulse" />
    ),
  }
);

const FeaturedProducts = dynamic(
  () => import("@/components/main/landing/FeaturedProducts/FeaturedProducts"),
  {
    loading: () => <div className="h-[420px] w-full rounded-2xl bg-gray-100 animate-pulse" />,
  }
);

const BrandProducts = dynamic(
  () => import("@/components/main/landing/BrandProducts/BrandProducts"),
  {
    loading: () => <div className="h-[420px] w-full rounded-2xl bg-gray-100 animate-pulse" />,
  }
);

const NewArrivals = dynamic(
  () => import("@/components/main/landing/NewArrivals/NewArrivals"),
  {
    loading: () => <div className="h-[420px] w-full rounded-2xl bg-gray-100 animate-pulse" />,
  }
);

const TrendingProducts = dynamic(
  () => import("@/components/main/landing/TrendingProducts/TrendingProducts"),
  {
    loading: () => <div className="h-[420px] w-full rounded-2xl bg-gray-100 animate-pulse" />,
  }
);

const faqs = [
  {
    question: "How quickly will my order arrive?",
    answer:
      "Most in-stock items ship within 24 hours. Standard delivery takes 2-4 business days nationwide, and you can track every stage from your dashboard.",
  },
  {
    question: "Do you offer installment or Buy Now Pay Later options?",
    answer:
      "Yes. At checkout you can choose from flexible payment plans powered by our banking partners, including interest-free installments on select products.",
  },
  {
    question: "What is the warranty for electronics purchased on Raizmart?",
    answer:
      "Official brand warranties apply to all electronics. You also get our 7-day product guarantee—if there’s a manufacturing defect, we handle the replacement.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Absolutely. Initiate a return from your orders page within 7 days of delivery. Our support team will arrange pickup or drop-off based on your location.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative pt-10">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#e6fbf9] via-white/60 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-16 pb-16">
          {/* Hero Section */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-14 md:pt-8 mt-20 md:mt-0 lg:pt-12">
            <section className="rounded-3xl border border-white/80 bg-white/95 shadow-[0_50px_120px_-60px_rgba(5,150,145,0.55)] backdrop-blur-sm transition">
              <div className="flex flex-col gap-10 p-6 sm:p-8 lg:p-12">
                <div className="flex md:flex-row flex-col gap-10 md:gap-0 justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#02C1BE]">
                      Your trusted marketplace
                    </p>

                    <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
                      Shop with convenient payment methods, fast delivery, and
                      dedicated customer support.
                    </p>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <ExploreCollectionsButton />
                      <div className="flex gap-6 text-sm text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-900">Happy customers</p>
                          <p>Seamless interaction</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Trusted brands</p>
                          <p>Premium selection</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <h1 className="text-3xl sm:text-4xl md:text-right text-left lg:text-5xl font-bold text-slate-900 leading-tight">
                      Discover premium tech and lifestyle essentials
                    </h1>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                  <div className="order-1 space-y-6 lg:order-none">
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_40px_90px_-60px_rgba(5,150,145,0.5)]">
                      <Slider />
                    </div>
                  </div>
                  <div className="order-2 flex flex-col gap-4 lg:order-none lg:self-stretch">
                    <div className="flex-1 min-h-[260px]">
                      <OtherImages />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mx-auto w-[95%]">
            <div className="flex flex-col gap-4 ">
              <div id="featured-products" className="">
                <FeaturedProducts />
              </div>
              <div className="">
                <TrendingProducts />
              </div>
              <div className="">
                <NewArrivals />
              </div>
              <div className="">
                <BrandProducts />
              </div>
            </div>
          </div>

          <div className=" w-[95%] mx-auto px-4 sm:px-6 lg:px-14">
            <WhyChooseUs />
          </div>

          <section
            id="faq"
            className=" w-[95%] mx-auto px-4 sm:px-6 lg:px-14 pb-16"
          >
            <div className="rounded-3xl border border-white/80 bg-white/95 p-8 shadow-[0_40px_100px_-70px_rgba(5,150,145,0.4)]">
              <div className="max-w-3xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#02C1BE]">
                  FAQ
                </p>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Answers to what shoppers ask the most
                </h2>
                <p className="text-base text-slate-600">
                  We combine reliable fulfillment, flexible payments, and local
                  support to make every purchase stress-free. Here are a few
                  quick answers before you get started.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-2xl border border-slate-100 bg-white p-6 [summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-4 text-left text-base font-semibold text-slate-800 transition group-open:text-[#02C1BE]">
                      {faq.question}
                      <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-slate-200 text-xs font-medium text-slate-500 transition group-open:border-[#02C1BE]/40 group-open:text-[#02C1BE] group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
