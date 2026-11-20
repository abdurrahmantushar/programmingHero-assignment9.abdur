import CategorySection from "../components/home/CategorySection";
import FeaturedMenu from "../components/home/FeaturedMenu";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import WhyChooseUs from "../components/home/WhyChooseUs";

export default function Home() {
  return (
    
    <main>
      <HeroSection/>
      <CategorySection/>
      <FeaturedMenu/>
      <WhyChooseUs/>
      <HowItWorks/>
    </main>

  );
}
