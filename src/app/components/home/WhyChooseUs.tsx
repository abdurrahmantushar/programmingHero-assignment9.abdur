
import {
  Bike,
  Award,
  ShieldCheck,
  Headset,
} from "lucide-react";

const features = [
  {
    icon: Bike,
    title: "Fast Delivery",
    description: "Get your favorite pizza delivered fresh and hot to your doorstep.",
  },
  {
    icon: Award,
    title: "Best Quality",
    description: "We use premium ingredients to make every bite delicious.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Enjoy safe and secure payment options for every order.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Our friendly support team is always here to help you.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#991B1B] py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group flex flex-col items-center text-center"
              >
                <div className="mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-white/20">
                  <Icon
                    size={36}
                    strokeWidth={1.7}
                    className="text-white"
                  />
                </div>

                <h3 className="mb-3 text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="max-w-[260px] text-sm leading-7 text-white/75">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
