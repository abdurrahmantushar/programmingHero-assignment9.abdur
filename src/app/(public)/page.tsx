import CategorySection from "../components/home/CategorySection";
import FeaturedMenu from "../components/home/FeaturedMenu";
import HeroSection from "../components/home/HeroSection";
import Navbar from "../components/shared/Navbar";

export default function Home() {
  return (
    <>
    <Navbar/>

    <main>
      <HeroSection/>
      <CategorySection/>
      <FeaturedMenu/>
    </main>
    </>
  );
}
