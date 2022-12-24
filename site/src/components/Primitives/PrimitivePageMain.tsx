import { FaBrandsGithub } from "solid-icons/fa";
import { onMount, ParentComponent } from "solid-js";
import { Title } from "solid-start";
import Heading from "./Heading";
import InfoBar from "./InfoBar";
// import "../../primitives-page-main.css";
import ON_CLIENT_DEV_MODE from "~/hooks/ON_CLIENT_DEV_MODE";

const githubRepo = "https://github.com/solidjs-community/solid-primitives";

const PrimitivePageMain: ParentComponent<{
  packageName: string;
  name: string;
  stage: number;
}> = props => {
  const githubRepoPrimitve = `${githubRepo}/tree/main/packages/${props.name}`;

  // until issue is resolved https://github.com/solidjs/solid-start/issues/579
  ON_CLIENT_DEV_MODE(() => {
    document.documentElement.style.background = "#f2f8fa";
    document.documentElement.style.backgroundImage = "linear-gradient(94deg, #f2f8fa, #f1f3fa)";
  });

  return (
    <>
      <Title>{props.name}</Title>

      <div
        class="absolute top-0 left-0 right-0 h-[90vh] -z-1"
        style="background: linear-gradient(to bottom, #fff 200px, transparent);"
      />
      <main class="pt-[100px] mb-6 max-w-[900px] mx-auto">
        <div class="p-3 sm:p-8 rounded-3xl bg-white">
          <div class="flex justify-between gap-[100px] items-center text-[#232324] mb-[90px]">
            {/* <Heading>
              Has This Type Pattern Tried To Sneak In Some Generic Or Parameterized Type Pattern
              Matching Stuff Anywhere Visitor .java
            </Heading> */}

            <Heading>{props.name.replace("-", " ")}</Heading>
            <div>
              <a
                class="inline-block scale-90 sm:scale-100"
                href={githubRepoPrimitve}
                target="_blank"
              >
                <FaBrandsGithub size={28} />
              </a>
            </div>
          </div>

          <div class="my-8">
            <InfoBar packageName={props.packageName} name={props.name} stage={props.stage} />
          </div>

          <div class="prose">{props.children}</div>
        </div>
      </main>
    </>
  );
};

export default PrimitivePageMain;
