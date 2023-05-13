import { Component, createResource, Show, Suspense } from "solid-js";
import { NoHydration } from "solid-js/web";
import { Title, useRouteData } from "solid-start";
import { fetchHomeContent, fetchPackageList } from "~/api";
import { HEADER_HEIGHT } from "~/components/Header/Header";
import PrimitiveBtn from "~/components/Primitives/PrimitiveBtn";
import PrimitiveBtnLineWrapper from "~/components/Primitives/PrimitiveBtnLineWrapper";
import { SizeBadgeWrapper, SizeBadge } from "~/components/Primitives/SizeBadge";
import StageBadge from "~/components/Primitives/StageBadge";
import { VersionBadge } from "~/components/Primitives/VersionBadge";
import { H2 } from "~/components/prose";
import { StageContent } from "~/components/Stage/Stage";
import * as Table from "~/components/table";
import { PackageListItem } from "~/types";

const Header: Component = () => {
  return (
    <div class="mx-auto min-h-[35vh] max-w-[720px] overflow-clip p-4 leading-7 sm:min-h-[50vh] sm:pt-[5vh] md:pt-[10vh]">
      <p class="py-3 sm:text-lg md:text-2xl">
        A project that strives to develop high-quality, community contributed Solid{" "}
        <strong>Primitives</strong>.
        {/* All utilities are well tested and continuously maintained. */}
      </p>
      <div class="relative mb-10 mt-4 text-[14px] sm:text-base md:text-lg">
        <ul class="flex gap-4">
          <li>
            <div class="font-semibold text-[#30889c] dark:text-[#44bfdb]">Small</div>
            <div>
              aggregate <span class="whitespace-nowrap">tree-shaking</span> benefits
            </div>
          </li>
          <li>
            <div class="font-semibold text-[#3769a5] dark:text-[#5aa5ff]">Isomorphic</div>
            <div>client and server side functionality</div>
          </li>
          <li>
            <div class="font-semibold text-[#3c5098] dark:text-[#6586ff]">Stable</div>
            <div>consistent and managed testing + maintenance</div>
          </li>
        </ul>
        <svg
          class="-z-1 mask-image-[linear-gradient(to_bottom,transparent,#000_30%)] sm:mask-image-[linear-gradient(to_bottom,transparent,#000_20%)] pointer-events-none absolute -left-6 -right-8 top-[20%] opacity-60 sm:-left-4 sm:-right-4"
          viewBox="0 0 188.975 179.46"
          // @ts-ignore
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g style="transform: scale(1.26) translate(-27px, 12px); transform-origin: center;">
            <use href="#solid-blocks-header-cluster-e" transform="translate(75 -27)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(115 -2)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(64 19)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(113 12)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(98 19)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(16 -21)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(1 3)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(17 12)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(62 -18)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(49 -7.5)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(34 1)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(78 -8)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(64 1)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(49 9.5)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(93.3 0.5)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(79 9.5)" />
          </g>
        </svg>
      </div>
    </div>
  );
};

const PrimitivesTable: Component<{ packages: PackageListItem[] | undefined }> = props => {
  // TODO - table should be dynamic - don't assume all elements are static
  return (
    <Show when={props.packages} keyed>
      {packages => {
        // group packages by category
        const categories = packages.reduce((acc: Record<string, PackageListItem[]>, pkg) => {
          const category = acc[pkg.category];
          if (category) category.push(pkg);
          else acc[pkg.category] = [pkg];
          return acc;
        }, {});

        return (
          <Table.Table>
            <Table.THead>
              <Table.TH>Name</Table.TH>
              <Table.TH>Stage</Table.TH>
              <Table.TH>Primitives</Table.TH>
              <Table.TH>Size</Table.TH>
              <Table.TH>NPM</Table.TH>
            </Table.THead>
            <tbody>
              {Object.entries(categories).map(([category, packages]) => (
                <>
                  <Table.TR>
                    <Table.TD withH4>{category}</Table.TD>
                    <Table.TD></Table.TD>
                    <Table.TD></Table.TD>
                    <Table.TD></Table.TD>
                    <Table.TD></Table.TD>
                  </Table.TR>
                  {packages.map(pkg => (
                    <Table.TR>
                      <Table.TD>
                        <PrimitiveBtn href={pkg.name}>{pkg.name}</PrimitiveBtn>
                      </Table.TD>
                      <Table.TD>
                        <StageBadge value={pkg.stage} />
                      </Table.TD>
                      <Table.TD>
                        {pkg.primitives.map(primitive => (
                          <PrimitiveBtnLineWrapper primitiveName={`${pkg.name}_${primitive.name}`}>
                            <PrimitiveBtn href={`${pkg.name}#${primitive.name}`}>
                              {primitive.name}
                            </PrimitiveBtn>
                          </PrimitiveBtnLineWrapper>
                        ))}
                      </Table.TD>
                      <Table.TD>
                        {pkg.primitives.map(primitive => (
                          <SizeBadgeWrapper primitiveName={`${pkg.name}_${primitive.name}`}>
                            <NoHydration>
                              <SizeBadge
                                value={primitive.gzip}
                                packageName={pkg.name}
                                exportName={primitive.name}
                                peerDependencies={pkg.peerDependencies}
                              />
                            </NoHydration>
                          </SizeBadgeWrapper>
                        ))}
                      </Table.TD>
                      <Table.TD>
                        <VersionBadge name={pkg.name} version={pkg.version} />
                      </Table.TD>
                    </Table.TR>
                  ))}
                </>
              ))}
            </tbody>
          </Table.Table>
        );
      }}
    </Show>
  );
};

export function routeData() {
  const [content] = createResource(() => fetchHomeContent());
  const [packages] = createResource(() => fetchPackageList());

  return { content, packages };
}

export default function Home() {
  const { content, packages } = useRouteData<typeof routeData>();

  return (
    <main style={{ "padding-top": `${HEADER_HEIGHT}px` }}>
      <Title>Solid Primitives</Title>
      <Header />

      <div class="relative top-[-100px]">
        <h2 id="primitives" class="sr-only">
          Primitives
        </h2>
      </div>
      <PrimitivesTable packages={packages()} />

      <div class="mx-auto mt-[125px] max-w-[864px] p-4 leading-7">
        <NoHydration>
          <div class="prose">
            <H2 text="Contribution Process" />
            <br />
            <StageContent />
            <Suspense>
              <div innerHTML={content()} />
            </Suspense>
          </div>
        </NoHydration>
      </div>
    </main>
  );
}
