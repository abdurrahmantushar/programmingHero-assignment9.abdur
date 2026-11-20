
import {
  Store,
  Pizza,
  MapPin,
  Bike,
} from "lucide-react";;

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Choose Restaurent",
    description: "Browse your favorite pizza restaurents.",
  },
  {
    number: "02",
    icon: Pizza,
    title: "Pick Your Pizza",
    description: "Choose from delicious menu items.",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Add Details",
    description: "Provide delivery address and delivery date.",
  },
  {
    number: "04",
    icon: Bike,
    title: "Place Order",
    description: "Place order and enjoy your hot pizza.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full bg-[#FFF8F0] py-16 sm:py-20"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-[3px] text-[#E6392E]">
            Simple Process
          </span>

          <h2 className="text-3xl font-extrabold text-[#25211E] sm:text-4xl">
            Order in 4 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[#F2B8A8] bg-white transition-all duration-300 group-hover:border-[#E6392E] group-hover:bg-[#FFF0EA]">
                    <Icon
                      size={38}
                      strokeWidth={1.7}
                      className="text-[#E6392E]"
                    />
                  </div>

                  <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E6392E] text-xs font-bold text-white shadow-md">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-[#25211E]">
                  {step.title}
                </h3>

                <p className="max-w-[260px] text-sm leading-7 text-[#77716B]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
