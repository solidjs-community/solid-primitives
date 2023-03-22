import { Component, createResource, Show } from "solid-js";
import { useParams, useRouteData } from "solid-start";
import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import { PackageData } from "~/types";

type Params = {
  name: string;
};

export function routeData() {
  const { name } = useParams<Params>();

  const [data] = createResource<PackageData>(
    () => import(`../../_generated/packages/${name}.json`),
  );

  return data;
}

const Page: Component = () => {
  const data = useRouteData<typeof routeData>();

  return (
    <Show when={data()} keyed>
      {data => (
        <PrimitivePageMain
          name={data.name}
          stage={data.stage}
          packageList={[]}
          primitiveList={data.exports}
        >
          <div innerHTML={data.readme} />
        </PrimitivePageMain>
      )}
    </Show>
  );
};

export default Page;
