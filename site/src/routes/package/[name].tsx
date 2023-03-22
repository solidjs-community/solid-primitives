import { Component, createResource } from "solid-js";
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
    <PrimitivePageMain data={data() ?? null}>
      <div innerHTML={data()?.readme} />
    </PrimitivePageMain>
  );
};

export default Page;
