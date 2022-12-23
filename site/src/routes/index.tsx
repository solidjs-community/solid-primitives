import { Title } from "solid-start";
import PrimitivesTable from "~/components/Primitives/PrimitivesTable";
import solidSquaresImg from "~/assets/img/solid-squares.webp";
import Header from "~/components/Header/Header";

export default function Home() {
  return (
    <>
      <main class="pt-[60px]">
        <Title>Solid Primitives</Title>
        <div class="p-4 sm:pt-[5vh] md:pt-[10vh] leading-7 max-w-[720px] mx-auto min-h-[50vh]">
          <p class="py-3 sm:text-lg md:text-2xl">
            A project that strives to develop high-quality, community contributed Solid primitives.
            {/* All utilities are well tested and continuously maintained. */}
          </p>
          <div class="relative mt-4 mb-10 text-[14px] sm:text-base md:text-lg">
            <ul class="flex gap-4">
              <li>
                <div class="text-[#30889c] font-semibold">Small</div>
                <div>
                  aggregate <span class="whitespace-nowrap">tree-shaking</span> benefits
                </div>
              </li>
              <li>
                <div class="text-[#3769a5] font-semibold">Isomorphic</div>
                <div>client and server side functionality</div>
              </li>
              <li>
                <div class="text-[#3c5098] font-semibold">Stable</div>
                <div>consistent and managed testing + maintenance</div>
              </li>
            </ul>
            <img
              class="absolute top-[20%] left-0 right-0 bottom-0 -z-1 opacity-70 object-cover"
              src={solidSquaresImg}
              alt=""
            />
          </div>
        </div>
        <PrimitivesTable />
      </main>
    </>
  );
}
